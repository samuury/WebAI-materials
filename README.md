# WebAI Materials

Trabalho acadêmico desenvolvido para a disciplina de Desenvolvimento Web do curso de Bacharelado em Inteligência Artificial no Piauí Instituto Tecnológico (PIT).

O **WebAI Materials** é uma plataforma web fictícia criada para apresentar e organizar materiais de estudo, guias e cadernos sobre Inteligência Artificial com uma interface moderna, acessível e responsiva.

---

## 🚀 Funcionalidades da Interface

- **Alternância de Tema (Dark/Light Mode):** Interruptor deslizante (*toggle switch*) no topo com suporte ao modo claro/escuro e persistência de preferências do usuário (`localStorage`).
- **Navegação Completa & Catálogo:** Páginas dedicadas para cada caderno de estudo com detalhes, barra de progresso dos módulos e FAQs sanfonadas (*accordions*).
- **Modal de Aquisição (WhatsApp):** Integração interativa com fluxo de atendimento fictício via API do WhatsApp ao solicitar um material.
- **Assistente Virtual WebAI:** Chatbot lateral interativo integrado no canto da tela para responder a dúvidas frequentes sobre o catálogo em tempo real.
- **Design Responsivo & Identidade Visual:** Layout fluido construído com CSS Grid e Flexbox, otimizado para telas de computadores, tablets e smartphones.

---

## 📁 Estrutura do Projeto

- `index.html`: Página inicial com destaques, introdução e visão geral dos cadernos de estudo.
- `catalogo.html`: Catálogo completo com grelha de materiais e assistente virtual.
- `material.html`: Página de detalhes do caderno "Introdução à IA".
- `material-ml.html`: Página de detalhes do caderno "Aplicações Reais de IA".
- `material-ethics.html`: Página de detalhes do caderno "Ética e Futuro".
- `styles.css`: Estilização completa, variáveis de tema, layouts responsivos e efeitos visuais.
- `script.js`: Lógica de alternância do tema escuro/claro, controle de modais e comportamento do assistente.
- `server.js`: Servidor local para suporte ao assistente virtual e requisições.
- `package.json` / `package-lock.json`: Ficheiros de dependências do Node.js/projeto.
- `.gitignore`: Ficheiro para ignorar pastas e dados sensíveis no versionamento Git.
- `.env.example`: Modelo de variáveis de ambiente para configuração do servidor.

---

## 👥 Integrantes e Divisão de Módulos

### Wellison Samuel — Módulo 1 (Conteúdo & Estrutura)
- Produção de conteúdo e narrativa teórica sobre Inteligência Artificial.
- Organização da estrutura textual e hierarquia de informação do site.

### Ana Catharina — Módulo 2 (Interface, Temas & Interatividade)
- Desenvolvimento da identidade visual, estilização e sistema de temas (Dark/Light).
- Layout, alinhamento responsivo, botões interativos, modal do WhatsApp e assistente lateral.

### Erik França — Módulo 3 (Navegação & Catálogo)
- Estruturação do catálogo e navegação entre os materiais de estudo.
- Criação das páginas de detalhes de produtos e experiência do usuário (UX).
