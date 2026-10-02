# Backend architecture and SQL migration plan

## Goal

Move the Express backend from MongoDB/Mongoose to PostgreSQL, keep the current HTTP routes and response fields compatible with both frontends, and establish clear database, service, and HTTP boundaries. PostgreSQL is the SQL target because the store has relational data and needs reliable transactions for checkout, user deletion, and default-address updates.

## Current state

- `index.js` opens a Mongoose connection as a side effect while importing the app.
- Route handlers call Mongoose directly, mixing HTTP behavior, validation, persistence, and business rules.
- Orders, carts, and wishlists contain nested arrays; related data is fetched with Mongo aggregation pipelines.
- There is no backend test runner or database migration history.
- A MongoDB URL is currently required at runtime.

## Target structure

```text
backend/
  db/                 PostgreSQL pool, transaction helper, ordered SQL migrations
  models/             Parameterized SQL repositories and row-to-API mapping
  services/           Domain operations shared by route handlers
  routes/             HTTP parsing, authentication, status codes, response formatting
  middleware/         Authentication and request validation
  test/               Node's built-in unit tests with injected database doubles
```

Handlers should not construct SQL or import a database driver. Repositories own SQL and map database rows into the existing API format (`_id`, `userId`, `createdAt`, nested `financials`, `shippingAddress`, and `products`). Services own transactions and business invariants. All queries use bound parameters; dynamic column names come from allowlists.

## Relational schema

| Table | Purpose and constraints |
| --- | --- |
| `users` | Account fields; unique username, email, and phone; password history kept in a normalized `user_password_history` child table (position-ordered, bounded), not a text array. |
| `products` | Catalog fields; unique title; categories as `TEXT[]`; prices as fixed-precision numeric values. |
| `addresses` | Address rows reference users; a partial unique index permits at most one default address per user. |
| `carts`, `cart_items` | One cart per user and one row per product in a cart; item quantities have a positive check. |
| `wishlists`, `wishlist_items` | One wishlist per user and one row per product; composite uniqueness prevents duplicates. |
| `orders`, `order_items` | Order totals and shipping/payment fields on the order; line items preserve ordered quantity and price. |

Identifiers remain 24-character strings so existing Mongo ObjectId values and JWT subject IDs can be retained during import. Foreign keys and indexes enforce ownership and lookup rules. Cart and wishlist rows can cascade on account/product deletion; order line items retain their product identifier and purchase-time price for history.

## Migration and rollout

1. Back up MongoDB and record collection counts. Provision PostgreSQL and set `DATABASE_URL` (and `DB_SSL=true` where the provider requires TLS).
2. Run the versioned SQL migrations against an empty PostgreSQL database. Migrations are tracked in `schema_migrations` and applied once in order.
3. Export Mongo collections and import users, products, addresses, carts, wishlists, orders, and order line items in dependency order. Keep each source `_id` as the SQL `id`; convert embedded cart/wishlist/order arrays into child rows. Preserve timestamps, cents, password hashes, and password history. The import must be restartable and report rejected rows rather than silently dropping them.
4. Compare source and target row counts, unique keys, account references, line-item counts, and order totals. Exercise authentication, catalog reads, cart updates, address defaults, and checkout against a staging copy.
5. Schedule a write freeze, take a final Mongo backup, import the delta, deploy the PostgreSQL-backed backend, and monitor errors and query latency. Keep the Mongo backup read-only until rollback is no longer needed; then remove `MONGO_URL` and decommission MongoDB.

The backend code change does not copy production data by itself. The import must be run against the actual MongoDB and PostgreSQL instances by an operator with both database credentials; never commit those credentials.

## Test plan

- Unit-test row mapping, ID generation, input normalization, and domain rules without a live database.
- Unit-test repositories with an injected query double: SQL remains parameterized, updates only accept allowlisted columns, and transaction failures roll back. (`test/unit/repositories.test.js`, run by `npm test`.)
- Test that an account cannot have two default addresses, a wishlist cannot duplicate a product, and cart quantities/prices are recalculated from catalog data.
- Checkout is server-authoritative: per-line quantities and prices are recomputed from the catalog in the database, the shipping address must belong to the requesting user (by id or by exact stored fields), and the purchased items are removed from the user's cart inside the same transaction. A deterministic idempotency key makes retries return the existing order instead of duplicating it. When the client's preview no longer matches the recomputed total the order is refused (409 with the authoritative `financials`) rather than created at a figure the customer never saw; the retry carries `acceptPricingChange: true`, the reported totals and the same key. That flag is a statement that the customer agreed to a figure, not a waiver of the comparison: the check runs on every attempt, so a price that moves again before the retry is refused again and asked about again, and only a placed order reports success.
- Product visibility filters out catalog items flagged deleted from every public read path (`/all`, list, search).
- Prove the per-user advisory locks with parallel requests against a real database, not only with sequential calls (`test/integration/concurrency.test.js`, run by `npm run test:integration`; set `INTEGRATION_DATABASE_URL` to a migrated scratch database, otherwise the file skips).
- Integration tests against an isolated PostgreSQL database for migrations, foreign keys, unique constraints, transactions, and representative endpoint flows. (`test/integration/schema.test.js` covers the schema half: migrations apply from empty, every CHECK/UNIQUE/FK/NOT NULL rejects bad data by SQLSTATE, deletes cascade as declared, a failed `withTransaction` leaves nothing behind and releases its client, and all migrations roll back and forward again. `test/integration/concurrency.test.js` covers the request half. Run with `npm run test:integration`.)
- Gate deployment on the backend unit and integration suites, plus the Mongo/PostgreSQL reconciliation report.

## Follow-up architecture improvements

- Move route business logic into focused services and standardize error handling and validation.
- Add request schemas, pagination limits, structured logs, health/readiness endpoints, and database pool metrics.
- Add integration tests for all route permissions and contract tests for both frontends.
- Keep migrations additive and reversible where practical; review destructive schema changes separately.

## Operational notes

- `engines.node` is `^22.22.0` while development currently runs Node 20; this is
  intentional and only blocks `yarn` locally (npm installs fine). Align the
  runtime at deploy time.
- Both `yarn.lock` and `package-lock.json` are committed; pick one package
  manager for installs in CI/deploy so the lockfiles cannot drift.
- The migration tooling (`import-mongo`, `reconcile-import`, `export-mongo`,
  `inspect-mongo`, `preview-import`) and the `mongoose` dependency are retained
  for the rollback/retention window and run against the legacy `MONGO_URL`
  passed per-command — they are not part of the runtime data path.
