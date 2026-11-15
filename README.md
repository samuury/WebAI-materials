# WebAI Materials

Projeto acadêmico da disciplina de Desenvolvimento Web do Bacharelado em Inteligência Artificial do Piauí Instituto Tecnológico (PIT). O WebAI Materials é um site educacional demonstrativo que apresenta materiais introdutórios sobre inteligência artificial, aprendizado de máquina, aplicações e ética.

## Deploy

O site está disponível em: [https://webaimaterials.duckdns.org/](https://webaimaterials.duckdns.org/)

O deploy executa a aplicação Node.js com Express; não é uma hospedagem de arquivos estáticos.

## Integrantes

- **Wellison Samuel:** estrutura inicial, backend e assistente Claude; curadoria dos conteúdos e organização pedagógica.
- **Ana Catharina:** identidade visual, estilos, temas claro/escuro, responsividade e componentes interativos.
- **Erik França:** catálogo, navegação, páginas dos materiais e experiência de leitura/FAQ.

## Tecnologias utilizadas

- HTML5, CSS3 e JavaScript sem framework de frontend ou etapa de build.
- Node.js 20 ou superior e Express 5 para servir as páginas e disponibilizar a API.
- SDK oficial `@anthropic-ai/sdk` para integração com a API Anthropic/Claude.
- `dotenv` para carregar configuração local e `express-rate-limit` para limitar requisições.
- Testes automatizados com o test runner nativo do Node.js.

## Funcionalidades

- Página inicial e catálogo com três cadernos: Introdução à IA, Aplicações Reais de IA e Ética e Futuro.
- Páginas individuais com conteúdo, módulos, progresso ilustrativo e perguntas frequentes expansíveis.
- Assistente virtual disponível nas páginas para responder dúvidas sobre o site e os materiais.
- Alternância entre temas claro e escuro, com preferência salva no navegador (`localStorage`).
- Layout responsivo para computadores, tablets e celulares.
- Formulário e ações para solicitar materiais como demonstração de interface. O projeto não processa pagamentos nem realiza entrega de arquivos ou atendimento comercial.

## Integração com Inteligência Artificial

O assistente oferece respostas locais para perguntas frequentes. Para conversar com o Claude, o visitante ativa o acesso pelo comando `/ia`; a autenticação é feita pelo backend. Depois do acesso, as mensagens são enviadas a `POST /api/chat`, e o servidor usa o SDK da Anthropic e o modelo configurado em `ANTHROPIC_MODEL` (padrão: `claude-haiku-5-5`). As instruções enviadas ao modelo contextualizam o catálogo e orientam as respostas em português.

A chave da Anthropic e a senha de acesso ficam exclusivamente no ambiente do servidor, nunca no JavaScript do navegador. A conversa não é usada para treinar um modelo próprio e não há banco de dados de conversas. Para habilitar o Claude, configure `ANTHROPIC_API_KEY`, `ASSISTANT_ACCESS_PASSWORD` e `SESSION_SECRET` no ambiente da aplicação. Em produção, use uma senha forte e um `SESSION_SECRET` com pelo menos 32 caracteres; configure esses valores no provedor de deploy, não os publique no repositório.

## Instalação e execução

Pré-requisito: Node.js 20 ou superior e npm.

```sh
npm install
```

Para habilitar o assistente com Claude localmente, copie `.env.example` para `.env` e preencha as variáveis necessárias. Não compartilhe nem versione o arquivo `.env`. Sem as credenciais da Anthropic, o site pode ser executado, mas o chat com Claude não estará disponível.

Inicie o servidor em modo de desenvolvimento:

```sh
npm run dev
```

Acesse [http://127.0.0.1:3000](http://127.0.0.1:3000). Para iniciar sem o modo de observação de arquivos:

```sh
npm start
```

Execute os testes automatizados com:

```sh
npm test
```

## Estrutura de arquivos

```text
.
├── index.html              # Página inicial
├── catalogo.html           # Catálogo de materiais
├── material.html           # Caderno Introdução à IA
├── material-ml.html        # Caderno Aplicações Reais de IA
├── material-ethics.html    # Caderno Ética e Futuro
├── styles.css              # Estilos, temas e layout responsivo
├── script.js               # Interações do navegador e cliente do assistente
├── server.js               # Servidor Express e rotas da API
├── test/
│   └── server.test.js       # Testes do servidor e da API
├── .env.example            # Modelo de configuração de ambiente
├── .gitignore              # Arquivos ignorados pelo Git
├── package.json            # Scripts e dependências
├── package-lock.json       # Versões resolvidas das dependências
└── LICENSE                 # Licença do projeto
```
