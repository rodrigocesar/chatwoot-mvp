# Moonu Chatwoot Omnichannel Simulator

Local-first admin simulator for evaluating Chatwoot as an omnichannel layer on a Moonu-like PBX platform.

## Quick start (Slice 1 — mock mode)

See the full validation guide: [specs/001-chatwoot-omnichannel-mvp/quickstart.md](specs/001-chatwoot-omnichannel-mvp/quickstart.md)

```bash
cp .env.example .env.local
docker compose up -d moonu-db
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open http://localhost:3000 — demo runs with `CHATWOOT_MODE=mock` (no Chatwoot required).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run test` | Run Vitest unit + integration tests |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Prisma migrate |
| `npm run db:seed` | Seed demo customer (Clínica Exemplo) |

## Architecture

- **Next.js 15** monolith (App Router)
- **Prisma + PostgreSQL** for simulator data
- **Chatwoot adapter** (`mock` | `real`) — all Chatwoot access via `src/lib/chatwoot/`
