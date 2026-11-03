import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createApp } from '../server.js';

let requisicaoAnthropic;
let servidor;
let origem;
const senhaDeTeste = 'senha-de-teste-segura-123456';

const app = createApp({
  apiKey: 'chave-de-teste',
  accessPassword: senhaDeTeste,
  sessionSecret: 'segredo-de-teste-com-mais-de-32-caracteres',
  model: 'claude-haiku-5-5',
  anthropicClient: {
    messages: {
      create: async (request) => {
        requisicaoAnthropic = request;
        return { content: [{ type: 'text', text: 'Comece por [Introdução à IA](material.html).' }] };
      }
    }
  }
});

before(async () => {
  servidor = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => servidor.once('listening', resolve));
  origem = `http://127.0.0.1:${servidor.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => servidor.close((error) => error ? reject(error) : resolve()));
});

test('serve as páginas públicas sem expor arquivos de servidor', async () => {
  const pagina = await fetch(`${origem}/catalogo.html`);
  assert.equal(pagina.status, 200);
  assert.match(await pagina.text(), /Catálogo completo/);

  const codigoServidor = await fetch(`${origem}/server.js`);
  assert.equal(codigoServidor.status, 404);

  const ambiente = await fetch(`${origem}/.env`);
  assert.equal(ambiente.status, 404);

  const pacote = await fetch(`${origem}/package.json`);
  assert.equal(pacote.status, 404);
});

test('responde com JSON quando recebe corpo inválido na API', async () => {
  const resposta = await fetch(`${origem}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{invalido'
  });

  assert.equal(resposta.status, 400);
  assert.match(resposta.headers.get('content-type'), /application\/json/);
  assert.match((await resposta.json()).erro, /requisição enviada é inválida/i);
});

test('protege o chat, valida senha e chama o modelo configurado', async () => {
  const bloqueada = await fetch(`${origem}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pergunta: 'O que devo estudar?' })
  });
  assert.equal(bloqueada.status, 401);

  const senhaIncorreta = await fetch(`${origem}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senha: 'errada' })
  });
  assert.equal(senhaIncorreta.status, 401);

  const autenticacao = await fetch(`${origem}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senha: senhaDeTeste })
  });
  assert.equal(autenticacao.status, 200);
  const cookie = autenticacao.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Strict/);
  const cookieSessao = cookie.split(';', 1)[0];

  const conversa = await fetch(`${origem}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieSessao },
    body: JSON.stringify({ pergunta: 'Por onde começo?', historico: [] })
  });
  assert.equal(conversa.status, 200);
  assert.match((await conversa.json()).resposta, /Introdução à IA/);
  assert.equal(requisicaoAnthropic.model, 'claude-haiku-5-5');
  assert.match(requisicaoAnthropic.system, /projeto acadêmico/);
});

test('recusa senha fraca na configuração de produção', () => {
  assert.throws(() => createApp({
    nodeEnv: 'production',
    apiKey: 'chave-de-teste',
    accessPassword: 'senha-fraca',
    sessionSecret: 'segredo-de-teste-com-mais-de-32-caracteres',
    anthropicClient: { messages: { create: async () => ({ content: [] }) } }
  }), /senha de acesso forte/);
});