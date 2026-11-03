document.addEventListener('DOMContentLoaded', () => {

  const themeToggle = document.getElementById('theme-toggle');
  const isDark = localStorage.getItem('theme') === 'dark';

  document.body.classList.toggle('dark-theme', isDark);

  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-theme');
      themeToggle.setAttribute('aria-pressed', String(isDark));
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }

  const popup = document.getElementById('popup');
  const botaoAbrir = document.getElementById('abrir-popup');
  const botaoFechar = document.getElementById('fechar-popup');

  if (popup && botaoAbrir && botaoFechar) {
    botaoAbrir.addEventListener('click', () => {
      popup.showModal();
    });

    botaoFechar.addEventListener('click', () => {
      popup.close();
    });

    popup.addEventListener('click', (evento) => {
      if (evento.target === popup) {
        popup.close();
      }
    });
  }

  const formulario = document.getElementById('form-contato');
  const aviso = document.getElementById('form-aviso');

  if (formulario && aviso) {
    formulario.addEventListener('submit', (evento) => {
      evento.preventDefault();

      const nome = document.getElementById('nome').value;
      aviso.textContent = 'Obrigado, ' + nome + '! Sua mensagem foi enviada (simulação).';
      formulario.reset();
    });
  }

  const chatBotao = document.getElementById('chat-botao');
  const chatJanela = document.getElementById('chat-janela');
  const chatFechar = document.getElementById('chat-fechar');
  const chatMensagens = document.getElementById('chat-mensagens');
  const chatForm = document.getElementById('chat-form');
  const chatCampo = document.getElementById('chat-campo');
  const chatPerguntas = document.querySelectorAll('.chat-pergunta');
  const chatEnviar = chatForm?.querySelector('button[type="submit"]');
  const chatStatus = document.querySelector('.chat-topo span');
  let assistenteIAAtivo = false;
  let aguardandoSenhaIA = false;
  let historicoIA = [];

  const paginasMateriais = new Set([
    'index.html',
    'catalogo.html',
    'material.html',
    'material-ml.html',
    'material-ethics.html'
  ]);

  function adicionarMensagem(texto, autor, formatada = false) {
    const mensagem = document.createElement(formatada ? 'div' : 'p');
    mensagem.className = 'chat-msg chat-msg-' + autor;

    if (formatada) {
      renderizarRespostaIA(mensagem, texto);
    } else {
      mensagem.textContent = texto;
    }

    chatMensagens.appendChild(mensagem);
    chatMensagens.scrollTop = chatMensagens.scrollHeight;
    return mensagem;
  }

  function adicionarTextoFormatado(elemento, texto) {
    const marcacao = /\[([^\]]+)\]\((index|catalogo|material|material-ml|material-ethics)\.html\)|\*\*([^*\n]+)\*\*/g;
    let inicio = 0;

    for (const trecho of texto.matchAll(marcacao)) {
      elemento.append(document.createTextNode(texto.slice(inicio, trecho.index)));

      if (trecho[2]) {
        const destino = trecho[2] + '.html';
        if (paginasMateriais.has(destino)) {
          const link = document.createElement('a');
          link.href = destino;
          link.textContent = trecho[1];
          elemento.append(link);
        } else {
          elemento.append(document.createTextNode(trecho[0]));
        }
      } else {
        const destaque = document.createElement('strong');
        destaque.textContent = trecho[3];
        elemento.append(destaque);
      }

      inicio = trecho.index + trecho[0].length;
    }

    elemento.append(document.createTextNode(texto.slice(inicio)));
  }

  function renderizarRespostaIA(elemento, texto) {
    let listaAtual = null;

    texto.split(/\r?\n/).forEach((linha) => {
      const conteudo = linha.trim();
      if (!conteudo) {
        listaAtual = null;
        return;
      }

      const titulo = conteudo.match(/^#{1,3}\s+(.+)$/);
      if (titulo) {
        listaAtual = null;
        const cabecalho = document.createElement('h4');
        cabecalho.className = 'chat-resposta-titulo';
        adicionarTextoFormatado(cabecalho, titulo[1]);
        elemento.append(cabecalho);
        return;
      }

      const itemLista = conteudo.match(/^[-*]\s+(.+)$/);
      const itemNumerado = conteudo.match(/^\d+[.)]\s+(.+)$/);
      if (itemLista || itemNumerado) {
        const tagLista = itemNumerado ? 'ol' : 'ul';
        if (!listaAtual || listaAtual.tagName.toLowerCase() !== tagLista) {
          listaAtual = document.createElement(tagLista);
          listaAtual.className = 'chat-resposta-lista';
          elemento.append(listaAtual);
        }

        const item = document.createElement('li');
        adicionarTextoFormatado(item, (itemLista || itemNumerado)[1]);
        listaAtual.append(item);
        return;
      }

      listaAtual = null;
      const paragrafo = document.createElement('p');
      paragrafo.className = 'chat-resposta-paragrafo';
      adicionarTextoFormatado(paragrafo, conteudo);
      elemento.append(paragrafo);
    });
  }

  function atualizarEstadoIA() {
    if (!chatStatus) return;
    chatStatus.textContent = assistenteIAAtivo
      ? 'Claude Haiku 5.5 ativo · /sair para encerrar'
      : 'Digite /ia para ativar Claude Haiku 5.5';
  }

  async function lerRespostaApi(resposta, mensagemPadrao) {
    let dados = {};
    const corpo = await resposta.text();

    if (corpo.trim()) {
      try {
        dados = JSON.parse(corpo);
      } catch {
        if (resposta.ok) {
          throw new Error('O servidor retornou uma resposta inválida. Reinicie o servidor local e tente novamente.');
        }
      }
    }

    if (!resposta.ok) {
      throw new Error(dados.erro || `${mensagemPadrao} (HTTP ${resposta.status}).`);
    }

    return dados;
  }

  async function verificarSessaoIA() {
    try {
      const resposta = await fetch('/api/session');
      const dados = await lerRespostaApi(resposta, 'Não foi possível verificar a sessão');
      assistenteIAAtivo = dados.autenticado === true;
      atualizarEstadoIA();
    } catch {
      if (chatStatus) chatStatus.textContent = 'Assistente local · servidor Claude indisponível';
    }
  }

  async function autenticarIA(senha) {
    const resposta = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha })
    });
    const dados = await lerRespostaApi(resposta, 'Não foi possível ativar o assistente');

    assistenteIAAtivo = true;
    historicoIA = [];
    atualizarEstadoIA();
    adicionarMensagem('Acesso autorizado. Sou o Claude Haiku 5.5 da WebAI Materials. Pergunte sobre o site, os materiais ou conceitos de IA.', 'bot');
  }

  async function encerrarSessaoIA() {
    await fetch('/api/logout', { method: 'POST' });
    assistenteIAAtivo = false;
    historicoIA = [];
    atualizarEstadoIA();
    adicionarMensagem('Sessão do Claude encerrada. O assistente local continua disponível.', 'bot');
  }

  async function perguntarIA(pergunta) {
    const carregando = adicionarMensagem('', 'bot');
    carregando.classList.add('chat-msg-carregando');
    carregando.setAttribute('role', 'status');
    carregando.setAttribute('aria-label', 'O assistente está digitando');

    const indicador = document.createElement('span');
    indicador.className = 'chat-indicador-digitando';
    indicador.setAttribute('aria-hidden', 'true');
    for (let ponto = 0; ponto < 3; ponto += 1) {
      indicador.append(document.createElement('span'));
    }
    carregando.append(indicador);

    if (chatEnviar) chatEnviar.disabled = true;
    chatForm.setAttribute('aria-busy', 'true');

    try {
      const resposta = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta, historico: historicoIA })
      });
      const dados = await lerRespostaApi(resposta, 'Não foi possível obter uma resposta agora');

      historicoIA.push({ role: 'user', content: pergunta });
      historicoIA.push({ role: 'assistant', content: dados.resposta });
      historicoIA = historicoIA.slice(-12);
      carregando.remove();
      adicionarMensagem(dados.resposta, 'bot', true);
    } catch (erro) {
      carregando.textContent = erro.message || 'Falha ao falar com o assistente. Tente novamente.';
    } finally {
      if (chatEnviar) chatEnviar.disabled = false;
      chatForm.removeAttribute('aria-busy');
      chatCampo.focus();
    }
  }

  function responderBot(pergunta) {
    const texto = pergunta.toLowerCase();

    if (texto.startsWith('oi') || texto.startsWith('ola') || texto.includes('olá') || texto.includes('bom dia') || texto.includes('boa tarde') || texto.includes('boa noite')) {
      return 'Olá! Posso ajudar com os materiais, o catálogo ou o contato.';
    } else if (texto.includes('o que é ia') || texto.includes('o que e ia') || texto.includes('o que é inteligência') || texto.includes('o que e inteligencia')) {
      return 'Inteligência artificial é quando um computador aprende com dados para fazer tarefas que parecem humanas, como reconhecer imagens ou responder perguntas.';
    } else if (texto.includes('machine learning') || texto.includes('aprendizado de máquina') || texto.includes('aprendizado de maquina')) {
      return 'Machine learning (aprendizado de máquina) é uma parte da IA em que o computador aprende padrões a partir de exemplos, sem ser programado regra por regra.';
    } else if (texto.includes('programar') || texto.includes('programação') || texto.includes('programacao') || texto.includes('código') || texto.includes('codigo')) {
      return 'Não precisa saber programar. Os materiais usam linguagem simples e exemplos do dia a dia.';
    } else if (texto.includes('grátis') || texto.includes('gratis') || texto.includes('gratuito') || texto.includes('preço') || texto.includes('preco') || texto.includes('pagar')) {
      return 'Todos os materiais são gratuitos. Este é um projeto acadêmico.';
    } else if (texto.includes('certificado')) {
      return 'Não. Os materiais são fictícios e não dão certificado.';
    } else if (texto.includes('começar') || texto.includes('comecar') || texto.includes('iniciante') || texto.includes('primeiro')) {
      return 'Comece pela Introdução à IA. Depois veja Aplicações Reais de IA e, por fim, Ética e Futuro.';
    } else if (texto.includes('nível') || texto.includes('nivel') || texto.includes('difícil') || texto.includes('dificil')) {
      return 'Introdução à IA é nível iniciante. Aplicações Reais de IA e Ética e Futuro são nível intermediário.';
    } else if (texto.includes('tempo') || texto.includes('duração') || texto.includes('duracao') || texto.includes('módulos') || texto.includes('modulos')) {
      return 'Introdução à IA tem 4 módulos. Aplicações Reais de IA e Ética e Futuro têm 3 módulos cada. Estudando um módulo por semana, cada material leva cerca de um mês.';
    } else if (texto.includes('receber') || texto.includes('quero') || texto.includes('baixar') || texto.includes('acessar')) {
      return 'Abra a página do material e clique em "Quero este material".';
    } else if (texto.includes('ética') || texto.includes('etica')) {
      return 'O material Ética e Futuro fala sobre viés, responsabilidade e o papel humano no uso da IA.';
    } else if (texto.includes('horário') || texto.includes('horario') || texto.includes('atendimento')) {
      return 'O atendimento é de segunda a sexta, das 8h às 18h.';
    } else if (texto.includes('contato') || texto.includes('whatsapp') || texto.includes('pessoa') || texto.includes('falar')) {
      return 'Você pode falar com a gente pelo botão de WhatsApp ou pelo formulário de Contato na página inicial.';
    } else if (texto.includes('tema') || texto.includes('escuro') || texto.includes('claro')) {
      return 'Para trocar entre tema claro e escuro, use o botão no topo da página.';
    } else if (texto.includes('quem fez') || texto.includes('projeto') || texto.includes('equipe')) {
      return 'A WebAI Materials é um projeto acadêmico da disciplina de Desenvolvimento Web do curso de Inteligência Artificial do PIT.';
    } else if (texto.includes('catálogo') || texto.includes('catalogo') || texto.includes('materiais') || texto.includes('quantos')) {
      return 'Temos 3 cadernos: Introdução à IA, Aplicações Reais de IA e Ética e Futuro. Veja todos na página Catálogo.';
    } else if (texto.includes('obrigado') || texto.includes('obrigada') || texto.includes('valeu')) {
      return 'De nada! Se tiver outra dúvida, é só perguntar.';
    } else if (texto.includes('tchau') || texto.includes('até mais') || texto.includes('ate mais')) {
      return 'Até mais! Bons estudos.';
    } else {
      return 'Ainda não sei responder isso. Tente uma das perguntas frequentes abaixo.';
    }
  }

  function enviarPergunta(pergunta) {
    const texto = pergunta.trim();
    if (!texto) return;

    if (/^\/ia$/i.test(texto)) {
      adicionarMensagem(texto, 'usuario');
      if (assistenteIAAtivo) {
        adicionarMensagem('O Claude já está ativo. Pergunte sobre os materiais ou digite /sair para encerrar.', 'bot');
        return;
      }

      aguardandoSenhaIA = true;
      chatCampo.value = '';
      chatCampo.type = 'password';
      chatCampo.placeholder = 'Digite a senha de acesso';
      chatCampo.setAttribute('autocomplete', 'current-password');
      adicionarMensagem('Para ativar o Claude Haiku 5.5, digite a senha de acesso.', 'bot');
      chatCampo.focus();
      return;
    }

    if (aguardandoSenhaIA) {
      aguardandoSenhaIA = false;
      chatCampo.type = 'text';
      chatCampo.placeholder = 'Digite sua pergunta';
      chatCampo.setAttribute('autocomplete', 'off');
      chatCampo.value = '';
      if (chatEnviar) chatEnviar.disabled = true;
      chatForm.setAttribute('aria-busy', 'true');
      autenticarIA(texto)
        .catch((erro) => adicionarMensagem(erro.message, 'bot'))
        .finally(() => {
          if (chatEnviar) chatEnviar.disabled = false;
          chatForm.removeAttribute('aria-busy');
          chatCampo.focus();
        });
      return;
    }

    adicionarMensagem(texto, 'usuario');

    if (/^\/sair$/i.test(texto) && assistenteIAAtivo) {
      encerrarSessaoIA();
      return;
    }

    if (assistenteIAAtivo) {
      perguntarIA(texto);
      return;
    }

    const resposta = responderBot(texto);
    adicionarMensagem(resposta, 'bot');
  }

  if (chatBotao && chatJanela) {
    atualizarEstadoIA();
    verificarSessaoIA();

    chatBotao.addEventListener('click', () => {
      chatJanela.hidden = !chatJanela.hidden;
    });

    chatFechar.addEventListener('click', () => {
      chatJanela.hidden = true;
    });

    chatForm.addEventListener('submit', (evento) => {
      evento.preventDefault();

      enviarPergunta(chatCampo.value);
      if (!aguardandoSenhaIA) chatCampo.value = '';
    });

    chatPerguntas.forEach((botao) => {
      botao.addEventListener('click', () => {
        enviarPergunta(botao.textContent);
      });
    });
  }
});
