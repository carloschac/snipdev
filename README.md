# snip.dev

> Encurtador de links com analytics em tempo real e geração de slugs por IA.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=flat&logo=fastify&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)

## Sobre o projeto

snip.dev é um encurtador de links full-stack com foco em analytics e automação inteligente. O diferencial está na geração de slugs via IA — ao invés de hashes aleatórias como `xB3k9`, a API da Anthropic analisa o conteúdo da URL e gera slugs legíveis e descritivos como `docker-getting-started`.

## Funcionalidades

- **Autenticação JWT** — registro, login e rotas protegidas
- **Encurtamento de links** — slug convencional ou gerado por IA
- **Redirecionamento** — rastreia IP, navegador e origem de cada clique
- **Analytics** — dashboard com gráficos de cliques por dia, top links e distribuição IA vs convencional
- **Feature flag de IA** — ativa/desativa a geração por IA via variável de ambiente

## Stack

| Camada         | Tecnologia                   |
| -------------- | ---------------------------- |
| Linguagem      | TypeScript (full-stack)      |
| Back-end       | Node.js + Fastify            |
| ORM            | Prisma                       |
| Banco de dados | PostgreSQL                   |
| Front-end      | React + Vite                 |
| UI             | shadcn/ui + Tailwind CSS     |
| Auth           | JWT                          |
| IA             | Anthropic API (Claude Haiku) |
| Infra          | Docker                       |

## Estrutura do projeto

```
snipdev/
├── apps/
│   ├── api/          # Back-end Node.js + Fastify
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── links/
│   │   │   │   └── analytics/
│   │   │   └── shared/
│   │   └── prisma/
│   └── web/          # Front-end React + Vite
│       └── src/
│           ├── pages/
│           ├── components/
│           ├── services/
│           └── contexts/
└── docker-compose.yml
```

## Como rodar localmente

### Pré-requisitos

- Node.js v18+
- pnpm
- Docker Desktop

### 1. Clone o repositório

```bash
git clone https://github.com/carloschac/snipdev.git
cd snipdev
```

### 2. Suba o banco de dados

```bash
docker compose up -d
```

### 3. Configure as variáveis de ambiente

**Back-end** — crie `apps/api/.env` baseado no `.env.example`:

```env
DATABASE_URL="postgresql://snipdev:snipdev123@localhost:5432/snipdev"
JWT_SECRET="sua-chave-secreta"
PORT=3333

# Feature flag de IA
AI_ENABLED=false

# Necessário apenas se AI_ENABLED=true
# Obtenha em: console.anthropic.com
ANTHROPIC_API_KEY=
```

**Front-end** — crie `apps/web/.env`:

```env
# Define como true para exibir o status de IA ativo na interface
VITE_AI_ENABLED=false
```

### 4. Instale as dependências e rode as migrations

```bash
# Back-end
cd apps/api
pnpm install
pnpm db:migrate

# Front-end
cd ../web
pnpm install
```

### 5. Suba tudo

Na raiz do projeto:

```bash
npm run dev
```

Ou separadamente:

```bash
# API → http://localhost:3333
cd apps/api && pnpm dev

# Web → http://localhost:5173
cd apps/web && pnpm dev
```

## Endpoints da API

| Método | Rota                       | Auth | Descrição        |
| ------ | -------------------------- | ---- | ---------------- |
| POST   | `/auth/register`           | ❌   | Criar conta      |
| POST   | `/auth/login`              | ❌   | Login            |
| POST   | `/links`                   | ✅   | Criar link       |
| GET    | `/links`                   | ✅   | Listar links     |
| DELETE | `/links/:id`               | ✅   | Deletar link     |
| GET    | `/r/:slug`                 | ❌   | Redirecionar     |
| GET    | `/analytics`               | ✅   | Overview geral   |
| GET    | `/analytics/clicks-by-day` | ✅   | Cliques por dia  |
| GET    | `/analytics/:linkId`       | ✅   | Stats de um link |

## Geração de slug por IA

Quando `AI_ENABLED=true`, o endpoint de criação de link envia a URL para a API da Anthropic e recebe um slug legível baseado no conteúdo da página.

```
https://docs.docker.com/get-started/overview/ → docker-getting-started
https://prisma.io/docs/concepts/components/prisma-migrate → prisma-migrations
```

Quando desativada, o sistema gera um slug convencional baseado no hostname e pathname da URL.

## Licença

MIT
