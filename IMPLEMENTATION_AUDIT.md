# PostgreSQL Migration Implementation Audit

**Status: fixes and plan reconciliation are needed before treating the migration as production ready.** The repository has a PostgreSQL-backed runtime, SQL repositories, migrations, an importer, and rollback tools. The main blockers are server-authoritative checkout, importer fidelity/reconciliation, and several transaction/concurrency gaps.

## Scope and verification

Reviewed the implementation against [the detailed migration plan](ARCHITECTURE_MIGRATION_PLAN.md), [the backend plan](backend/ARCHITECTURE_MIGRATION_PLAN.md), and the migration [runbook](backend/src/scripts/migration/RUNBOOK.md). The audit covered PostgreSQL schema/migrations, runtime wiring, use cases and repositories, auth middleware, migration mapping/import/reconciliation, and the deployment template.

The current `npm test` command exits successfully, but its output reports three file-level checks and `# tests 0`. I also ran each of the three test files directly; their 20 named assertions passed (10 auth middleware, 4 field picking, 6 validation). These tests do not cover checkout pricing/ownership, SQL repositories, migration fidelity, transaction rollback, or concurrent requests. No database integration or client-conformance run was performed for this audit.

## Findings

### P1 — Checkout accepts browser-authored prices, totals, and shipping details

In [orders.usecases.js](backend/src/modules/orders/application/orders.usecases.js#L8), order items take `priceAtOrderInCents` from the request, and the repository inserts the request's financial totals and shipping address directly in [orders.repository.js](backend/src/modules/orders/infrastructure/orders.repository.js#L74). The code does not require a non-empty item list, recalculate prices from PostgreSQL, or verify that the supplied address belongs to the authenticated user. The JWT-derived user ID is used, but the financial and shipping facts remain client-controlled. This conflicts with plan sections 17–19 and ADR-7.

**Fix:** Validate a non-empty list of product IDs and positive integer quantities; load the products and an address owned by `req.user.id`; calculate line prices, subtotal, discount, shipping, and total on the server; take snapshots from those database rows; reject unsupported payment methods; and add an idempotency key for checkout retries. Keep all order writes in one transaction.

The detailed plan also requires clearing the cart in that transaction. The runbook instead records a deliberate decision to clear it in a separate frontend request. Choose one behavior and update both documents: the current split request can leave a purchased cart uncleared or allow a retry to create a duplicate order.

### P1 — Import can fail on missing timestamps and drops the legacy delivery date

[mapping.js](backend/src/scripts/migration/mapping.js#L204) maps absent `createdAt`/`updatedAt` values to `null`, while the SQL schema declares those columns `NOT NULL`. The importer explicitly includes those columns in its inserts, so the PostgreSQL defaults do not apply to explicit `NULL` values. The mapping also reads `o.estimatedDeliveryAt`; the legacy order schema stores this as `shippingInfo.estimatedDeliveryDate`, so an existing delivery date is lost on import.

**Fix:** Map `shippingInfo.estimatedDeliveryDate`; for missing timestamps, choose the documented fallback and emit a per-record report entry, or omit the timestamp column from that row's insert so the database default applies. Add mapping and import cases for both conditions.

### P1 — Reconciliation is not a sufficiently strict cutover gate

[reconcile-import.js](backend/src/scripts/migration/reconcile-import.js#L200) checks parent ID sets, but child tables are compared mainly by counts and numeric rollups; it does not prove that each cart/wishlist/order item retains its product reference and position. PostgreSQL integrity findings are counted as warnings. Without `--strict`, extras or integrity warnings can produce a non-`PASS` report while the process exits with status 0 ([exit logic](backend/src/scripts/migration/reconcile-import.js#L230)). The importer also uses `ON CONFLICT DO NOTHING` and a count-based checkpoint (`existing >= expected`) in [import-mongo.js](backend/src/scripts/migration/import-mongo.js#L122) and [import-mongo.js](backend/src/scripts/migration/import-mongo.js#L284); that can silently accept rows already present under the same ID but with different data.

**Fix:** Compare exact source/target values or stable per-row fingerprints for parent and child rows, including ordered child references. Treat every unapproved extra, mismatch, or integrity warning as a non-zero result. Make the importer verify that conflicting target rows match the source before calling a phase complete, and bind checkpoints to a source snapshot fingerprint. The cutover runbook should require both `result === PASS` and a successful exit status.

### P1 — Password changes can partially write or lose password history

[updatePassword](backend/src/modules/users/infrastructure/users.repository.js#L105) reads the user, deletes all history rows, reinserts history rows, and updates the user password through separate queries without a transaction. A failure between these statements can erase or truncate history; simultaneous password changes can overwrite one another's history. This conflicts with the plan's transaction and password-history requirements.

**Fix:** Run the full password-change workflow in one transaction, lock the user row while reading/comparing the current password and recent history, then replace the bounded history and update the password using the same checked-out client. Return only the safe response.

### P1 — Public paginated product listing includes disabled products

The public `GET /api/products/all` handler calls [listPaginated](backend/src/modules/products/infrastructure/products.repository.js#L125), whose query selects every product without an `is_deleted = false` predicate. The filtered list, search, and single-product lookup do exclude disabled products. The runbook's Phase 6 contract says disabled products are hidden, so `/all` leaks disabled catalog entries and behaves differently from the other public endpoints.

**Fix:** Apply the public visibility predicate to the paginated query and its total count. If admins need disabled rows, expose a separate admin query with explicit authorization. Add a contract case that disables a product and checks every public catalog route.

### P2 — Cart, wishlist, and default-address writes have race conditions

Cart item replacement deletes and reinserts rows without locking the cart ([carts.repository.js](backend/src/modules/carts/infrastructure/carts.repository.js#L45)); concurrent updates can overwrite one another. Cart creation checks for an existing cart before opening a transaction ([carts.usecases.js](backend/src/modules/carts/application/carts.usecases.js#L37)), while `ON CONFLICT DO NOTHING` can return `null` ([carts.repository.js](backend/src/modules/carts/infrastructure/carts.repository.js#L27)); the caller then dereferences the missing cart. Wishlist creation has a similar check-then-insert race. Address creation counts defaults before insert and relies on the unique index to reject simultaneous first/default address writes, which currently becomes an unhandled database error.

**Fix:** Serialize mutations by locking the owning cart/wishlist/user row inside the transaction. Make create operations return or reload the winning row on uniqueness conflicts, and translate expected races to a stable conflict response or retry. Keep unique indexes as the final invariant guard and test concurrent create/update/default-switch operations.

### P2 — Cloudinary cleanup can delete the image now referenced by PostgreSQL

In [products.usecases.js](backend/src/modules/products/application/products.usecases.js#L69), the `try` block includes both saving the new image URL and deleting the old image. If old-image deletion fails after the database update succeeds, the `catch` deletes the newly uploaded image even though PostgreSQL now points to it. Product deletion also removes the Cloudinary image before deleting the row ([products.usecases.js](backend/src/modules/products/application/products.usecases.js#L87)), so a database failure can leave a product with a broken image. This is opposite to the plan's persist-then-clean-up sequence.

**Fix:** Compensate by deleting the new upload only when the database write fails. After a successful write/delete, enqueue or log idempotent cleanup of the old asset and retry failures separately. Add tests for upload failure, SQL failure, and old-asset deletion failure.

### P2 — Request validation and pagination bounds are incomplete

Product and address handlers pass most input directly into repositories. Database `CHECK`/`NOT NULL` failures become generic 500 responses in [error-middleware.js](backend/src/shared/http/error-middleware.js#L10), rather than the plan's 400 validation response. Product/order pagination parses query strings but does not enforce page ≥ 1 or the planned maximum limit of 100 ([products.router.js](backend/src/modules/products/http/products.router.js#L42), [orders.router.js](backend/src/modules/orders/http/orders.router.js#L64)); negative or very large limits can fail queries or request excessive work. Invalid address labels likewise reach the database constraint.

**Fix:** Add route-level schemas and business validation for IDs, quantities, product fields, labels, order values, page, and limit. Bound limits at 100, reject malformed input as 400, and map named database constraints to safe client errors.

## Plan and operations inconsistencies

- The detailed plan specifies normalized password history, while the shorter backend plan says it is a `text[]`; implementation follows the normalized table. Keep one canonical schema decision and make both plans agree.
- The detailed plan requires atomic checkout/cart clearing, while the runbook explicitly accepts a separate frontend clear request. Update the detailed plan or implement the transactional behavior; document the residual retry/failure risk either way.
- [backend/.env.example](backend/.env.example#L3) still describes MongoDB as the runtime database and `DATA_MODE=mongo` as the default, even though the current runtime env config is PostgreSQL-only. The runbook calls this template authoritative. Replace the stale Mongo/runtime instructions with the actual PostgreSQL-only variables before an operator uses it.
- The package declares Node `^22.22.0`, while the audit environment is Node `v20.20.0`; deployment runtime compatibility and the two lockfiles (`package-lock.json` and `yarn.lock`) still need to be aligned as required by the plan.

## Recommended fix order

1. Make checkout server-authoritative and verify address ownership; settle the cart-clearing decision in both plans.
2. Correct importer timestamp/date mapping and make reconciliation fail closed on any unexplained mismatch.
3. Make password history, cart/wishlist mutations, and default-address changes safe under failures and concurrent requests.
4. Hide disabled products from `/all`, isolate Cloudinary cleanup from committed database updates, and add bounded request validation.
5. Reconcile the operational docs/runtime and add database-backed tests for the repaired invariants before cutover.
