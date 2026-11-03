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
    adicionarMensagem(pergunta, 'usuario');

    const resposta = responderBot(pergunta);
    adicionarMensagem(resposta, 'bot');
  }

  function adicionarMensagem(texto, autor) {
    const mensagem = document.createElement('p');
    mensagem.className = 'chat-msg chat-msg-' + autor;
    mensagem.textContent = texto;
    chatMensagens.appendChild(mensagem);
    chatMensagens.scrollTop = chatMensagens.scrollHeight;
  }

  if (chatBotao && chatJanela) {
    chatBotao.addEventListener('click', () => {
      chatJanela.hidden = !chatJanela.hidden;
    });

    chatFechar.addEventListener('click', () => {
      chatJanela.hidden = true;
    });

    chatForm.addEventListener('submit', (evento) => {
      evento.preventDefault();

      enviarPergunta(chatCampo.value);
      chatCampo.value = '';
    });

    chatPerguntas.forEach((botao) => {
      botao.addEventListener('click', () => {
        enviarPergunta(botao.textContent);
      });
    });
  }
});
