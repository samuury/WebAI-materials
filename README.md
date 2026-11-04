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

### Wellison Samuel — Módulo 1 (Conteúdo, Estrutura & Backend)
- **Base Inicial do Projeto:** Setup da estrutura base dos ficheiros, organização inicial do repositório e configurações iniciais.
- **Implementação do Claude:** Integração e lógica de suporte ao assistente virtual WebAI utilizando a API do Claude.
- **Produção Teórica:** Criação e curadoria dos textos explicativos sobre Inteligência Artificial para os cadernos de estudo.
- **Hierarquia de Informação:** Definição da proposta pedagógica, estrutura textual e organização dos conceitos.

### Ana Catharina — Módulo 2 (Interface, Temas & Interatividade)
- **Identidade Visual & UI:** Desenvolvimento do design system, paleta de cores, tipografia e estilização completa em CSS.
- **Sistema de Temas (Dark/Light Mode):** Criação do botão deslizante (*toggle switch*) com ícones customizados e persistência via `localStorage`.
- **Layout Responsivo:** Estruturação fluida utilizando CSS Grid e Flexbox adaptada a telas de computadores, tablets e smartphones.
- **Componentes Interativos:** Implementação do modal de requisição integrado à API do WhatsApp e interface do Assistente Virtual WebAI lateral.

### Erik França — Módulo 3 (Navegação & Catálogo)
- **Arquitetura do Catálogo:** Organização da grade de materiais, filtros e listagem completa dos cadernos de estudo.
- **Páginas de Detalhes:** Construção das páginas individuais (`material.html`, `material-ml.html`, `material-ethics.html`) com especificações de cada módulo.
- **Experiência do Usuário (UX):** Fluxo de navegação entre o catálogo, visualização de detalhes e seções de dúvidas frequentes (*accordions*).
