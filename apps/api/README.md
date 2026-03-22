# One Technology ERP API

Cloudflare Worker + D1. Phase 1 (org structure) and Phase 2 (product catalog) expose JSON list/create routes under `/api/*`, plus `GET /health`.

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

Authentication and permission enforcement are not part of these phases.

Phase 2 catalog routes require migration `0002_phase2_product_catalog.sql` applied to D1.
