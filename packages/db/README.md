# @one-technology/db

Cloudflare D1 (SQLite) schema types and migrations for **One Technology ERP**.

## Layout

| Path | Purpose |
|------|---------|
| `schema/types/` | Row interfaces, domain unions, and `TABLE_*` constants |
| `migrations/` | SQL migrations applied via Wrangler (`0001` Phase 1, `0002` product catalog, `0003` warehouse core foundation, `0004` warehouse operational documents, `0005` reservations foundation, `0006` constructor core foundation, `0007` commercial layer foundation, `0008` reservation consume context refinement, `0009` installation module foundation, `0010` order line fulfillment context refinement) |

## Applying migrations

`apps/api/wrangler.jsonc` sets `migrations_dir` to `packages/db/migrations`.

```bash
cd apps/api
npx wrangler d1 migrations apply one-technology-erp-db --local
npx wrangler d1 migrations apply one-technology-erp-db --remote
```

## Conventions

- Keys: `INTEGER PRIMARY KEY AUTOINCREMENT`; timestamps: `TEXT` with `datetime('now')`; flags: `INTEGER` 0/1.
- `users.email` and `users.phone` are nullable; each column is `UNIQUE` so non-null values do not duplicate (SQLite allows multiple NULLs per column).
- `users.status` is `active` | `inactive` | `suspended` (enforced in SQL with `CHECK`).
- `employees.user_id` is nullable so non-ERP staff (e.g. installers) are employees only.
- `warehouse_positions.parent_position_id` supports a tree under each warehouse.
- Branch/location/warehouse enums in TypeScript match the agreed operational model (e.g. `partner_point`, `partner_stock_point`).

Row fields use **snake_case** to align with SQL columns.

### Phase 2 (product catalog)

Tables cover categories (tree), units of measure, suppliers, products (with type/status flags), images/files, flexible attributes, supplier links, and bundles (`product_bundles` points at a `products` row for the bundle SKU; line items reference component products). Primary product imagery uses `product_images.is_primary`, not a column on `products`.

### Phase 3A (warehouse core foundation)

Tables cover current per-position stock state in `stock_balances` plus historical stock movement headers and lines in `stock_movements` / `stock_movement_lines`. Balances are modeled by product and warehouse position, with `warehouse_id` stored explicitly for query speed and future document workflows.

### Phase 4A (warehouse operational documents)

Tables cover warehouse business documents and their lines for purchase receipts, stock adjustments, stock writeoffs, inventory counts, and stock transfers. These headers/lines intentionally stop at document persistence for now; later phases can generate `stock_movements` from confirmed documents without redesigning the core ledger.

### Phase 5A (reservations foundation)

`stock_reservations` adds future-ready reservation state at product + warehouse position level, with optional source linkage fields for quote/order/configuration/BOM line context. Only safe current-schema foreign keys are enforced now; future commercial and constructor modules can attach without redesigning the reservation record shape.

### Phase 6AB (constructor core foundation)

Constructor core tables store configuration headers, variants, flexible input values, historical calculation runs, spring result snapshots, editable BOM lines, BOM change logs, and optional visuals. Future quote/order/reservation/warehouse flows can attach to this structure without requiring the engineering engine or BOM generator to exist yet.

### Phase 7AB (commercial layer foundation)

Commercial tables store quote headers, version history, line and document discounts, orders, payment methods, and payment records with snapshot fields. Future quote-to-order workflows, reservation linkage, and constructor/commercial integration can attach to this structure without changing the core commercial history model.

### Phase 8D (reservation consume context refinement)

Consumed reservations can now optionally store operational context pointing at an order, order line, stock movement, and future installation-job identifier, plus a `consumed_at` timestamp. This keeps fulfillment/install linkage explicit without introducing stock automation or a full installation module.

### Phase 9AB (installation module foundation)

Installation tables store job headers, installer assignments, and historical results. The module is intentionally limited to persistence and basic API support for now, so later scheduling, uploads, stock effects, and installation workflows can build on it without redesign.

### Phase 9A (order line fulfillment context refinement)

Order lines can now optionally store their primary reservation, installation job, stock movement, and fulfillment timestamp. This keeps the commercial line readable as it moves into operational fulfillment without introducing fulfillment automation or a state-machine engine.
