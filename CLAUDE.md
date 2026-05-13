# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Desenvolvimento completo (API + Web + DB)
```bash
# Na raiz do monorepo
npm run dev        # Sobe PostgreSQL (Docker), API e Web simultaneamente
```

### API (`apps/api`)
```bash
pnpm dev           # Servidor com hot reload via tsx watch
pnpm build         # Compila TypeScript para dist/
pnpm start         # Roda a build de produção

pnpm db:generate   # Gera o Prisma Client após mudanças no schema
pnpm db:migrate    # Aplica migrations em desenvolvimento
pnpm db:studio     # Abre o Prisma Studio na porta 5555
```

### Web (`apps/web`)
```bash
pnpm dev           # Vite dev server (porta 5173)
pnpm build         # tsc + vite build
pnpm lint          # ESLint
```

### Banco de dados
```bash
npm run db         # Sobe container PostgreSQL
npm run db:stop    # Derruba container
```

## Variáveis de ambiente

**API** (`apps/api/.env`):
```
DATABASE_URL=postgresql://snipdev:snipdev123@localhost:5432/snipdev
JWT_SECRET=seu-segredo
PORT=3333
FRONTEND_URL=http://localhost:5173
API_URL=http://localhost:3333
AI_ENABLED=false
ANTHROPIC_API_KEY=sua-chave
```

**Web** (`apps/web/.env`):
```
VITE_API_URL=http://localhost:3333
VITE_AI_ENABLED=false
```

## Arquitetura

### Monorepo
```
snipdev/
├── apps/api/     # Backend: Fastify + Prisma + PostgreSQL
└── apps/web/     # Frontend: React 19 + Vite + Tailwind CSS 4
```

### API — Fluxo de dados

O `PrismaClient` é instanciado como singleton em `server.ts` e exportado (`export const prisma`). Todos os serviços o importam diretamente dali — não há injeção de dependência.

Cada módulo segue o padrão **controller → service**:
- **Controller** registra as rotas no Fastify e valida input com Zod
- **Service** contém toda a lógica de negócio e acesso ao banco

Os módulos são `auth`, `links`, `analytics` e `profile`. Rotas protegidas usam o middleware `src/shared/utils/auth.middleware.ts` que chama `request.jwtVerify()`.

**Geração de slugs** tem dois caminhos no `LinksService`:
1. `AI_ENABLED=true` → chama `claude-haiku-4-5-20251001` via Anthropic SDK (import dinâmico)
2. `AI_ENABLED=false` → `generateSlug()` em `src/shared/utils/slug.ts` (hostname + pathname + sufixo aleatório)

O `shortUrl` é montado em runtime concatenando `API_URL` + `/r/` + `slug`. Não é armazenado no banco.

### API — Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/auth/register` | — | Cria conta (rate limit: 5/min) |
| POST | `/auth/login` | — | Login (rate limit: 10/min) |
| POST | `/auth/change-password` | JWT | Troca senha com verificação da senha atual (rate limit: 3/hora) |
| POST | `/auth/forgot-password` | — | Envia token de reset por e-mail; resposta genérica anti-enumeração (rate limit: 5/hora); em dev retorna token na resposta |
| POST | `/auth/reset-password` | — | Redefine senha via token SHA-256; invalida token após uso (TTL: 15 min) |
| GET | `/me` | JWT | Retorna perfil do usuário autenticado |
| PATCH | `/me` | JWT | Atualiza `name`, `profileName`, `username` (username imutável após definido) |
| GET | `/u/:username` | — | Perfil público por username; 404 se não existir |
| POST | `/links` | JWT | Cria link curto (aceita `expiresAt` opcional) |
| GET | `/links` | JWT | Lista links do usuário |
| PATCH | `/links/:id/toggle-public` | JWT | Alterna visibilidade pública |
| DELETE | `/links/:id` | JWT | Remove link |
| GET | `/r/:slug` | — | Redirect (rate limit: 100/min); retorna 410 se expirado |
| GET | `/profile/:userId` | — | Perfil público por userId (legado) |
| GET | `/analytics` | JWT | Overview de analytics |
| GET | `/analytics/:linkId` | JWT | Estatísticas de um link específico |
| GET | `/analytics/clicks-by-day` | JWT | Cliques agrupados por dia |
| GET | `/health` | — | Health check |

### Web — Fluxo de dados

**Autenticação:** `AuthContext` (`src/contexts/auth.context.tsx`) persiste `token` e `user` (inclui `username`, `profileName`) no `localStorage`. `updateUser()` sincroniza o estado sem novo login. O `ProtectedRoute` redireciona para `/login` se não autenticado. Um interceptor do Axios em `src/services/api.ts` injeta o header `Authorization` em toda requisição e chama `logout()` automaticamente em resposta 401.

**Servidor state:** React Query gerencia cache e refetch. Cada página busca dados via os service objects exportados de `src/services/api.ts` (`authService`, `linksService`, `analyticsService`, `profileService`).

**Layout:** Páginas do dashboard usam `Sidebar` + `Topbar` como layout compartilhado, montados individualmente em cada página (não há um layout wrapper global).

### Web — Rotas

| Rota | Proteção | Componente |
|------|----------|------------|
| `/login` | pública | `Login` — link "Esqueci minha senha" para `/forgot-password` |
| `/register` | pública | `Register` |
| `/forgot-password` | pública | `ForgotPassword` — envia e-mail de reset |
| `/reset-password?token=...` | pública | `ResetPassword` — redefine senha via token |
| `/dashboard` | protegida | `Dashboard` |
| `/links` | protegida | `Links` |
| `/analytics` | protegida | `Analytics` |
| `/analytics/:linkId` | protegida | `LinkAnalytics` |
| `/profile` | protegida | `Profile` — identidade + troca de senha |
| `/settings` | protegida | `Settings` |
| `/profile/:userId` | pública | `PublicProfile` (legado, por userId) |
| `/home` | pública | `Home` |
| `/u/:username` | pública | `UsernameProfile` — perfil por username |

### Schema do banco

```
User (1) ──< Link (N) ──< Click (N)
User (1) ──< PasswordResetToken (N)
```

- `User.username` é único, opcional e **imutável após definido**. Habilita a rota `/u/:username`.
- `User.profileName` é o nome público exibido no perfil, distinto de `User.name` (nome interno).
- `Click` armazena `ip`, `browser` (nome do navegador parseado), `device` (Desktop/Mobile/Tablet), `country` e `city` (via `geoip-lite`), e `referer`.
- `Link.active` controla se o redirect funciona. `Link.public` controla visibilidade no perfil público. `Link.expiresAt` define TTL — o redirect retorna 410 após a data.
- `PasswordResetToken` armazena apenas o hash SHA-256 do token. O token original é enviado apenas em dev (campo `token` na resposta). `usedAt` invalida o token após uso.
