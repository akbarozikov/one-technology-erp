# One Technology ERP API

Cloudflare Worker + D1. Phase 1 exposes JSON list/create routes under `/api/*` and `GET /health`.

## Run locally

```bash
npm run dev
```

Apply D1 migrations (from repo root or `packages/db` docs) before creating rows so foreign keys resolve.

## Layout (`src/`)

- `lib/` — D1 access, JSON responses, SQLite error mapping, FK existence checks
- `validation/` — manual parsers for POST bodies
- `routes/` — per-resource handlers + `router.ts`
- `types/env.ts` — Worker bindings

Authentication and permission enforcement are not part of Phase 1.
