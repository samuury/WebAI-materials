# WebAI Materials

Trabalho acadêmico desenvolvido para a disciplina de Desenvolvimento Web do curso de Bacharelado em Inteligência Artificial no Piauí Instituto Tecnológico (PIT).

O **WebAI Materials** é uma plataforma web fictícia focada em apresentar e organizar materiais de estudo, guias e cadernos sobre Inteligência Artificial com um visual moderno, acessível e responsivo.

---

## 🚀 Funcionalidades

- **Alternância de Tema (Dark/Light Mode):** Interruptor deslizante no topo com persistência de preferências do utilizador (`localStorage`).
- **Navegação Dinâmica:** Transição entre a página inicial e os catálogos detalhados de cada módulo de estudo.
- **Design Responsivo:** Layout fluido em CSS Grid e Flexbox, adaptado a ecrãs de computadores, tablets e telemóveis.
- **Identidade Visual:** Cartões organizados por níveis de aprendizado com cores temáticas e alto contraste.

---

## 📁 Estrutura do Projeto

- `index.html`: Página inicial com destaques, introdução, visão geral dos cadernos e seção de contato.
- `catalogo.html`: Catálogo completo com os cards dos materiais e FAQ.
- `material.html`: Página de detalhes do caderno "Introdução à IA".
- `material-ml.html`: Página de detalhes do caderno "Aplicações Reais de IA".
- `material-ethics.html`: Página de detalhes do caderno "Ética e Futuro".
- `styles.css`: Estilização completa, variáveis de tema e regras de responsividade.
- `script.js`: Lógica de alternância do tema escuro/claro e interações de interface.
- `server.js`: API local que protege o assistente e encaminha perguntas à Anthropic.

## Assistente Claude

O chat continua com respostas locais até ser ativado digitando `/ia` ou `/IA`. Informe a senha configurada no ambiente; depois, as perguntas são respondidas pelo Claude Haiku 5.5. Digite `/sair` para encerrar a sessão. O assistente usa as informações do catálogo como contexto e não foi treinado por fine-tuning.

1. Instale o Node.js 20 ou mais recente.
2. Execute `npm install`.
3. Copie `.env.example` para `.env` e preencha `ANTHROPIC_API_KEY`, `ASSISTANT_ACCESS_PASSWORD` e `SESSION_SECRET` (gere este último com `openssl rand -hex 32`).
4. Inicie o site com `npm run dev` e abra `http://127.0.0.1:3000`.
5. Execute `npm test` para verificar as rotas e o fluxo de autenticação.

O `.env` e a chave da API não devem ser enviados ao Git. A senha de desenvolvimento fica somente no `.env` local ignorado; use uma senha exclusiva em cada ambiente e nunca publique credenciais. Em produção, configure uma senha exclusiva com pelo menos 20 caracteres, `SESSION_SECRET` aleatório com pelo menos 32 caracteres, HTTPS e `NODE_ENV=production`. O servidor recusa iniciar em produção se essas condições não forem atendidas. A documentação oficial identifica o modelo como `claude-haiku-5-5`.

---

## 👥 Integrantes e Divisão de Módulos

### Wellison Samuel — Módulo 1 (Conteúdo & Estrutura)
- Produção de conteúdo e narrativa teórica sobre IA.
- Organização da estrutura textual e hierarquia de informação do site.

### Ana Catharina — Módulo 2 (Interface & Responsividade)
- Desenvolvimento da identidade visual, estilização e temas (Dark/Light).
- Ajuste e alinhamento de layout, botões interativos e responsividade.

### Erik França — Módulo 3 (Navegação & Catálogo)
- Catálogo e navegação entre os materiais de estudo.
- Estrutura das páginas de detalhes de produto e experiência do utilizador.
- Página de catálogo, FAQ interativo, popup "Quero este material", botão de WhatsApp fictício e seção de contato.
