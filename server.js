import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const sessionDurationMs = 12 * 60 * 60 * 1000;
const sessionCookie = 'webai_ai_session';
const publicFiles = new Set([
  'catalogo.html',
  'index.html',
  'material-ethics.html',
  'material-ml.html',
  'material.html',
  'script.js',
  'styles.css'
]);

const systemPrompt = `Você é o assistente oficial da WebAI Materials. Responda em português brasileiro, com tom acolhedor, claro, organizado e adequado a estudantes iniciantes. Use títulos curtos, listas quando ajudarem e detalhes objetivos; evite respostas longas sem necessidade.

Formate respostas usando somente Markdown leve que o chat interpreta: títulos com ##, listas com - ou 1., negrito com **texto** e links internos no formato [nome](arquivo.html). Não use tabelas, blocos de código, HTML nem outros recursos Markdown.

O site é um projeto acadêmico de Desenvolvimento Web do curso de Inteligência Artificial do Piauí Instituto Tecnológico (PIT). É uma plataforma fictícia que apresenta cadernos de estudo sobre IA. Os materiais são gratuitos e fictícios; o site não oferece certificado nem download real. O formulário e o WhatsApp são demonstrações de interface.

Catálogo confirmado:
- Introdução à IA: nível iniciante, 4 módulos; conceitos essenciais, como a IA aprende e onde aparece. Link: [Introdução à IA](material.html).
- Aplicações Reais de IA: nível intermediário, 3 módulos; modelos, padrões, aprendizado de máquina e exemplos em áreas como saúde, logística e atendimento. Link: [Aplicações Reais de IA](material-ml.html).
- Ética e Futuro: nível intermediário, 3 módulos; viés, responsabilidade, impacto e escolhas humanas no uso da IA. Link: [Ética e Futuro](material-ethics.html).
- O catálogo completo está em [Catálogo](catalogo.html); a página inicial está em [Início](index.html).
- Caminho recomendado: Introdução à IA, Aplicações Reais de IA e, por fim, Ética e Futuro. Estudando um módulo por semana, cada caderno leva aproximadamente um mês.
- Para acessar um caderno, a página apresenta o botão “Quero este material”; o fluxo é demonstrativo e não entrega um arquivo real.
- Para contato, indique a seção de contato da página inicial; os canais exibidos são demonstrativos.

Responda perguntas gerais sobre conceitos de IA de modo introdutório, mas não invente funcionalidades, preços, conteúdo de módulos ou fatos sobre o projeto. Se a pergunta não tiver relação com o site, o catálogo ou fundamentos de IA, explique brevemente o escopo do assistente. Ao recomendar conteúdo, use somente os links Markdown e destinos exatos listados acima. Nunca produza HTML.`;

function safeEqual(left, right) {
  const leftDigest = createHash('sha256').update(left).digest();
  const rightDigest = createHash('sha256').update(right).digest();
  return timingSafeEqual(leftDigest, rightDigest);
}

function readCookie(request, name) {
  const cookies = request.headers.cookie || '';
  const cookie = cookies.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  if (!cookie) return '';
  try {
    return decodeURIComponent(cookie.slice(name.length + 1));
  } catch {
    return '';
  }
}

function createSessionToken(expiresAt, secret) {
  const timestamp = String(expiresAt);
  const signature = createHmac('sha256', secret).update(timestamp).digest('hex');
  return `${timestamp}.${signature}`;
}

function hasValidSession(request, secret) {
  if (!secret) return false;

  const [expiresAt, signature, extra] = readCookie(request, sessionCookie).split('.');
  if (!expiresAt || !signature || extra || !/^\d+$/.test(expiresAt) || Number(expiresAt) <= Date.now()) {
    return false;
  }

  const expected = createHmac('sha256', secret).update(expiresAt).digest();
  let received;
  try {
    received = Buffer.from(signature, 'hex');
  } catch {
    return false;
  }

  return received.length === expected.length && timingSafeEqual(received, expected);
}

function cookieOptions(isProduction, maxAge) {
  return `Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${isProduction ? '; Secure' : ''}`;
}

function createRateLimiter(windowMs, limit, message) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { erro: message }
  });
}

export function createApp(options = {}) {
  const isProduction = (options.nodeEnv ?? process.env.NODE_ENV) === 'production';
  const apiKey = options.apiKey ?? process.env.ANTHROPIC_API_KEY;
  const accessPassword = options.accessPassword ?? process.env.ASSISTANT_ACCESS_PASSWORD;
  const sessionSecret = options.sessionSecret ?? process.env.SESSION_SECRET ?? (isProduction ? '' : randomBytes(32).toString('hex'));
  const model = options.model ?? process.env.ANTHROPIC_MODEL ?? 'claude-haiku-5-5';
  const anthropic = options.anthropicClient ?? (apiKey ? new Anthropic({ apiKey }) : null);

  if (isProduction && (!apiKey || !accessPassword || accessPassword.length < 20 || sessionSecret.length < 32)) {
    throw new Error('Em produção, configure a chave Anthropic, uma senha de acesso forte e SESSION_SECRET com pelo menos 32 caracteres.');
  }

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '8kb' }));

  const authLimiter = createRateLimiter(15 * 60 * 1000, 8, 'Muitas tentativas. Aguarde 15 minutos e tente novamente.');
  const chatLimiter = createRateLimiter(60 * 1000, 20, 'Limite de mensagens atingido. Aguarde um minuto.');
  const exigirSessao = (request, response, next) => {
    if (!hasValidSession(request, sessionSecret)) {
      return response.status(401).json({ erro: 'Ative o assistente com /ia para continuar.' });
    }
    next();
  };

  app.get('/api/session', (request, response) => {
    response.set('Cache-Control', 'no-store');
    response.json({ autenticado: hasValidSession(request, sessionSecret) });
  });

  app.post('/api/auth', authLimiter, (request, response) => {
    if (!apiKey || !accessPassword || !sessionSecret || !anthropic) {
      return response.status(503).json({ erro: 'Assistente ainda não configurado. Confira as variáveis do arquivo .env.' });
    }

    const senha = typeof request.body?.senha === 'string' ? request.body.senha : '';
    if (!senha || senha.length > 200 || !safeEqual(senha, accessPassword)) {
      return response.status(401).json({ erro: 'Senha incorreta.' });
    }

    const expiresAt = Date.now() + sessionDurationMs;
    const token = createSessionToken(expiresAt, sessionSecret);
    response.set('Cache-Control', 'no-store');
    response.set('Set-Cookie', `${sessionCookie}=${encodeURIComponent(token)}; ${cookieOptions(isProduction, sessionDurationMs / 1000)}`);
    response.json({ autenticado: true });
  });

  app.post('/api/logout', (request, response) => {
    response.set('Set-Cookie', `${sessionCookie}=; ${cookieOptions(isProduction, 0)}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
    response.status(204).end();
  });

  app.post('/api/chat', chatLimiter, exigirSessao, async (request, response) => {
    const pergunta = typeof request.body?.pergunta === 'string' ? request.body.pergunta.trim() : '';
    if (!pergunta || pergunta.length > 1200) {
      return response.status(400).json({ erro: 'A pergunta deve ter entre 1 e 1200 caracteres.' });
    }

    if (!anthropic) {
      return response.status(503).json({ erro: 'Configure ANTHROPIC_API_KEY no arquivo .env para usar o Claude.' });
    }

    const historico = Array.isArray(request.body?.historico)
      ? request.body.historico.slice(-10).flatMap((mensagem) => {
          if (!['user', 'assistant'].includes(mensagem?.role) || typeof mensagem.content !== 'string') return [];
          return [{ role: mensagem.role, content: mensagem.content.slice(0, 1200) }];
        })
      : [];

    try {
      const resultado = await anthropic.messages.create({
        model,
        max_tokens: 800,
        system: systemPrompt,
        messages: [...historico, { role: 'user', content: pergunta }]
      });
      const resposta = resultado.content
        .filter((bloco) => bloco.type === 'text')
        .map((bloco) => bloco.text)
        .join('\n')
        .trim();

      response.set('Cache-Control', 'no-store');
      response.json({ resposta: resposta || 'Não consegui formular uma resposta. Tente perguntar de outro jeito.' });
    } catch (error) {
      console.error('Falha ao consultar a API da Anthropic:', error.status || error.name || 'erro desconhecido');
      response.status(502).json({ erro: 'O Claude não respondeu agora. Tente novamente em instantes.' });
    }
  });

  app.get('/', (request, response) => response.sendFile(resolve(root, 'index.html')));
  for (const arquivo of publicFiles) {
    app.get(`/${arquivo}`, (request, response) => {
      const caminho = resolve(root, arquivo);
      if (!existsSync(caminho)) return response.sendStatus(404);
      response.sendFile(caminho);
    });
  }

  app.use('/api', (error, request, response, next) => {
    if (response.headersSent) return next(error);
    const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500 ? error.status : 500;
    response.status(status).json({ erro: status === 400 ? 'A requisição enviada é inválida.' : 'Erro interno da API.' });
  });
  app.use('/api', (request, response) => response.status(404).json({ erro: 'Rota da API não encontrada.' }));
  app.use((request, response) => response.sendStatus(404));

  return app;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const app = createApp();
  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || '127.0.0.1';
  app.listen(port, host, () => console.log(`WebAI Materials disponível em http://${host}:${port}`));
}