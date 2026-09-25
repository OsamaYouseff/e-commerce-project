# MongoDB → PostgreSQL Migration Runbook

Phase 5 deliverable: an idempotent, audited importer plus a reconciliation
script, exercised against repeated staging rehearsals. All commands below run
from the `backend/` directory.

## Quick reference

| Task | Command |
|---|---|
| Dry-run / preview (no DB writes) | `npm run db:preview` |
| Import (idempotent, uses checkpoints) | `npm run db:import` |
| Reset schema + migrate + import | `npm run db:import:reset` |
| Reconcile source vs. target | `npm run db:reconcile` |

Environment used by the scripts:

- `MONGO_URL` — live source MongoDB (only when you are not using `--backup`).
- `MONGO_BACKUP_DIR` or `--backup <dir>` — mongoexport `--jsonArray` directory
  (EJSON). When set, no live-Mongo connection is made.
- `MONGO_DB` (default `test`) — source database name.
- `DATABASE_URL` — target PostgreSQL (required with `--insert` / for reconcile).
- Private PG cluster helper: `export PATH=/usr/lib/postgresql/16/bin:$PATH`
  and use `postgresql://postgres@/<db>?host=/tmp/opencode/pgdata&port=55432`.

## Exporting the source (when live Mongo is out of reach)

From any machine that can reach Atlas:

```bash
mongoexport --uri "$MONGO_URL" --db test --collection users     --jsonArray -o test.users.json
mongoexport --uri "$MONGO_URL" --db test --collection products  --jsonArray -o test.products.json
mongoexport --uri "$MONGO_URL" --db test --collection addresses --jsonArray -o test.addresses.json
mongoexport --uri "$MONGO_URL" --db test --collection carts     --jsonArray -o test.carts.json
mongoexport --uri "$MONGO_URL" --db test --collection wishlists --jsonArray -o test.wishlists.json
mongoexport --uri "$MONGO_URL" --db test --collection orders    --jsonArray -o test.orders.json
```

Drop them in one directory and pass it via `--backup <dir>` (files may be named
`test.users.json` or `users.json`). `json-source.js` decodes `$oid` and `$date`.
Only `$oid` and `$date` extended types are known to appear in this dataset; the
decoder also handles `$numberInt`/`$numberLong`/`$numberDouble` and `$binary`.

## The importer (`import-mongo.js`)

- **Dry-run is the default**: it maps and validates every source document and
  writes a report to `src/scripts/migration/reports/import-*.json`. Nothing is
  written to PostgreSQL.
- **Idempotent inserts**: every `INSERT` uses `ON CONFLICT ... DO NOTHING` on
  primary keys (`users.id`, `products.id`, ... composite PKs for the three child
  tables), in 200-row batches.
- **Checkpoints**: per-phase state in `<backend>/.migration-checkpoint.json`.
  A phase is skipped when its checkpoint exists, the expected row count matches,
  and the table already holds that many rows. `--force` ignores checkpoints.
- **`--reset`** drops the `public` schema and re-runs all node-pg-migrate
  migrations, then imports. Requires `psql` and the local
  `node_modules/.bin/node-pg-migrate` (both resolved automatically).
- **Quarantine**: rows referencing missing documents (orphan `product_id`) are
  excluded from the child tables and listed in the report, deterministically.
  The orphan cart/wishlist *item* is dropped; an orphan order *line* is kept with
  `product_id = NULL` (line preserved, snapshot null).
- **Exceptions ledger**: `--exceptions <file>` (an optional JSON array of
  approved quarantine entries) is recorded onto the report as `exceptionsUsed`.
  It is informational; quarantined rows stay excluded either way.
- `--fail-on-quarantine` exits non-zero if any row was quarantined.

## The reconciler (`reconcile-import.js`)

Compares source vs. target per table:

- Counts for all tables; full id-set diffs (missing + extra) plus id-checksums
  for the six row tables.
- Numeric rollups: `priceSumCents` and `stockSum` (products), `qtySum`
  (cart_items, order_items), `priceSumCents` (order_items),
  `totalCentsSum` (orders, from `financials.totalAmountInCents`).
- Seven PG referential-integrity queries (orphan user / product references).

Exit codes: `0` PASS · `1` core data loss (Mongo rows missing from PG) or hard
failure · `2` `--strict` violated by extra PG rows.

## Approved quarantines (documented exceptions)

The current dataset has exactly one orphan wishlist item and one orphan order
line:

- wishlist product `6a940ab7845fa9999ee6d6b1` → quarantined (item not imported).
- order product `6a93561a58481dbcf41eeb31` → line imported with `product_id NULL`.

Reconciliation reflects this as a `wishlistItems` deficit of 1. Pass
`--quarantine-expect wishlistItems=1` to treat it as the known, approved
exception so the run reports **PASS** instead of **WARN**. When the live DB
grows, review new quarantines before importing.

## Staging rehearsal procedure

```bash
createdb evo_market_staging          # or any fresh DB
DATABASE_URL="postgresql://postgres@/evo_market_staging?host=/tmp/opencode/pgdata&port=55432" \
  node src/scripts/migration/import-mongo.js \
  --backup /path/to/mongodb-backup --insert --reset --force

DATABASE_URL="..." \
  node src/scripts/migration/reconcile-import.js \
  --backup /path/to/mongodb-backup --quarantine-expect wishlistItems=1
# expect: Reconciliation result: PASS

# prove idempotency (second run does 0 work):
DATABASE_URL="..." \
  node src/scripts/migration/import-mongo.js --backup /path/to/mongodb-backup --insert
# expect: every phase "checkpoint hit ... 0 phases"
```

Accepted rehearsal exit criteria (plan Phase 5):

1. Import is idempotent — a second run performs no inserts.
2. No unexplained core row loss — the reconciler reports all missing-set and
   rollup counts at zero.
3. Exceptions are approved — every quarantine maps to a ledger entry /
   `--quarantine-expect`.
4. Runtime is within the maintenance freeze window (currently ~0.7 s).

## Live-Mongo vs. backup source

Both scripts accept either `MONGO_URL` (live) or `--backup <dir>`; the mapping,
quirks, report and exit behavior are identical. `--backup` merely replaces the
source-fetch step via `json-source.js`.

## Phase 6 — client-conformance rehearsal

`backend/src/scripts/rehearsal/client-conformance.js` reproduces the exact call
patterns of both frontends (`frontend/evo_market` storefront and
`frontend/admin_dashboard`) against the imported staging PostgreSQL and asserts
the response shapes those clients depend on. It is destructive against
rehearsal-only data (registers throwaway users/carts/orders), so it must never
be pointed at production.

```bash
# boot the staging PG-mode server once:
DATA_MODE=postgres JWT_SEC="phase6-rehearsal-secret" \
DATABASE_URL="postgresql://postgres@/evo_market_staging?host=/tmp/opencode/pgdata&port=55432" \
PORT=5002 node index.js &        # ready: {"postgres":true}

# run the 63-check conformance suite:
BASE_URL=http://localhost:5002 \
DATABASE_URL="postgresql://postgres@/evo_market_staging?host=/tmp/opencode/pgdata&port=55432" \
node src/scripts/rehearsal/client-conformance.js
# expect: 63 checks, 0 failure(s) — REHEARSAL PASS
```

### Contract discoveries made by the rehearsal (do not regress)

- Login/admin-login take `{ username, password }`, not email.
- Change-password requires `{ currentPassword, newPassword, confirmNewPassword }`.
- Paginated endpoints (`/api/products/all`, `/api/orders/`) return
  `{ data: [...], meta: { totalPages, page, total, limit } }`; both admin slices
  read `action.payload.data.meta` and render `meta.totalPages`.
- Cart/wishlist `POST create` return 200 (clients only test success).
- Order items carry `_id` (= product id) plus `productId`, `title`, `img`,
  `priceAtOrderInCents`, `quantity`; order `_id` is hex-24.
- Address create expects camelCase `firstName`/`lastName`; set-default returns
  `{ addresses }`; a second address is required to exercise set-default (the
  server 400s on already-default, which the storefront UI never triggers).
- Customer order delete is owner-scoped and returns 404 for other users' orders.
- Admin orders list/toggle/delete need order rows to exist — the harness seeds
  one per run.

### Phase 6 code changes shipped in this pass

- `products.repository.js`: public `findById` and `searchByTitle` now exclude
  disabled (`is_deleted = true`) products, matching the public catalog
  (`listFiltered` was already filtering). Internal delete/toggle read with
  `{ includeDeleted: true }` so admins can still manage disabled rows.
- `orders.repository.js`: detailed/minimized order items now also expose
  `productId` (was `_id` only) for Mongo-shape parity with the cart lines.
- `addresses.usecases.js`: "cannot unset default for the only address" now
  triggers only on an explicit `isDefault === false` (partial updates that omit
  the flag no longer 400).

### Plan decisions for Phase 6 (resolved)

- **Stale-total UI**: cart totals are always derived server-side from the live
  catalog on every read/add/update; the client re-fetches on each open, so no
  persisted run-rate drift is user-visible. No client change required.
- **Transactional cart clearing**: order creation does NOT auto-clear the cart
  (line snapshots must survive for the order record). The storefront fires
  `clearCart()` after a successful order create, then reloads. Single-user,
  single-session flow — documented as the accepted trade-off.
## Phase 7 — Production cutover runbook

Objective (plan §Phase 7): switch the sole production writer to PostgreSQL with a
bounded write freeze, then reopen writes. Before anyone flips live traffic, run
this entire checklist on a disposable target — the syntax below is already
production-shaped.

### Preconditions (hard gates — do not start until all are checked)

- [ ] Phase 5/6 rehearsals logged PASS (this runbook, sections above).
- [ ] Restore rehearsal logged PASS: `db:backup` → `db:restore` into a scratch DB
      → `db:reconcile` reports `Reconciliation result: PASS`. (Proven locally on
      `roundtrip_src`→`roundtrip_dst` during Phase 7 prep.)
- [ ] Freeze window approved and announced; on-call owner named; rollback owner
      same as rollout owner.
- [ ] Production PostgreSQL provisioned and reachable by the deployed backend
      (managed PG, non-empty `DATABASE_URL`, `DB_SSL=true` if required).
- [ ] Write access to the deployed env (Vercel / host console) for `DATA_MODE`,
      `DATABASE_URL`, `JWT_SEC`, `CORS_ORIGIN`, Cloudinary vars.
- [ ] Live source MongoDB reachable **at freeze time** for the final export, or an
      operator-generated fresh mongoexport tarball staged beside this runbook.

### Sequence (freeze → final import → switch → smoke → reopen)

1. **Freeze writes.** Announce the maintenance window. Disable route creation
   (e.g. Vercel "Pause" or a maintenance page short-circuit at the edge). Mongo
   stays live until the next step so reads keep working.
2. **Final source backup.** On a machine with Atlas/`MONGO_URL` access, export a
   fresh `mongoexport --jsonArray` dump of all six collections into a new dir:
   ```bash
   mongoexport --uri "$MONGO_URL" --db test --collection orders --jsonArray -o test.orders.json   # × users/products/addresses/carts/wishlists/orders
   ```
   Keep this dir read-only; attach it to the release tag (rollback reference).
3. **Final import.** Idempotent, checkpointed; against the production-only
   `roundtrip_src`-verified importer:
   ```bash
   DATABASE_URL="$PROD_DATABASE_URL" MONGO_BACKUP_DIR=/path/to/final-export \
     node src/scripts/migration/import-mongo.js --reset --insert
   ```
   `--reset` re-runs migrations and drops the `public` schema — only safe on a
   freshly provisioned PG that is not yet on traffic.
4. **Reconcile the final import (hard stop gate):**
   ```bash
   DATABASE_URL="$PROD_DATABASE_URL" MONGO_BACKUP_DIR=/path/to/final-export \
     node src/scripts/migration/reconcile-import.js --quarantine-expect wishlistItems=1
   # must end with: Reconciliation result: PASS   (0 missing, 0 extra, 0 orphans)
   ```
   Any FAIL blocks cutover (see rollback, below).
5. **Pre-write PG backups.** Take the first restorable PG snapshot so a full
   revert to Mongo can round-trip any PG-only writes that occur later:
   ```bash
   DATABASE_URL="$PROD_DATABASE_URL" node src/scripts/migration/backup-db.js
   ```
6. **Deploy PG configuration.** On the host/console: set `DATA_MODE=postgres`,
   `DATABASE_URL`, `JWT_SEC`, `CORS_ORIGIN`, Cloudinary vars; deploy the same
   release the rehearsals used. Verify `/api/ready` → `{"postgres": true}`.
7. **Smoke the critical flows against production PG** (frontends pointed at the
   deployed URL): register/login, catalog + disabled product hidden, cart add
   (server-derived price) + cart detailed, wishlist check, address create +
   set-default + find-default, checkout → order create (server totals) + order
   detailed, admin login → orders list/search/detail/status PATCH, admin product
   create (Cloudinary) + edit + disable + delete, customer order delete.
8. **Reopen writes.** Remove the maintenance short-circuit, announce completion.
9. **Post-reopen checks.** Watch pool connection counts, `/api/health` and
   `/api/ready`, first real order, first admin upload.

### Rollback gates (Section 29 of the plan)

- Before step 6 (writes still on Mongo): restore Mongo release/config, remove PG
  release from traffic, verify Mongo, reopen. **Nothing in steps 1–5 is
  irreversible** if no PG traffic was served.
- After step 6: Mongo is stale. Prefer reverting to a previous PG-compatible
  build. Returning to Mongo requires: freeze writes, reverse-export the PG
  snapshot through the reviewed reverse importer, verify, then switch. Decision
  owner + window must be named in the freeze notice.
- Do not delete the final Mongo export or the pre-write PG dump until the
  rollback window and retention periods expire (plan §29).

### Environment/access matrix (operator supplies)

| Item | Needed for | Held where |
| --- | --- | --- |
| Live Mongo export at freeze time | final import source | operator machine with Atlas access |
| Managed PostgreSQL + `DATABASE_URL` / `DB_SSL` | production writer | host console (Vercel Postgres/Neon/Supabase) |
| `DATA_MODE`, `JWT_SEC`, `CORS_ORIGIN`, Cloudinary | deployed env | host console / secrets |
| Freeze window + on-call owner | step 1 + rollback | announced by operator |
| Set event name tag on the release | rollback provenance | git tag / release log |

### Phase 7 — local-first variant (production not deployed yet)

Applied on this machine — the "production" cutover currently targets a local
first deployment, not a live traffic switch. Proven sequence (log from
`evo_market_prod` on port 55432, PG-mode backend on `:5003`):

```bash
# representative "production" database, bootstrapped exactly like the runbook's
# step 3 (fresh DB + reset import + reconcile gate):
createdb ... evo_market_prod
DATABASE_URL="$PROD_DATABASE_URL" MONGO_BACKUP_DIR="$(git rev-parse --show-toplevel)/mongodb-backup" \
  node src/scripts/migration/import-mongo.js --reset --insert
DATABASE_URL="$PROD_DATABASE_URL" MONGO_BACKUP_DIR="$(git rev-parse --show-toplevel)/mongodb-backup" \
  node src/scripts/migration/reconcile-import.js --quarantine-expect wishlistItems=1
# -> Reconciliation result: PASS

# production configuration (backend/.env.example is the authoritative template):
DATA_MODE=postgres DATABASE_URL="$PROD_DATABASE_URL" JWT_SEC=... CORS_ORIGIN=... \
  DB_SSL=false DATABASE_POOL_MAX=10 PORT=5003 node index.js
# -> /api/ready: {"ready":true,"postgres":true}

# smoke = the 63-check client conformance harness:
BASE_URL=http://localhost:5003 node src/scripts/rehearsal/client-conformance.js
# -> 63 checks, 0 failure(s) — REHEARSAL PASS
```

The freeze/announce/cutover-owner steps are **no-ops until a real deployment
exists**; when Vercel (or a host) is configured, re-run the full sequence above
with the live URI replacing `$PROD_DATABASE_URL` and the maintenance page
replacing the freeze steps.

### Disaster recovery — re-initialize the local cluster after a `/tmp` wipe

The local cluster lives in `/tmp` (`/tmp/opencode/pgdata`) and disappears on
reboot. The **data never lives in `/tmp`** — recovery is one command, and the
sources are the two durable repo artifacts (dumps in `backups/`; canonical
snapshot in `<repo-root>/mongodb-backup/`).

```bash
cd backend
npm run db:reinit:local            # restore dumps (fast, byte-exact current state)
npm run db:reinit:local -- --import  # canonical path: reset-import from mongodb-backup
```

Behavior (`backend/src/scripts/migration/reinit-local.js`, env overrides
`PGDATA`, `PGPORT`, `SKIP_START=1`):
1. `initdb` + `pg_ctl start` the cluster on `127.0.0.1:55432` (trust auth) if
   not already running;
2. create missing databases `evo_market_staging` / `evo_market_prod` /
   `evo_market_test`;
3. restore the newest matching dump per DB (`pg_restore --clean`, byte-exact),
   or with `--import` run the canonical importer against the repo snapshot;
4. print connect hints + the ephemeral warning.

Notes:
- `evo_market_test` has no dump (unit tests are DB-free) — it is created empty;
  `--import` also skips it.
- Default restore reproduces the exact state the rehearsals left behind
  (includes harness-created rows). `--import` yields the pristine canonical
  snapshot instead.
- Run after stopping the local PG-mode servers; restore `--clean` drops objects
  under them. Verify with `/api/ready` → `{"postgres":true}` and
  `base_url=:PORT node src/scripts/rehearsal/client-conformance.js`.
- Manual fallback (no script):
  `export PATH=/usr/lib/postgresql/16/bin:$PATH`, `initdb -D /tmp/opencode/pgdata -U postgres --auth=trust`,
  `pg_ctl -D /tmp/opencode/pgdata -o "-p 55432 -k /tmp/opencode/pgdata -h 127.0.0.1" -w start`,
  `createdb` the three DBs, then restore each `backups/*.dump` or re-import.


### Reverse importer (rollback path §29) — PostgreSQL -> EJSON

For the "return to Mongo" rollback after PG writes, the reviewed reverse importer
snapshots the PostgreSQL state back into mongoexport-shaped EJSON:

```bash
DATABASE_URL="$PG" npm run db:export:mongo            # -> <scripts>/exports/<stamp>/test.*.json
DATABASE_URL="$PG" node src/scripts/migration/export-mongo.js --out /path/to/dir
```

Behavior (`backend/src/scripts/migration/export-mongo.js`):
- Emits all six domain collections (`test.{users,products,addresses,carts,
  wishlists,orders}.json`) with `{ $oid }` ids, `{ $date }` timestamps, and the
  original field names (`desc`/`img`/`amount`/`isDeleted`/`password`, carts and
  wishlists `userId` as plain strings — legacy shape).
- Runs the **importer dry-run** on its own output as built-in validation
  (`--skip-validate` disables) and writes an `reports/export-*.json` manifest.
- Reproducible: child-table item `_id`s (cart/wishlist/order items) are re-derived
  deterministically (`sha1(parentId:position)`); the same DB always yields the
  same files.

Fidelity notes (reviewer-visible, by design):
- Synthetic PG-only columns are not re-materialized: `order_items` product
  title/image snapshots (import artifacts) are dropped on rollback.
- Quarantined source refs are absent from PG by FK design and are not
  re-materialized (see the originating import quarantine report).
- `shippingInfo.estimatedDeliveryDate` is emitted iff `estimated_delivery_at`
  is set (the importer populates it from `shippingInfo`, so round-trips hold).

Round-trip proof (run on a clean canonical import, this repo):
```bash
createdb rt_src rt_dst     # fresh scratch DBs
# import canonical snapshot -> rt_src
# export rt_src -> E1       ; import E1 -> rt_dst ; export rt_dst -> E2
# diff -r E1 E2             -> IDENTICAL (fixed point)
# reconcile rt_src & rt_dst vs E1 -> PASS (counts, rollups, integrity 0)
```
Result recorded during Phase 7 prep: `users 4 / products 21 / carts 3 /
cartItems 2 / wishlists 2 / orders 1 / orderItems 1`, immutability `exportA ==
exportB`, and `Reconciliation result: PASS` on both sides.

Rollback usage (§29 after-writes): freeze writes, run this exporter against the
staged PG snapshot, reconcile, load the EJSON into the retained Mongo release
(via the declared reverse path), verify, then switch back. The reverse export is
a snapshot, not a CDC log — repeat the export at the rollback moment, never
reuse an old file.

Clean up: `dropdb rt_src rt_dst` after review; `exports/` and `backups/` are
gitignored artifacts.


## Phase 8 - Retirement prep checklist (audit complete, do-not-execute)

Execution of Phase 8 is gated on **stabilization, restore verification, and
retention approval** (plan Section 29 / Section 31 DoD): Mongo stays a valid
rollback target until the deployed PG system has proven itself and the rollback
window plus the read-only Mongo backup retention period expire. Nothing below
has been deleted.

### Runtime Mongo footprint (what Phase 8 removes)
| Area | Files | Notes |
| --- | --- | --- |
| Mongoose models | `models/{Address,Cart,Order,Product,User,Wishlist}.js` | Legacy Mongo models; deleted once rollback window closes |
| Legacy routers | `routes/*Router.js` (esp. `orderRouter.js`, `userRouter.js` use `mongoose.Types.ObjectId`) | Served only when `DATA_MODE !== control` |
| App wiring | `src/app.js` - `require("mongoose")`, `mongoRouters`, `/api/ready` mongo branch | Make PG-only: drop mongoose + `mongoRouters`; readiness = postgres only |
| Boot/lifecycle | `src/server.js` - `connectMongo()`, `mongoose.disconnect()` on shutdown | Drop; keep PG-only `validateEnv("postgres")` |
| Config | `src/config/env.js` - `MONGO_URL`; `REQUIREMENTS.process = ["MONGO_URL"]` | Remove `MONGO_URL`; PG mode becomes the only mode |
| Entrypoint | `index.js` -> `src/app.js` transitively loads mongoose even in PG mode | Micro-opt: guard/remove the top-level mongoose require so the serverless bundle is PG-only |

### Migration/rollback tooling (KEEP at Phase 8)
`src/scripts/migration/{import-mongo,inspect-mongo,preview-import,
reconcile-import}.js`, `json-source.js`, `mapping.js` are the only remaining
Mongo consumers after runtime removal, and are the **rollback instruments**.
Retire their live-`MONGO_URL` paths only after the Mongo release/backup is no
longer a recovery target; the `--backup` EJSON (json-source) path can stay as a
supplier of the canonical snapshot. `backend/backups/` + `exports/` evidence
stays in place until retention approval.

### Unused dependencies (audited - remove at Phase 8)
`crypto-js`, `stripe`, `multer`, `multer-storage-cloudinary` appear **nowhere**
in the codebase (0 require sites). Cloudinary uploads in the PG stack go
through `src/modules/products/infrastructure/cloudinary.provider.js` (base64 to
Cloudinary API) and need none of these.
- Remove: `crypto-js`, `stripe`, `multer`, `multer-storage-cloudinary`
- Post-removal: prune `package-lock.json` + `yarn.lock`, reinstall with the
  pinned runtime (plan Section 31), re-run `npm test`, the conformance harness,
  and one product-create with an image.
- `nodemon` powers pkg:scripts `start`; either keep or move to devDependencies.

### Sequence (runs only after approval)
1. Verify PG backups restorable + Mongo backup retained read-only (already
   proven here; re-verify at that date).
2. Remove unused deps (`npm un crypto-js stripe multer multer-storage-cloudinary`),
   dedupe lockfiles.
3. Make runtime PG-only: `src/app.js` (routers/ready), `src/server.js`,
   `src/config/env.js`; drop `MONGO_URL` from `.env.example` + `REQUIREMENTS`.
4. Delete `models/` + legacy `routes/*Router.js`; confirm no remaining requires.
5. Keep migration tooling (rollback instruments); re-document restore/recovery.
6. Reconcile old plan/Docs (mark phases, remove transitional notes).
Exit: Section 31 DoD - one authoritative PG system, no critical issues, owner
can recover.


### Phase 8 - EXECUTION LOG (runtime Mongo retirement shipped)

Authorized by owner (25-Sep). Runtime is now PostgreSQL-only; the legacy Mongo
runtime path is gone. Migration/rollback tooling (import/reconcile/export +
`mongoose`/`MONGO_URL` in `src/scripts/migration/*`) is intentionally RETAINED as
the rollback instrument and canonical-snapshot supplier.

Changes shipped:
- `src/config/env.js` - removed `MONGO_URL` + `DATA_MODE`; `REQUIREMENTS.postgres
  = ["JWT_SEC", "DATABASE_URL"]`; `validateEnv` defaults to postgres.
- `src/app.js` - removed `mongoose` import + `mongoRouters`; routers + `/api/ready`
  are PG-only (`mongo: null`).
- `src/server.js` - boot validates postgres only; no Mongo connect/disconnect.
- `middleware/UserValidation.js` - removed `models/User` (`checkUserFields` dropped;
  the PG usecases use only the pure validators, which stay).
- Module http routers now import token middleware directly from
  `src/shared/http/auth-middleware` (the old `routes/verifyToken.js` re-export
  shim deleted).
- Deleted `models/` (6 Mongoose models) and `routes/` (7 legacy Mongo routers +
  verifyToken shim). `../routes/`-style consumers no longer exist.
- `.env.example` - `MONGO_URL`/`DATA_MODE` removed; PG-only template.
- Retained: `mongoose` dependency + `src/scripts/migration/{import-mongo,
  inspect-mongo,preview-import,reconcile-import}.js`, `json-source.js`,
  `mapping.js`, `export-mongo.js`, backups/evidence.

Verification on the retired build:
- Boot PG-only with only `JWT_SEC` + `DATABASE_URL` (no Mongo env): `/api/ready`
  `{"postgres":true}` on staging and prod-shaped servers.
- `npm test` 20/20; conformance harness 63/63 PASS (register/login, catalog +
  disabled-product, cart/wishlist/address, checkout/orders, admin, Cloudinary
  upload, deletes).
- `db:reinit:local`, `db:backup`/`db:restore`, `db:reconcile`,
  `db:export:mongo`, `db:status` all exercised earlier and unaffected (they
  never require the removed runtime).

Mongo retirement is now effectively complete short of the DEPLOYED PG system
spending its rollback window (no deployment exists yet). Remaining Phase 8
steps hold by definition: monitor rollback window, verify backups at that date,
retention approval.
