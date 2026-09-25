# Architecture & MongoDB to PostgreSQL Migration Plan

## 1. Executive Summary

EVO MARKET is a React storefront plus an admin dashboard backed by a small CommonJS Express API. The API has six Mongoose models and seven route modules. Route handlers currently combine HTTP handling, Mongoose access, aggregation, and business rules. No backend tests or database migration history were found.

Move to a modular monolith with application use cases, PostgreSQL repositories, and a SQL-first access layer. Keep current API paths and JSON shapes at first; response mappers will preserve Mongo-shaped _id fields and nested objects while storage becomes relational. Normalize carts, wishlists, order lines, and password history into child tables. Keep an order's shipping address as a purchase-time snapshot. Keep product categories as a PostgreSQL text array until the application actually needs managed category records.

Use PostgreSQL with node-postgres (pg) and versioned SQL migrations (node-pg-migrate). This fits the existing JavaScript/CommonJS backend and modest domain size: SQL remains visible, joins map naturally from the current aggregations, and transaction boundaries are explicit. Preserve existing 24-character Mongo ObjectId strings as primary keys so JWT claims, frontend customer IDs, URLs, and references continue to work.

The lowest-risk practical cutover is a controlled write freeze, idempotent final import, reconciliation, and deployment switch. No traffic volume or zero-downtime requirement is evidenced. Avoid dual writes: Mongo and PostgreSQL cannot participate in one atomic request transaction with this application, so dual-write failures can diverge orders and carts. This plan therefore expects a short write interruption. If uninterrupted writes become mandatory, add and rehearse a separate change-capture/replication design first.

The live Mongo data was not available for inspection. Counts, malformed values, duplicates, category element types, price units, orphan references, and historical statuses are UNKNOWN / REQUIRES VERIFICATION. The import must produce an auditable exception report and stop on unresolved account, order, identity, or financial inconsistencies.

This document is the requested plan only. No backend source, configuration, dependencies, or database were changed while preparing it.

## 2. Project Overview

### Repository evidence

- Backend entry point: backend/index.js.
- Routes: backend/routes/authRouter.js, userRouter.js, productRouter.js, cartRouter.js, orderRouter.js, addressRouter.js, wishlistRouter.js, and verifyToken.js.
- Models: backend/models/User.js, Product.js, Address.js, Cart.js, Wishlist.js, and Order.js.
- Supporting code: backend/middleware/UserValidation.js, backend/middleware/General.js, backend/config/cloudinary.js.
- Storefront and admin are separate Vite applications under frontend/evo_market and frontend/admin_dashboard. Both use VITE_BASE_URL and the same API.
- Backend is CommonJS, Express 4.17 and Mongoose 6.0.5 according to backend/package.json and package-lock.json. backend/yarn.lock also exists. package.json declares Node ^22.22.0 while lock metadata says Node 20.16.0; confirm and align the actual runtime.
- backend/vercel.json configures an @vercel/node build for index.js. No Dockerfile, Compose file, CI workflow, or backend test suite was found. The backend test script exits with “no test specified”.
- backend/.env and frontend .env files are ignored by Git. Only variable names were inspected, not values. Backend reads MONGO_URL, JWT_SEC, PORT, and Cloudinary settings. The local backend key list showed Cloudinary names only; whether MONGO_URL and JWT_SEC are deployment secrets is UNKNOWN.
- backend/ARCHITECTURE_MIGRATION_PLAN.md is a tracked, short earlier outline. Reconcile it with this root-level, project-specific plan during later documentation cleanup; it is not evidence that live schema/data were validated.
- macOS AppleDouble files such as backend/routes/._authRouter.js and backend/routes/._verifyToken.js exist. Confirm they are metadata and exclude from runtime/import scope.

### Implemented business areas

Accounts, password changes, admin authentication, products, category/size/color filtering, title search, pagination, Cloudinary images, one cart and wishlist per account, addresses/default selection, and orders with line items, financials, shipping address, tracking, and status. The storefront displays cash-on-delivery and credit-card choices, but no Stripe calls, charge flow, webhook, refund, or payment record was found. Coupon, review, rating-write, brand, product-variant, email, notification, and background-job modules were not found.

## 3. Current Architecture

The actual request path is generally:

1. backend/index.js creates the Express app, imports routers, installs JSON/urlencoded parsers and CORS, starts a Mongoose connection, mounts routes, then calls app.listen.
2. A route in backend/routes handles HTTP and invokes middleware from routes/verifyToken.js when protected.
3. The route imports Mongoose models directly and queries or mutates collections. Some handlers run Mongo aggregation pipelines and joins.
4. Routes return Mongoose documents or hand-built objects. No response DTO/mapper layer or centralized error middleware exists.

This is a route-centric monolith, not a consistent controller/service/repository architecture. Models provide some validation/defaults, but most business logic lives in routes. There are no service or repository modules. The Address model has a pre-save hook, but routes also implement default-address policy. Modules directly require each other or database models; there is no formal composition root.

| Concern | Current implementation |
| --- | --- |
| HTTP/API | Express routers mounted under /api in backend/index.js |
| Authentication | JWT in backend/routes/verifyToken.js; login/register in authRouter.js |
| Authorization | isAdmin boolean claim and URL parameter ID equality |
| Validation | UserValidation.js for registration; otherwise scattered checks and frontend validation |
| Persistence | Direct Mongoose model calls in route handlers |
| Transactions | Mongo session only in user deletion; address defaults and checkout/cart workflows are multi-step |
| Errors | Per-handler try/catch with inconsistent status/body; some async work is outside try/catch |
| Logging | console.log/console.error; no request IDs, structured logger, or metrics |
| Integrations | Cloudinary in productRouter.js; config/cloudinary.js duplicates configuration and appears unused |
| Tests | None found for backend; package test script is a placeholder |
| Deployment | Vercel config exists, but index.js always binds a listener and does not document serverless startup |

## 4. Current Architecture Problems

| Finding and location | Why it matters | Replacement / migration handling |
| --- | --- | --- |
| Every route imports Mongoose; cartRouter.js is 480 lines, orderRouter.js 406, wishlistRouter.js 375, addressRouter.js 210 | HTTP, persistence, joins, and policy are coupled; SQL migration would otherwise become a large route rewrite. | Add per-module use cases and repositories. Keep route adapters stable, then migrate bounded endpoint groups. |
| productRouter.js, cartRouter.js, wishlistRouter.js, orderRouter.js contain aggregation and business rules | Handlers are hard to test; Mongo operators are entangled with API responses. | Move SQL to repositories and business rules to use cases; map SQL rows to the existing API shapes. |
| verifyToken in routes/verifyToken.js sends a 403 on JWT error but continues to set req.user and call next; malformed headers can yield an undefined token | An invalid token may reach handlers after an error response and cause crashes/double sends. | Return immediately on verification error; validate Bearer token shape and attach a verified principal. Keep legacy token header only if a client uses it. |
| Owner checks often validate only URL :id. Order deletion authorizes that path ID but deletes by order ID alone. Address GET /find/:id/:addressId queries by address ID only. Cart/wishlist creation trusts body userId after authentication. | Cross-user reads/deletes and writes under another user are possible. | Derive user ID from JWT; include owner ID in every customer-scoped SQL predicate; use explicit admin policies. |
| Order create persists new Order(req.body); frontend supplies userId, item prices, totals, discounts, shipping costs, address, and payment method | User controls financial truth and identity fields; stock is not checked/decremented. | Retain request shape, but derive user from principal and recalculate prices/totals from database. Validate address and quantities. Confirm stock semantics before decrementing. |
| Cart add/remove trusts client price; detailed cart recomputes from product price | Stored total and displayed total may disagree or be tampered with. | Persist quantities only and derive total from current product prices. Accept price temporarily for compatibility but ignore it. |
| Cart general update filters on userID, while model field is userId; update also accepts arbitrary body | Likely misses cart and allows uncontrolled field mutation. | Allowlist fields, bind by principal ownership, and deprecate only after verifying no client uses this endpoint. |
| userRouter spreads req.body into user update; password update here bypasses strength/history logic; role/history fields can be mutated. Register strips password but not passwordHistory; list/detail/profile strip password only. | Mass assignment can alter isAdmin and leaks credential hashes. | Separate profile/password/role use cases; allowlist fields; never return password/history. Treat as security fix before or with cutover. |
| Registration checks duplicate values before insert; only database uniqueness prevents races. Errors are ad hoc. | Concurrent requests can pass pre-checks; clients see inconsistent failures. | Keep unique constraints and map named PostgreSQL unique violations to stable conflict responses. |
| Address.js hook filters on user despite schema field userId; addressRouter separately changes defaults with multiple operations and no transaction. | Hook is ineffective; concurrent writes may create multiple defaults or none; delete fallback is arbitrary. | Partial unique index by user where is_default=true plus serialized transaction and deterministic fallback order. |
| Orders/Addresses use ObjectId references while Cart/Wishlist IDs are strings; cart/wishlist join by stringifying product _id | Referential integrity is uneven; malformed strings and orphans must be audited. | Preserve IDs as varchar(24), resolve string references, add FKs after audit. |
| Cart, wishlist, and order arrays are embedded; order financial/address/shipping objects are embedded snapshots | Arrays are hard to constrain/update transactionally; order item title/image are not snapshotted and detail joins current products. | Normalize mutable child rows; preserve order shipping and product snapshots; reconstruct old nested API shape in mappers. |
| Order.js status enum says cancelled; PATCH route accepts canceled; frontend helper expects canceled | Admin status update may fail validation and UI spellings differ. | Normalize to canceled after migration, accept both spellings during transition, and test both clients. |
| Handler-specific catches return raw errors, strings, and differing JSON; some initial queries are outside try/catch | Internal detail leakage and unhandled async errors. | Async route wrapper and centralized error mapping with safe production responses. |
| Product search uses case-insensitive regex; pagination is unbounded; public find/search and /all treat disabled products inconsistently | Expensive scans, unbounded responses, and inconsistent visibility. | Bound page/limit; use trigram index if supported; define public/admin visibility policy explicitly before changing behavior. |
| Checkout saves an order, then Redux separately calls clear-cart | Failure/retry can leave cart uncleared or create duplicate orders. | Create order and clear cart in one PostgreSQL transaction; add idempotency support with coordinated client behavior. |
| User deletion uses Mongo transaction and removes orders as well as cart/address/wishlist | Mongo transactions require replica-set support; account deletion destroys order history. | PostgreSQL cascade can match current effect, but confirm retention policy before cutover. |
| index.js logs DB failure but listens anyway; dotenv is loaded after route imports; same entrypoint binds listener for Vercel | App can serve without DB readiness; serverless behavior is unclear. | Validate env on boot, separate app export from local listener, await PG readiness in process mode. |
| Cloudinary is configured twice and image upload/provider operations live in route; base64 is accepted in a 5 MB JSON body | Duplicate config, hard-to-test external side effects, and provider/database inconsistency. | Inject Cloudinary adapter; preserve base64 contract; compensate failed DB writes by deleting new upload. |
| package.json, package-lock and yarn.lock create multiple lock/runtime sources; declared Node engine conflicts with lock metadata | Build/runtime may be irreproducible. | Confirm platform, choose one package manager, align supported Node version and lockfile. |
| Stripe, crypto-js, multer, and multer-storage-cloudinary are declared but no related calls were found; Cloudinary SDK is used | Unused packages increase maintenance surface; credit-card UI may imply unsupported processing. | Audit deployment use before removal. Keep Cloudinary. Do not build payment processing as part of DB migration. |

## 5. Current Module/Dependency Analysis

- Auth/account: authRouter.js directly queries User and uses bcrypt/JWT. userRouter.js owns profile update, account deletion, password changes, and admin reads.
- Catalog: productRouter.js owns CRUD, Cloudinary upload, filters, search, and pagination.
- Addresses: addressRouter.js owns default selection and CRUD.
- Cart: cartRouter.js owns per-user cart, item changes, totals, and Mongo joins.
- Wishlist: wishlistRouter.js owns membership, duplicate checks, and Mongo joins.
- Orders: orderRouter.js owns create/status/delete/list/search and Mongo user/product joins.
- Shared: verifyToken.js is router-adjacent auth logic; UserValidation.js mixes registration checks and password-history helpers; General.js only rounds numbers.
- Infrastructure: Mongo connection is in index.js. Cloudinary config is duplicated.

Current dependency flow: backend/index.js → route modules → Mongoose models → MongoDB. Routes also import JWT, bcrypt, and Cloudinary directly. Frontend API helpers call routes; Redux performs follow-up requests such as clearing cart after order creation.

Target flow: HTTP route/controller → application use case → domain policy and repository contract → infrastructure repository → PostgreSQL.

Allowed: HTTP adapters depend on use cases and input schemas; use cases depend on repositories/transaction runner/provider interfaces; repositories depend on pg; domain functions remain pure; product application code may call a Cloudinary interface.

Forbidden: controllers importing pg/SQL; domain/use-case modules importing Express or reading process.env; repositories choosing HTTP status; modules reaching into each other's tables; new code importing Mongoose outside the isolated importer.

## 6. Target Architecture

Use a modular monolith with pragmatic clean/ports-and-adapters boundaries. It fits the six related domains, one API deployment, and lack of evidence for independently scaled services. Microservices would add distributed transaction/deployment risk without solving the current repository problem.

Within each module:
- HTTP/interface: route registration, request parsing, authentication attachment, controller, response mapper.
- Application: use cases, orchestration, ownership checks, transaction scopes.
- Domain: pure calculations and invariants such as order totals, status transitions, and default-address selection.
- Infrastructure: PostgreSQL repositories and provider adapters.
- Shared infrastructure: environment, pool, transaction runner, JWT/password adapters, logger, HTTP errors.

Stay in CommonJS JavaScript for the storage migration and add JSDoc contracts. Do not combine the SQL cutover with a full TypeScript rewrite. A later typed migration can be separate.

A use case that changes multiple rows owns the transaction and passes a checked-out pg client to repositories. Repositories do not start nested transactions. Roll back on failure and respond only after commit. Cloudinary cannot join a SQL transaction: upload, write SQL, then delete the new upload on SQL failure; for old asset deletion, persist first and use idempotent cleanup with retry logging.

Request schemas validate shape, lengths, and enums; use cases validate current business state and ownership; PostgreSQL enforces durable uniqueness/FKs/checks. Translate named DB constraints into safe API errors.

## 7. Target Project Structure

Proposed under backend; these paths do not currently exist.

    backend/
      src/
        app.js
        server.js
        config/
          env.js
          logger.js
        shared/
          database/
            pool.js
            transaction.js
            migrations/
          http/
            async-handler.js
            error-middleware.js
            api-error.js
            auth-middleware.js
          security/
            password.js
            jwt.js
          validation/
        modules/
          auth/{http,application,infrastructure}
          users/{http,application,infrastructure}
          products/{http,application,infrastructure}
          addresses/{http,application,infrastructure}
          carts/{http,application,infrastructure}
          wishlists/{http,application,infrastructure}
          orders/{http,application,domain,infrastructure}
        scripts/
          migration/
            inspect-mongo.js
            import-mongo-to-postgres.js
            reconcile-migration.js

Controllers parse and format only. Application files own workflows. Domain owns pure rules. Repositories own bound SQL and row mapping. Shared code owns cross-cutting infrastructure, not business rules. The importer is a one-off tool and never runs on server startup. Keep old root files as delegating compatibility entrypoints during refactor; remove only after all runtime/deployment imports switch.

## 8. Module-by-Module Architecture

| Module | Owns | Must not own |
| --- | --- | --- |
| Auth | Register/login/admin-login, password verification, token issue | General profile mass update or response writes from repository |
| Users | Safe profile, password history/change, account deletion, admin reads | Token parsing or unrestricted role mutation |
| Products | CRUD, visibility, filters/search/pagination, stock semantics, upload orchestration | SQL/Cloudinary calls in controllers |
| Addresses | CRUD, ownership, one-default invariant | Trust URL/body owner ID |
| Carts | One cart per user, quantities, derived totals and product projection | Client-authored prices or authoritative stored total |
| Wishlists | Ordered product membership and duplicate policy | Unvalidated product IDs |
| Orders | Checkout pricing, snapshots, state transitions, projections | Browser financial truth or pretend payment processing |
| Shared | Pool, transactions, errors, logging, auth middleware, env | E-commerce domain policy |

## 9. MongoDB Current Data Model

Model definitions are from backend/models. Actual raw data and historical schema versions are UNKNOWN. Mongoose collection names are users, products, addresses, carts, wishlists, orders.

| Collection / model | Fields and behavior | References / embedded values | Indexes and query patterns |
| --- | --- | --- | --- |
| users / User | firstname/lastname nullable; username/email/password required; username/email unique; passwordHistory string array; isAdmin required default false; gender nullable; phone required unique; timestamps | Password history array | Unique username/email/phone. Lookups by username, uniqueness checks, _id; admin lists all. |
| products / Product | title/desc/img required; title unique; categories untyped Array; size/color optional; price Number; rating 0..5 default 0; amount Number required min 1; isDeleted default false; timestamps | Categories may contain mixed values because schema uses generic Array | Unique title. Filter not deleted, category $in, exact size/color; sort createdAt; title regex search; _id lookup. |
| addresses / Address | userId ObjectId required; fullAddress/phoneNumber/firstName/lastName required; label null/Home/Work; isDefault false; timestamps | User ObjectId reference; Address fields copied into Order | No explicit indexes. Queries by user/default/_id. Hook filters wrong field name (user). |
| carts / Cart | userId unique required string; products[{productId string, quantity Number default 1}]; totalPrice Number default 0; timestamps | User/product refs are strings, not declared refs | Unique userId. Joins product by stringified _id; admin all. |
| wishlists / Wishlist | userId unique required string; products[{productId string}]; timestamps | User/product refs are strings | Unique userId. Joins product by stringified _id; admin all. |
| orders / Order | userId ObjectId; item productId ObjectId, quantity min 1, priceAtOrderInCents Number; financials subtotalInCents, discount, shippingCostInCents, totalAmountInCents, currency default USD; shipping address required fields; status pending/processing/delivered/cancelled; paymentMethod required; shippingInfo tracking/date; timestamps | User/Product refs; financials/address/shipping embedded; line title/image not snapshotted | No explicit indexes. Queries by userId/_id/createdAt; aggregations join user and products. |

Important facts:
- Cart/Wishlist IDs are strings while Order/Address refs are ObjectIds. Creation routes accept request bodies; normal mutations use JWT.
- Admin product form sets amount to 1 by default; a Product model TODO calls it stock, but checkout does not decrement it. Verify meaning and lifecycle.
- Product price is decimal in frontend and checkout multiplies by 100 for order line cents. Verify all persisted products use major currency units.
- Frontend sends financials in cents, but schema does not specify unit for discount. Verify historical data.
- Address label may be null in model, while frontend order validation requires a label.
- No populate() or explicit compound indexes found; enrichment uses aggregate $lookup.

## 10. PostgreSQL Target Data Model

Use snake_case columns and named constraints. Store timestamps as UTC timestamptz. Use BIGINT for cents, convert to JS Number only when safely representable.

### users
| Column | Type / rules |
| --- | --- |
| id | varchar(24) primary key, source User _id; new IDs 24 hex |
| firstname, lastname | text nullable |
| username, email | text not null, each unique |
| password_hash | text not null, preserve bcrypt hash |
| is_admin | boolean not null default false |
| gender | text nullable; no enum without audit |
| phone | text not null unique; preserve formatting |
| created_at, updated_at | timestamptz not null, preserve timestamps |

### user_password_history
user_id varchar(24) references users ON DELETE CASCADE; position smallint; password_hash text not null; primary key (user_id, position). Position preserves Mongo array order. Do not invent change timestamps absent from source.

### products
| Column | Type / rules |
| --- | --- |
| id | varchar(24) primary key |
| title | text not null unique, initially preserve exact case-sensitive semantics |
| description, image_url | text not null; map desc/img |
| categories | text[] nullable or empty according to audit; only after confirming all values are strings |
| size, color | text nullable |
| price | numeric(12,2) not null after confirming major units |
| rating | numeric(3,2) not null default 0, check 0..5 after precision audit |
| stock_quantity | integer not null, map amount after confirmation; check >=0 is an intentional relaxation from old min 1 |
| is_deleted | boolean not null default false |
| created_at, updated_at | timestamptz |

If categories contain non-string values, do not silently stringify; stage for repair or use a temporary JSONB compatibility field pending review.

### addresses
id varchar(24) primary key; user_id varchar(24) not null FK users ON DELETE CASCADE; full_address, phone_number, first_name, last_name text not null; label nullable text with Home/Work check; is_default boolean not null default false; created_at/updated_at timestamptz. Add partial unique index on user_id WHERE is_default=true. This enforces at most one default; application ensures at least one only if that invariant is approved.

### carts and cart_items
carts: id varchar(24) primary key; user_id varchar(24) not null unique FK users ON DELETE CASCADE; timestamps.
cart_items: cart_id FK carts ON DELETE CASCADE; product_id varchar(24) FK products ON DELETE CASCADE after orphan audit; quantity integer not null check >0; position integer not null; primary key (cart_id,position). Position preserves source array order. Do not persist total_price as authority; calculate from current product price for API output. Audit duplicate product rows before optionally adding unique(cart_id,product_id).

### wishlists and wishlist_items
wishlists: id varchar(24) primary key; user_id varchar(24) not null unique FK users ON DELETE CASCADE; timestamps.
wishlist_items: wishlist_id FK wishlists ON DELETE CASCADE; product_id varchar(24) not null FK products ON DELETE CASCADE after orphan audit; position integer not null; primary key (wishlist_id,position); unique(wishlist_id,product_id) after duplicate audit.

### orders and order_items
orders: id varchar(24) primary key; user_id varchar(24) not null FK users ON DELETE CASCADE initially to match current deletion behavior, subject to retention decision; subtotal_in_cents, discount_in_cents, shipping_cost_in_cents, total_amount_in_cents BIGINT not null check >=0; currency char(3) not null default USD; status text not null with approved status check; payment_method text not null; tracking_number text nullable; estimated_delivery_at timestamptz nullable; ship_to_full_address, ship_to_phone_number, ship_to_first_name, ship_to_last_name text not null; ship_to_label nullable; created_at/updated_at timestamptz.
order_items: order_id FK orders ON DELETE CASCADE; line_number integer; product_id varchar(24) nullable FK products ON DELETE SET NULL; product_title_snapshot and product_image_snapshot nullable; quantity integer not null check >0; price_at_order_in_cents BIGINT not null check >=0; primary key (order_id,line_number). Backfill title/image from current product where possible; unresolved historical lines remain with null FK/snapshots and are reported.

## 11. MongoDB → PostgreSQL Mapping

| Mongo source | PostgreSQL target | Transformation |
| --- | --- | --- |
| User _id | users.id | Exact lower-case ObjectId string |
| User.password | users.password_hash | Preserve bcrypt hash; do not rehash |
| passwordHistory[n] | user_password_history | Preserve hash and array position; restrict exports |
| Product | products | desc→description, img→image_url, amount→stock_quantity after semantics audit |
| categories[] | products.categories | Preserve string array/order; reject or report mixed values |
| Address | addresses | Convert userId ObjectId to 24-hex; enforce FK after orphan audit |
| Cart | carts + cart_items | Parse string user/product IDs, preserve item order, derive total on read |
| Wishlist | wishlists + wishlist_items | Preserve order, resolve IDs, enforce uniqueness after duplicate audit |
| Order | orders + order_items | Flatten fixed financial/shipping values; expand items in order |
| Order item product ref | order_items.product_id + snapshots | Join current product for title/image; retain line if product is missing |
| status cancelled | status canceled | Explicitly normalize to spelling expected by frontend/admin; accept both during transition |
| createdAt/updatedAt | timestamps | Preserve UTC instants; log fallback for missing values |

Do not create tables for brands, variants, reviews, coupons, payment transactions, or shipping events: no model or API flow was found. No JSONB is needed for the known fixed fields.

## 12. Relationship & Normalization Strategy

- User to Address is one-to-many.
- User to Cart and Wishlist are one-to-one by unique user_id.
- Cart/Wishlist to item is one-to-many; normalize for FKs, ordered output, and mutations.
- Product to cart/wishlist rows is one-to-many. Product hard-delete should cascade ephemeral membership only after dangling data is resolved; prefer soft-disable for catalog removal.
- User to Order is one-to-many. Current account deletion removes orders too; retain cascade only if business owner confirms. Otherwise design anonymization/retention explicitly.
- Order to OrderItem is one-to-many; snapshot title/image because current detail routes join mutable product values.
- Product categories are unmodeled string arrays. Start with text[] and GIN if values are strings. Add categories/product_categories only if categories gain metadata or lifecycle.
- Size/color are scalar values, not variants, in this codebase.
- Order shipping address is a snapshot, never a FK to current Address.
- Flatten known financial fields to columns and map back to nested financials; flatten shipping tracking/date and map to shippingInfo.
- Normalize password history into a restricted table to preserve current password-reuse behavior.
- JSONB should be introduced only for a genuinely variable integration payload with redaction/retention policy.

## 13. ORM / Data Access Strategy

### Decision: pg + node-pg-migrate

Use node-postgres for bound SQL and transactions; node-pg-migrate for versioned schema changes. Repositories own SQL and return plain rows; mappers reconstruct current camelCase/nested API structures.

Why it fits:
- Six modest domains and current joins do not require a large ORM.
- Needed PostgreSQL features include partial unique indexes, array GIN search, transaction-scoped writes, and explicit delete semantics.
- CommonJS JS can adopt it without simultaneous TypeScript conversion.
- Query plans and transactional semantics remain visible.
- Schema migration lifecycle is independent of request execution.

Tradeoffs:
- Prisma offers generated query APIs and schema but has limited compile-time value here without TypeScript; custom indexes/SQL still need migrations. Viable if generated CRUD is a team priority.
- Drizzle is TypeScript-oriented; current backend is untyped CommonJS.
- TypeORM adds more runtime/entity abstraction than this project needs.
- Knex is a valid builder but adds abstraction without removing custom SQL/migration needs.
- With raw SQL, bind every value and allowlist dynamic identifiers/sort directions.

No PostgreSQL driver/migration tool is currently installed. Add dependencies only during implementation and maintain one lockfile.

Implementation references: node-pg-migrate's [maintainer documentation](https://github.com/salsita/node-pg-migrate) describes its PostgreSQL migration workflow. node-postgres requires all statements in a transaction to use the same checked-out client, which is why the transaction runner must pass one client through repositories ([transaction documentation](https://node-postgres.com/features/transactions)).

## 14. Migration Strategy

Use expand, import, freeze, cut over, verify:

1. Preflight Mongo/PostgreSQL versions, deployment runtime, collection counts/indexes, backups, data owner, and recovery process. Take and restore-test consistent Mongo backup.
2. Provision local/staging/production PostgreSQL, least-privilege application and migration roles, TLS and pool strategy suitable for Vercel.
3. Add reviewed SQL migrations. Never run schema migration automatically on each serverless request.
4. Audit raw Mongo data for counts, duplicates, types, missing fields, orphans, dates, prices, quantities, statuses, totals.
5. Build a streaming, restartable importer and rejected-row report. Import in dependency order: users/products; addresses; carts/wishlists and items; orders and items; password history.
6. Rehearse production-like snapshot import and reconciliation repeatedly in staging. Exercise both frontends.
7. Deploy PostgreSQL-backed repositories with unchanged API adapters. Each deployed revision must use one authoritative DB; no dual-writes.
8. During maintenance, block writes, stop/revoke Mongo writers, take final backup, import final snapshot/delta, reconcile, deploy PG config/release, smoke critical workflows, then reopen writes.
9. Keep Mongo available read-only during rollback window. PostgreSQL becomes sole source after cutover.
10. Retire Mongo only after acceptance, backup/restore readiness, and retention approval.

No zero-downtime need is evidenced. If write freeze is unacceptable, design CDC using Mongo change streams or a proven tool, including deletes, ordering, resume tokens, and reconciliation. Do not improvise dual-write route handlers.

## 15. Data Transformation Strategy

The importer must stream raw documents and be idempotent by source ID; record snapshot time, source counts, batches, outcomes, and per-record disposition. Use protected audit artifacts and never log passwords/hashes.

- Validate parent IDs as 24-hex; preserve bcrypt hashes and timestamps.
- Preserve name/email/phone/title case and spacing at first. Report exact duplicates for constraints and separately identify case/trim collisions before changing normalization semantics.
- Apply documented Mongoose defaults only where appropriate; report missing timestamps and substituted defaults.
- Validate price scale/range, stock integer semantics, rating, positive quantities, safe-integer cents, and nonnegative financials before conversion.
- Compare order totals to subtotal minus discount plus shipping; report mismatches rather than rewriting historical amounts.
- Do not treat stored Cart.totalPrice as authority; compare diagnostically and recalculate for API output.
- Preserve categories only if every value is a string; quarantine unexpected shapes.
- Resolve cart/wishlist user/product strings. Report unresolved items and require owner approval before dropping mutable membership.
- Missing required Address/Order user is a blocking error; never invent an account.
- Missing Order product: preserve line, price, quantity, and position; set product_id null and backfill snapshot only if product exists.
- Duplicate usernames/email/phone/title are blocking; no automatic account/product merge.
- Import order: users → products → addresses → carts/items → wishlists/items → orders/items → password history.
- Reconcile source/target counts, IDs, item counts/order, FKs, unique values, timestamp ranges, status/currency distributions, financials, and representative API responses. Verify hashes securely without outputting values.
- No unexplained loss of users, products, addresses, orders, or order items is acceptable before cutover.

## 16. ID Strategy

Preserve Mongo ObjectIds as varchar(24), lower-case hex, and generate future IDs as 12 random bytes in hex. Keep public JSON _id via mapping.

This avoids rewriting JWT IDs and storefront/admin URLs, and works with ObjectId fields plus Cart/Wishlist string references. Validate every parent ID. Malformed cart/wishlist references are data exceptions, not replacement IDs. Use an exception mapping only with review. External systems storing Mongo IDs are UNKNOWN and must be inventoried. UUID adoption, if desired, is a separate API/versioning project.

## 17. Transaction Strategy

| Operation | Transaction contents | Failure and concurrency |
| --- | --- | --- |
| Checkout | Validate principal/address/products; recalculate prices/totals; insert order/items; optionally decrement stock after semantics confirmed; clear cart if applicable | Roll back all database writes on failure. Lock or conditionally update stock. Add idempotency key to prevent double submission. |
| Default address switch | Serialize by user/address set; unset old; set selected; partial unique index is final guard | Concurrent attempts serialize; rollback on conflict. |
| Delete default address | Delete owned address and select deterministic next default in same transaction | No default if no addresses remain. Return updatedAddresses shape. |
| Account deletion | Delete user and dependents atomically via FK cascade/transaction | Preserve current order cascade only after retention policy approval. |
| Cart mutation | Lock cart, add/update/remove ordered item, commit | Prevent lost updates; derive total rather than write totalPrice. |
| Wishlist mutation | Insert/delete membership and maintain order | Unique constraint handles duplicate races; preserve 400 semantics. |
| Order status | Validate transition and conditionally update expected state | Prevent concurrent admin overwrite; use conflict response on stale transition. |
| Product and Cloudinary | Upload then persist; compensate upload if SQL fails; persist replacement before old asset cleanup | Provider work is not transactional; cleanup must be idempotent/retryable. |

Product.amount likely represents stock but is not decremented today. Do not add stock mutation until semantics, zero-stock behavior, cancellation/restock policy, and admin editing are confirmed.

## 18. Validation & Error Handling

Use request schemas per route, preferably Zod, while keeping backend validation authoritative.

- Validate route IDs as 24-hex; page >=1; bounded limit (initial cap 100); sorting asc/desc; bounded search/filter strings.
- Registration preserves username/email/password/phone fields and current Egypt phone rule until localization is approved. Explicitly choose future normalization and limits.
- Product routes allowlist title, desc, img, categories, size, color, price, rating, amount, isDeleted only in appropriate admin operations.
- Cart validates productId and positive integer quantity; accepts legacy price only temporarily and ignores it.
- Address validates allowlisted fields and label; ownership comes from principal.
- Order validates nonempty items, positive quantities, products, owned address, and supported payment method; server calculates totals.
- PostgreSQL enforces uniqueness, references, quantity/status/label/rating constraints and one default.
- Add ApiError and centralized error middleware. Map validation→400, auth→401, forbidden→403, missing→404, duplicate/conflict→409, unexpected→500. Never return SQL/provider details or hashes.
- Use async handler wrapper and final not-found handler. Keep current expected response structures first; consistent error envelope can be a later coordinated API change.

## 19. Authentication & Authorization

Preserve auth routes and JWT bearer response shape; initially preserve customer 7-day and admin 3-day expiry. Verify use before removing the legacy token header.

- Never return password/passwordHistory; register currently leaks history.
- Use authenticated principal ID in customer writes; do not trust body userId.
- Scope every customer resource query by both resource ID and principal ID.
- Keep isAdmin boolean initially; prevent profile update from changing it. Add RBAC only if roles expand.
- Verify existing bcrypt hashes as-is; no mass rehash/reset.
- Decide separately whether password changes revoke old JWTs; current token has no revocation/version claim.
- Add regression cases for invalid/expired/missing tokens, non-admin, owner and cross-owner access.

## 20. Security Improvements

Prioritize JWT return control flow; owner checks; profile field allowlists; password-history response leak; server-authoritative order prices and principal identity. Then add parameterized SQL and allowlisted sort fields, CORS allowlist after verifying origins, Helmet/security headers, login/register rate limits, body/image limits, startup env validation, managed secrets, least-privilege DB roles, TLS, and PII/hash log redaction.

The storefront allows credit_card selection, but no Stripe charge or webhook exists. Preserve paymentMethod as text during data migration; do not imply payment was captured. Decide separately whether to disable this choice or implement payment processing.

## 21. API Compatibility Strategy

Keep current route paths, methods, bearer auth, IDs, and success payloads initially. Mappers preserve _id, camelCase timestamps, nested financials/shippingAddress/shippingInfo and products[].productDetails.

| Group | Existing contract to preserve | Notes |
| --- | --- | --- |
| Auth | POST /api/auth/register, /login, /admin-login | Return {accessToken,userInfo}; omit credential hashes. |
| Users | PUT/DELETE /api/users/:id; GET /api/users; GET /find/:id; POST /change-password/:id; GET /check-username/:username | Keep safe fields and expected responses; add owner/role checks. |
| Products | POST/GET /api/products; PUT /:id; DELETE /:id/:productId; PATCH /disable/:id/:productId; GET /find/:id; GET /all; GET /search/:productName | Preserve legacy fields and /all data/meta. Public disabled-item policy needs explicit decision. |
| Carts | POST/GET /api/carts; PUT/DELETE /:id; POST /add_update-product/:id and /remove-product/:id; PUT /clear/:id; GET /find/:id and /cart_detailed_products/:id | Preserve products, quantity, productDetails, totalPrice, _id, userId; total is now DB-derived. |
| Wishlists | POST/GET /api/wishlist; POST add/remove; PUT clear; DELETE /:id; GET find/detailed/check-product | Preserve nested product shape and isInWishlist. |
| Addresses | POST/GET /api/addresses/:id; GET find/find-default; PUT update/set-default; DELETE /:id/:addressId | Preserve sorted list and updatedAddresses. Enforce ownership. |
| Orders | POST/GET /api/orders/:id; PUT /:id; PATCH /:orderId/:status; DELETE /:id/:orderId and /:orderId; GET find/detailed/min/search | Preserve customer/admin projections and pagination metadata. Fix owner predicate. |

Intentional changes:
- Server totals/prices replace client totals. Stale totals may require UI confirmation.
- Order and cart clearing become one transaction instead of a second Redux clear request.
- Normalize cancelled to canceled because admin/frontend use canceled; accept both during transition.
- Cross-user paths previously exposed will return 403/404.
- Product visibility needs decision because /all, find, and search currently differ.
- Address label is nullable in model but required by checkout form validation; resolve policy.
- Avoid field renames or /v2 unless unavoidable.

## 22. Performance & Indexing

Only index observed queries; primary keys and unique constraints already create indexes.

| Index | Supports | Cost/condition |
| --- | --- | --- |
| users unique username/email/phone | Login, registration checks | Required for correctness; write overhead on user changes |
| products unique title | Existing uniqueness | Required |
| products(created_at DESC,id) | /products/all pagination | Stabilizes ties and sort |
| products GIN(categories) | Category overlap filters | Only if categories are strings and query uses overlap; PostgreSQL GIN array operator classes support overlap/containment operators ([documentation](https://www.postgresql.org/docs/17/indexes-types.html)) |
| products(size,color) or partial variants | Exact filters plus active status | Add after EXPLAIN; low-cardinality fields may not justify |
| products trigram GIN on title | Case-insensitive contains search | Requires pg_trgm availability; otherwise measure bounded ILIKE |
| addresses(user_id) partial where is_default | Default uniqueness/list | Partial unique index required; optional created_at support after plans |
| carts unique(user_id), cart_items(cart_id,position) | Cart lookup and ordered output | Unique index doubles as lookup |
| cart_items(product_id) | Product join/cascade | PostgreSQL does not auto-index FK columns |
| wishlists unique(user_id), wishlist_items unique(wishlist_id,product_id), position | Lookup, duplicate prevention, order | Only add product uniqueness after duplicate audit |
| orders(user_id,created_at DESC,id) | Customer history | Confirm newest-first behavior |
| orders(created_at DESC,id) | Admin pagination | Directly supports current sort |
| order_items(order_id,line_number), product_id | Detail join and FK lifecycle | Primary/secondary join support |
| user_password_history(user_id,position) | Last-five password reuse | Bounded lookup |

Do not add status or analytics indexes without an endpoint. Bound limit/page. Consider keyset pagination later. Use EXPLAIN ANALYZE with representative data and review write/storage overhead; PostgreSQL indexes improve lookup paths but add system overhead, so each should be justified by the measured query pattern ([documentation](https://www.postgresql.org/docs/17/indexes.html)). Confirm compatibility with the PostgreSQL version actually installed/provisioned.

## 23. Testing Strategy

No tests were run during plan preparation. Build regression coverage before switching storage; current backend test is a placeholder.

Before migration: API contract fixtures for both clients; unit tests for JWT, schemas, pricing/cents, status normalization, password history, and default-address selection; authorization tests for every owner/admin route, especially order deletion, address lookup, cart/wishlist create, user update/list.

During implementation: PostgreSQL integration tests for migrations from empty schema, every FK/unique/check/partial index, delete behavior, query projections and mappers. Transaction tests force checkout failures and concurrent checkout/address/cart changes. Migration fixtures cover defaults/nulls, malformed IDs, duplicates, orphan records, bad quantities/prices, duplicate cart lines, both status spellings, missing timestamps. Test importer restart/idempotency and reconciliation.

Before cutover: full workflows for customer register/login, browse/search, cart/wishlist, address/default, checkout/history/detail/password/delete; admin login, product CRUD/disable/upload, order list/search/detail/status/delete, customer listing. Verify existing bcrypt hashes authenticate. Restore-test both DB backups in staging.

After cutover: production-safe smoke flows, reconcile counts and monitor API errors, pool pressure, latency and checkout consistency. Agree measurable rollback thresholds before the freeze.

## 24. Observability

Use structured JSON logs with request ID, route, method, status, duration, safe actor ID, and error code. Never log passwords, hashes, JWTs, full addresses, card data, PII SQL parameters, or secrets. Add liveness and database readiness endpoints. Track request latency/5xx, pool active/idle/waiting/errors, slow SQL, checkout failures, and migration imported/rejected counts. Use pg_stat_statements only if supported. Alert on readiness failures, checkout errors, pool exhaustion, and reconciliation mismatch. Existing Vercel/platform logs are sufficient initially; do not add Prometheus/Grafana absent a need.

## 25. Environment & DevOps Changes

Expected server configuration:
- DATABASE_URL for PostgreSQL, with TLS by environment/provider.
- DATABASE_POOL_MAX and connection timeout sized for Vercel; use provider pooler when needed.
- MONGO_URL temporarily for importer/rollback, removed from runtime after retirement.
- JWT_SEC, currently used but not seen in local backend key names; require managed secret.
- PORT only for process server; app module does not listen.
- Existing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.
- NODE_ENV, explicit CORS allowed origins, separate migration-role credentials.
- VITE_BASE_URL remains frontend build configuration and is not a backend DB secret.

Keep env values out of Git; add a tracked example with placeholder values only. Add explicit dev/start, db:migrate/status, seed, inspect/import/reconcile scripts. Production migrations run once per deployment, not per serverless request. Separate app export for Vercel from local server listen; rehearse actual Vercel routing. Confirm platform runtime and package manager; backend package metadata currently disagrees. Use one lockfile. No Docker is required by repository. Add isolated test DB and guard against production URL. Define PostgreSQL backups, retention, restore tests, and PITR based on provider capabilities. Seed only development/test users, never default production admin credentials.

## 26. File-by-File Migration Mapping

Target paths are proposed; all listed current paths were found.

| Current file | Current responsibility / issue | Target/action | Phase |
| --- | --- | --- | --- |
| backend/index.js | App, Mongo connection, router mount, listener; startup readiness/serverless ambiguity | Split to src/app.js and src/server.js; pg readiness | 1,2,7 |
| backend/routes/authRouter.js | Register/login/admin login and direct model/bcrypt/JWT | modules/auth HTTP/use cases/repository | 4 |
| backend/routes/verifyToken.js | JWT and role/owner checks; error continues | shared/http/auth-middleware.js | 1,4 |
| backend/routes/userRouter.js | Profile, deletion, password, admin read; mass assignment | modules/users routes/use cases/repository | 1,4 |
| backend/routes/productRouter.js | CRUD/search/filter/pagination and Cloudinary in route | modules/products layers and provider adapter | 4 |
| backend/routes/cartRouter.js | CRUD, math, aggregation, client price, userID typo | modules/carts layers, child rows, derived totals | 4 |
| backend/routes/wishlistRouter.js | CRUD and repeated aggregation | modules/wishlists layers and child rows | 4 |
| backend/routes/addressRouter.js | CRUD/default policy, ownership gap, nonatomic updates | modules/addresses; transaction and unique index | 4 |
| backend/routes/orderRouter.js | CRUD/status/list/search/aggregation, trusted body, status mismatch | modules/orders layers, transaction, mapper | 4 |
| backend/models/User.js | Mongoose schema and uniqueness | Remove after user/auth repository and importer switch | 4,8 |
| backend/models/Product.js | Product schema | Remove after product repository/importer switch | 4,8 |
| backend/models/Address.js | Address schema and broken default hook | Remove after address repository switch | 4,8 |
| backend/models/Cart.js | Embedded items/stored total | Remove after cart child-table repository | 4,8 |
| backend/models/Wishlist.js | Embedded IDs | Remove after wishlist repository | 4,8 |
| backend/models/Order.js | Embedded items/snapshots and enum | Remove after order repository/import | 4,8 |
| backend/middleware/UserValidation.js | Mongoose existence check mixed with password helpers | Split request schemas, pure security helpers, use cases | 1,4 |
| backend/middleware/General.js | Floating rounding helper | Replace with cents/decimal money helpers | 1,4 |
| backend/config/cloudinary.js | Duplicate/unused provider config | Move to products infrastructure adapter, then remove | 4,8 |
| backend/package.json | Dependencies, nodemon start, placeholder test, engine mismatch | Add pg/migration tooling, scripts, align runtime | 2 |
| backend/package-lock.json | npm lock metadata mismatch | Regenerate with chosen runtime/package manager | 2 |
| backend/yarn.lock | Competing lockfile | Verify platform usage; remove if npm canonical | 2,8 |
| backend/vercel.json | Serverless entry/routing | Point to reviewed app export and verify staging | 7 |
| backend/.env | Ignored local configuration; do not disclose contents | Keep untracked; add safe example names | 2 |
| backend/routes/._authRouter.js, ._verifyToken.js | AppleDouble artifacts | Verify metadata and exclude; cleanup later | 8 |
| backend/ARCHITECTURE_MIGRATION_PLAN.md | Existing short outline | Reconcile/supersede during docs cleanup | 8 |

Frontend contract dependencies (not in scope for source edits during plan): frontend/evo_market/src/API/{Address,Cart,Customer,Orders,Product,Wishlist}APIFunctions.js; frontend/admin_dashboard/src/API/{Admin,Orders,Product}APIFunctions.js; CompleteCheckoutModal.jsx and orderRelatedFunctions.js; storefront OrdersSlice and Cart API slice; customer/admin order views; admin product forms. Coordinate only accepted behavior changes.

## 27. Phased Execution Plan

### Phase 0 — Verify data and business semantics
Objective: resolve DDL/import unknowns. Inspect Mongo/PG versions, runtime, counts/indexes, category types, price/discount units, amount/stock meaning, payment/status values, address label behavior, account-order retention, origins, backup restore, and external ID consumers.
Files: read-only backend models/routes, frontend clients, deployment settings.
Preconditions: operational read-only access and owner decisions.
Exit: signed data dictionary/audit, restore-tested Mongo backup, stock/money decisions.
Risk/rollback: no changes; defer unresolved constraints rather than invent data.

### Phase 1 — Contract/security baseline
Objective: capture actual contracts and fix critical auth/ownership gaps on Mongo.
Files: verifyToken.js, auth/user/address/order/cart/wishlist routes, UserValidation.js.
Tasks: fixtures, JWT return fix, owner predicates, body allowlists, password-history removal, safe errors.
Exit: customer/admin contract and authorization regression passes.
Risk: previously exposed paths may become 403/404; preserve legitimate client behavior, never restore vulnerability.

### Phase 2 — PostgreSQL foundation
Objective: add PG access and migration discipline without production switch.
Files: package metadata/lock, new shared database/config, app/server split, vercel.json.
Tasks: choose runtime/package manager, add pg/node-pg-migrate, env validation, pool/transaction runner, health/readiness, empty schema migration process.
Exit: clean local/staging migration and Vercel startup; pool capacity verified.
Rollback: app still on Mongo; revert foundation deployment if boot fails.

### Phase 3 — Schema and query prototypes
Objective: implement reviewed schema, constraints, indexes, and representative SQL projections.
Files: new SQL migrations/repository prototypes.
Preconditions: Phase 0 decisions.
Exit: schema matches Section 10; constraint checks and EXPLAIN reviewed.
Rollback: discard local/staging schema; no production migration yet.

### Phase 4 — Repositories and use cases
Objective: replace direct Mongoose per module, in order auth/users, products, addresses, carts/wishlists, then orders.
Files: backend routes/models plus new modules.
Tasks: stable adapters, schemas, use cases, repositories, row mappers, transactions; one DB per deployment.
Exit: integration and API regression suites pass; PG mode has no route Mongoose imports.
Risk: rollback whole release to Mongo before PG accepts production writes.

### Phase 5 — Importer/reconciliation
Objective: repeatably migrate source data.
Files: new scripts/migration/* and runbook.
Tasks: audit, streaming importer, quarantine report, checkpoints, counts/checksums, reconciliation; repeated staging rehearsals.
Exit: idempotent import, no unexplained core row loss, exceptions approved, runtime within freeze window.
Rollback: reset disposable staging target; source unchanged.

### Phase 6 — Frontend/API rehearsal
Status: DONE — see `backend/src/scripts/migration/RUNBOOK.md` "Phase 6" for the
conformance runbook and the stale-total / cart-clearing decisions.
Objective: verify both clients against imported staging PG.
Tasks: auth, catalog/admin upload, cart/wishlist/address, checkout/orders, pagination, status spellings; decide stale-total UI and transactional cart clearing.
Files: route adapters and only coordinated frontend call sites listed above if needed.
Exit: complete staging workflows pass.
Rollback: revert frontend contract changes independently before production.

### Phase 7 — Production cutover
Objective: switch sole production writer with bounded write freeze.
Tasks: maintenance/write block, stop/revoke Mongo writers, final backup, final import/delta, reconcile IDs/counts/FKs/order totals, deploy PG configuration, smoke workflows, reopen writes.
Preconditions: successful rehearsal, restore-tested backups, approved freeze and on-call owner.
Exit: reconciliations pass and critical flows are healthy.
Rollback: before PG writes, revert to Mongo; after writes, use Section 29.

### Phase 8 — Stabilize and retire Mongo
Status: runtime Mongo retirement EXECUTED (25-Sep); migration tooling retained as
rollback instrument. Remaining gating: deployed rollback window + retention approval.
Execution log in `backend/src/scripts/migration/RUNBOOK.md` -> "Phase 8".
Objective: remove transitional code safely.
Tasks: monitor rollback window, verify PG backups, remove Mongoose/models/MONGO_URL/unused deps, document restore/runbook, reconcile old plan.
Exit: one authoritative PG system, no critical issues, owner can recover.
Rollback: retain tagged Mongo release and backup until window/retention approval.

## 28. Risk Register

| Risk | Likelihood / impact | Detection | Mitigation | Recovery |
| --- | --- | --- | --- | --- |
| Duplicate identities/titles, bad references | Medium / High | Preflight unique/orphan report | Reviewed repair ledger; block on conflicts | Re-import after approved repair |
| Price/discount units inconsistent | Medium / Critical | Ranges and order-total reconciliation | Confirm units; preserve historical totals | Stop cutover, correct transform |
| Client totals/ownership remain trusted | High / Critical | Tamper and authorization tests | Principal-derived ID, server price calculation | Disable checkout/maintenance; revert before writes |
| Malformed IDs or string refs | Low-medium / High | ID and FK audit | Preserve IDs; reviewed exception policy | Block affected import |
| Dangling/duplicate cart/wishlist lines | Medium / Medium | Per-item reconciliation | Owner-approved cleanup/merge | Re-import |
| Concurrent default changes | Medium / High | concurrency tests/unique violation logs | Partial index and serialized transaction | rollback request and retry |
| Historical order detail depends on current Product | Medium / High | API diff including deleted products | Snapshot where possible; retain line | Repair mapper/snapshots |
| Vercel DB pool exhaustion | Medium / High | pool wait, readiness and connection metrics | Small reusable pool/pooler | tune or temporary maintenance |
| Vercel entrypoint change fails | Medium / High | deployed route smoke | staging parity and split app/server | revert release/config |
| Hash/PII leak in migration or API | Low / Critical | response/log inspection | restrict artifacts, DTO allowlist, redaction | incident response, revoke access/tokens |
| Status normalization breaks UI | Medium / Medium | both-client status matrix | aliases and canonical mapper | revert mapper pending coordination |
| Order/cart retry inconsistency | High / High | forced-failure/retry tests | one transaction and idempotency | reconcile duplicate/missing cart |
| Cloudinary/SQL divergence | Medium / Medium | provider/db logs | compensating idempotent cleanup | re-upload/retry cleanup |
| Rollback after PG writes loses new data | Medium / Critical | cutover log/reconciliation | rollback gate and reverse-export plan | freeze, reverse reconcile or stay on PG |
| Backup not restorable | Low-medium / Critical | restore rehearsal | define RPO/RTO and verify | delay retirement |
| Runtime/lock mismatch | Medium / Medium | build/deploy rehearsal | pin supported runtime and one lock | revert known-good release |

## 29. Rollback Strategy

Before PostgreSQL accepts production writes: Mongo remains unchanged. Restore Mongo-backed release/config, remove PG release from traffic, verify Mongo, then reopen writes.

After PostgreSQL accepts writes, Mongo is stale. Do not point old code back at it without recovering new writes. Preferred rollback is a previous application build that is PostgreSQL-compatible. If returning to Mongo is necessary, freeze writes, export/reconcile PostgreSQL changes through a reviewed reverse importer, verify, then switch. Define decision owner, thresholds, rollback window, and feasibility before cutover.

Use additive migrations and safe downs for local/staging. Dropping data is not a production rollback strategy. Back up PostgreSQL before schema/data steps and restore-test. Keep Mongo backup read-only until retention and rollback windows expire.

## 30. Architectural Decision Records

### ADR-1: PostgreSQL
Context: owned addresses, carts/wishlists, orders, references, and multi-row invariants. Decision: PostgreSQL. Reason: relational integrity and transactions fit actual flows. Consequence: migration, connection, and SQL work; retain Mongo only during transition/backup.

### ADR-2: Modular monolith
Context: seven routes, six models, one API, related commerce domains. Decision: one modular deployable with per-domain use cases/repositories. Reason: controls refactor scope without distributed systems. Consequence: define cross-module contracts and avoid unnecessary services.

### ADR-3: pg and SQL migrations
Context: CommonJS JS, compact schema, partial indexes and aggregates. Decision: node-postgres and node-pg-migrate. Reason: visible SQL/transactions, no simultaneous TS migration. Consequence: review and test SQL/mappers; no compile-time types today.

### ADR-4: Preserve ObjectId strings
Context: JWTs, frontends, paths, and references expose current IDs. Decision: varchar(24) keys. Reason: avoid remapping/token invalidation. Consequence: generate 24-hex IDs even though PostgreSQL does not require it.

### ADR-5: Normalize mutable collections, preserve snapshots
Context: mutable arrays need constraints while orders need historical values. Decision: child tables for cart/wishlist/order items/password history; flattened order snapshots. Reason: joins and transaction integrity without changing API output. Consequence: importer preserves order and mappers reconstruct nested JSON.

### ADR-6: No dual-write
Context: independent databases cannot commit atomically and traffic requirements are unknown. Decision: maintenance freeze/final import. Reason: auditability and lower divergence risk. Consequence: short write outage; zero-downtime requires separate CDC design.

### ADR-7: Server-authoritative checkout
Context: browser sends prices/totals and route saves body. Decision: keep payload shape but recalculate from database/principal. Reason: integrity/security. Consequence: stale totals may need confirmation and tests.

### ADR-8: Do not invent domains
Context: no brand/variant/coupon/review/payment models found. Decision: model only observed domains; categories array and payment method text initially. Reason: avoid unsupported schema. Consequence: add new entities only with real workflows.

## 31. Definition of Done

- PostgreSQL schema/migrations are reviewed, repeatable, and applied in environments.
- Six Mongo model domains map to relational data with documented constraints/delete policies.
- Production import preserves IDs, bcrypt hashes, timestamps, order amounts, and line order; no unexplained core record loss.
- All invalid/duplicate/orphan cases have approved dispositions and redacted reconciliation evidence.
- Backend uses PostgreSQL repositories only; Mongo is not runtime dependency after retirement.
- Storefront/admin paths and expected payloads are compatible or explicitly versioned.
- Auth, authorization, password changes, products/uploads, cart, wishlist, addresses, checkout, orders, admin workflows pass regression coverage.
- Checkout pricing is server authoritative; stock policy explicitly agreed and transaction-tested.
- No invalid token continues; no cross-user access; no credential hashes in responses/logs.
- Default address, account deletion, order, cart, and wishlist invariants survive failures/concurrency.
- Health/readiness, logging, pool behavior, backups/restores, migration monitoring, and rollback runbook are operational.
- Vercel/runtime/package manager/lockfile are aligned; staging deployment succeeds.
- Mongo backup and PG restore are proven; recovery owner/path documented.
- Mongo removal follows stabilization and retention approval; no critical migration issues remain.

## 32. Final Implementation Checklist

### Discovery
- [ ] Confirm Mongo/PostgreSQL versions, production counts/indexes, runtime, external API consumers.
- [ ] Confirm price/discount units, amount/stock semantics, categories, payment/status values, address label rule, account/order retention.
- [ ] Restore-test Mongo backup; document PostgreSQL backup, RPO/RTO, freeze and cutover owner.
- [ ] Verify production origins and secret provisioning without committing credentials.

### Architecture/schema
- [ ] Add app/server split, modules, use cases, repositories, pool and transaction runner.
- [ ] Add versioned named SQL constraints and approved indexes.
- [ ] Preserve 24-character IDs and existing public JSON names.
- [ ] Normalize child tables and historical snapshots.
- [ ] Review query plans with representative data.

### Application correctness
- [ ] Remove Mongoose route calls; add explicit mappers.
- [ ] Fix JWT flow, owner checks, mass assignment, and credential exposure.
- [ ] Recalculate cart/order prices and decide stock behavior.
- [ ] Make checkout/cart clear and address-default transitions transactional.
- [ ] Normalize order status and product visibility with client compatibility.
- [ ] Isolate Cloudinary and audit unused dependencies.

### Migration/cutover
- [ ] Audit and resolve blocking duplicates, malformed IDs, invalid data, and required-reference orphans.
- [ ] Rehearse idempotent importer and reconciliation on production-like snapshot.
- [ ] Test both clients on staging PostgreSQL.
- [ ] Freeze writes, back up, import/reconcile, switch sole writer, smoke critical flows, reopen writes.
- [ ] Monitor rollback thresholds; retain Mongo read-only through agreed window.
- [ ] Remove Mongo only after stabilization, restore verification, and retention approval.
