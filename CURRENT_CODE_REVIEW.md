# Current Code Review — 2026-10-02

## Scope

Static review of the current working tree, including the checkout and product form changes. No source code was changed and no tests or builds were run.

## Findings

### P1 — Checkout modal throws because its idempotency helper is not imported

[`CompleteCheckoutModal.jsx`](frontend/evo_market/src/Components/CartPage/CompleteCheckoutModal/CompleteCheckoutModal.jsx#L21) imports `GetTokenAndUserId`, `IsUserLoggedIn`, and `GetEstimatedDeliveryDate`, but line 53 calls `newIdempotencyKey()` without importing it. [`CartPage.jsx`](frontend/evo_market/src/Components/CartPage/CartPage.jsx#L307) mounts this component when checkout is opened, so opening checkout raises a `ReferenceError` before the customer can place an order.

**Suggested fix:** Import `newIdempotencyKey` from `GeneralFunctions.js` and verify that opening checkout renders successfully.

### P1 — A changed server price can be accepted without showing the customer the new total

The API detects a mismatch between the cart preview and its server-calculated total, then creates the order and returns `staleCart` on it ([`orders.usecases.js`](backend/src/modules/orders/application/orders.usecases.js#L108)). The storefront API wrapper discards `response.data` and returns only a generic success object ([`OrdersAPIFunctions.js`](frontend/evo_market/src/API/OrdersAPIFunctions.js#L105)); the Redux thunk then checks `response.staleCart`, which is therefore always missing ([`ApiOrdersSlice.js`](frontend/evo_market/src/redux/OrdersSlice/ApiOrdersSlice.js#L31)). If a product price changes after the cart was loaded, the order can be placed at a different total from the one displayed, with no warning or renewed confirmation.

**Suggested fix:** Preserve the response order data through the API wrapper and make the storefront obtain customer confirmation when the authoritative total differs from its preview.

### P1 — Idempotency keys are lost when a checkout attempt is retried

The key lives only in a component `useRef` ([`CompleteCheckoutModal.jsx`](frontend/evo_market/src/Components/CartPage/CompleteCheckoutModal/CompleteCheckoutModal.jsx#L45)). The component is conditionally mounted by `CartPage` and unmounted when `handelPlaceOrder` closes the modal, even while the request is still in flight ([`CompleteCheckoutModal.jsx`](frontend/evo_market/src/Components/CartPage/CompleteCheckoutModal/CompleteCheckoutModal.jsx#L123), [`CartPage.jsx`](frontend/evo_market/src/Components/CartPage/CartPage.jsx#L307)). A retry after a timeout, lost response, or page reload therefore gets a fresh key. If the first request committed, the retry can create a second order instead of replaying the original.

**Suggested fix:** Keep the key for the checkout attempt until its result is known, including across modal unmounts and reloads; only rotate it after a confirmed successful order.

### P2 — Resetting the admin product form leaves an invalid blank rating

The add-product form reset sets `rating` to an empty string ([`ProductForm.jsx`](frontend/admin_dashboard/src/Components/DashboardSections/ProductsPage/ProductForm/ProductForm.jsx#L78)). `numericFormData` preserves that blank value, and backend validation permits an empty rating without converting it to a number ([`validation.js`](backend/src/shared/http/validation.js#L72)). The repository then uses nullish fallback, so `""` is sent to the numeric database column instead of the default `0` ([`products.repository.js`](backend/src/modules/products/infrastructure/products.repository.js#L48)). After using Reset, submitting an otherwise valid new product fails with a database validation error.

**Suggested fix:** Reset rating to `0`, or normalize a blank rating to the numeric default before repository insertion.

### P2 — Cart deletion bypasses the lock used by cart mutations

Cart creation, updates, item removal, clearing, and checkout serialize through the per-user advisory lock, but `deleteCart` directly deletes the row without taking that lock ([`carts.usecases.js`](backend/src/modules/carts/application/carts.usecases.js#L144)). If deletion races with an add/update, the mutation can attempt to insert cart items after the parent cart was deleted and fail its foreign-key constraint.

**Suggested fix:** Serialize cart deletion with the same per-user lock and add a concurrent delete-versus-update case to the integration coverage.

## Follow-up review — 2026-10-02

I rechecked these areas after the latest edits. The missing checkout helper import, the ordinary stale-total notification path, the normal idempotency-key lifecycle, the blank product-rating reset, and the unlocked cart deletion are corrected in the current working tree. The standard `sessionStorage` path now preserves the key across modal unmounts and rotates it after a confirmed order. The remaining findings are below.

### P1 — A second price change can be accepted without customer confirmation

When the customer confirms a changed total, the storefront retries with `acceptPricingChange: true` ([`CompleteCheckoutModal.jsx`](frontend/evo_market/src/Components/CartPage/CompleteCheckoutModal/CompleteCheckoutModal.jsx#L106)). The backend skips the stale-total conflict whenever that flag is true, even if the newly recalculated total has changed again since the confirmation ([`orders.usecases.js`](backend/src/modules/orders/application/orders.usecases.js#L114)). It can therefore create an order at a total the customer did not confirm. The successful response also carries `staleCart: true`; the API wrapper interprets that as a request for confirmation ([`OrdersAPIFunctions.js`](frontend/evo_market/src/API/OrdersAPIFunctions.js#L108)), so the storefront can ask for confirmation after the order already exists.

**Suggested fix:** Require the confirmed total to match the server's newly calculated total on the retry. If it changed again, return a fresh conflict and ask again before writing the order; only successful order responses should be treated as placed.

### P2 — The idempotency fallback generates a new key on every render

If `sessionStorage` access fails, [`getCheckoutIdempotencyKey`](frontend/evo_market/src/General/GeneralFunctions.js#L160) returns a new random key. The checkout component calls it during render ([`CompleteCheckoutModal.jsx`](frontend/evo_market/src/Components/CartPage/CompleteCheckoutModal/CompleteCheckoutModal.jsx#L53)), so a state update changes the key while the modal remains open. A retry after a lost response can then use a different key and create a duplicate order in browsers where storage is unavailable.

**Suggested fix:** Keep the fallback key in stable in-memory state for the active attempt, and preserve it across modal unmounts where possible.

### P2 — Duplicate product lines bypass the checkout quantity limit

Checkout validates each raw line against `MAX_QUANTITY` (999), then adds duplicate product IDs together without validating the combined quantity ([`orders.usecases.js`](backend/src/modules/orders/application/orders.usecases.js#L51)). A request with 100 lines for the same product, each with quantity 999, becomes one persisted order line with quantity 99,900. This bypasses the stated per-product limit and can produce orders far larger than the cart API accepts.

**Suggested fix:** Reject duplicate product IDs or enforce the 999 limit after quantities are aggregated.

## Third re-review — 2026-10-02

The latest edits address the three findings from the follow-up pass: the pricing comparison now runs even on confirmation retries, the storage fallback keeps a stable in-memory key for the page session, and aggregated product quantities are capped. I found three remaining issues.

### P2 — A concurrent request can reuse an idempotency key with a different payload

The initial replay lookup compares `requestFingerprint` and returns 409 when the key already exists ([`orders.usecases.js`](backend/src/modules/orders/application/orders.usecases.js#L81)). But if two requests with the same key arrive together, both can pass that lookup before either inserts. The losing insert then finds the first order and returns it without checking the fingerprint again ([`orders.usecases.js`](backend/src/modules/orders/application/orders.usecases.js#L180)). The losing request receives a successful response for a different cart/address than it submitted. Existing coverage checks parallel requests with the same payload and checks different-payload reuse sequentially, but not this race ([`concurrency.test.js`](backend/test/integration/concurrency.test.js#L583)).

**Suggested fix:** Compare the existing order's fingerprint with the current request in the insert-conflict path too; return 409 on mismatch and add a concurrent different-payload reuse case.

### P2 — The storefront lint command warns on an unused checkout import

[`CompleteCheckoutModal.jsx`](frontend/evo_market/src/Components/CartPage/CompleteCheckoutModal/CompleteCheckoutModal.jsx#L21) still imports `newIdempotencyKey`, but the component now calls `getCheckoutIdempotencyKey` instead. The frontend ESLint config enables `no-unused-vars` warnings ([`.eslintrc.cjs`](frontend/.eslintrc.cjs#L20)), while the lint script treats any warning as a failure ([`package.json`](frontend/evo_market/package.json#L9)). This unused import therefore makes the storefront lint command exit unsuccessfully.

**Suggested fix:** Remove the unused import.

### P2 — The in-memory idempotency fallback does not survive a page reload

When `sessionStorage` is unavailable, the checkout key is kept only in the module-scoped `memoryIdempotencyKeys` map ([`GeneralFunctions.js`](frontend/evo_market/src/General/GeneralFunctions.js#L159)). That preserves retries across renders and modal unmounts, but a full page reload clears the map. If the order committed and the response was lost, reopening checkout in this storage-restricted case generates a new key and can create a duplicate order.

**Suggested fix:** Preserve a durable retry identity when storage is available; when no durable client storage can be used, avoid claiming reload-safe idempotency or use a server-managed checkout attempt that can be recovered after reload.

## Fourth re-review — 2026-10-02

The concurrent idempotency conflict path now checks the request fingerprint, and the unused checkout import is gone. The storage fallback now tries `sessionStorage`, `localStorage`, then memory. I found two remaining checkout risks in that fallback:

### P2 — Accessing a storage property can throw before the fallback handler

`getCheckoutIdempotencyKey` builds `[sessionStorage, localStorage]` before entering either `try` block, and `rotateCheckoutIdempotencyKey` does the same. In browser contexts where reading a storage property itself throws (for example, a restricted or opaque origin), the exception escapes before the code can try the next storage tier. Checkout can then fail during render, and a successful order response can throw while rotating its key.

**Suggested fix:** Resolve each browser storage object inside its own guarded access, then fall through when either property lookup or its storage operation throws.

### P2 — The last-resort key still cannot recover an attempt after reload

If both `sessionStorage` and `localStorage` are unavailable, the helper stores the pending key only in `memoryIdempotencyKeys`. A reload clears that map. If an order committed but its response was lost, the next checkout can generate a new key and create a duplicate. The code documents this limitation, but the duplicate-order risk remains in that environment.

**Suggested fix:** Use a server-managed checkout attempt that can be recovered after reload when no durable browser storage is available, or explicitly accept this residual limitation.

## Fifth re-review — 2026-10-02

Each storage area is now resolved inside its own guarded access, and the last-resort limitation is documented in place. Two defects remain in how the tiers are searched, both of which can end in a duplicate order.

### P2 — A higher-priority tier can replace an existing idempotency key

`getCheckoutIdempotencyKey` walks the available stores in order and returns as soon as it finds one that yields a value ([`GeneralFunctions.js`](frontend/evo_market/src/General/GeneralFunctions.js#L216)). When the first available store is empty it mints a key, writes it there, and returns immediately — it never consults the lower-priority stores. A key is therefore only ever recorded in one tier, and a higher-priority tier that becomes writable later discards whatever copy a lower tier is still holding. Concretely: an attempt that ran while `sessionStorage` was unavailable stored its key in `localStorage`; if `sessionStorage` becomes writable before the retry (a quota error clearing, a private-browsing session ending, or a storage policy changing mid-session), the retry reads an empty `sessionStorage`, mints a fresh key, and submits it. `sessionStorage` is consulted first because it is the more durable and more private of the two, so the more likely store is also the one that silently wins.

Impact: the retry carries a key the first attempt never used, so the server treats it as a new checkout. If the original request committed and its response was lost, a second order is created. This is the same duplicate-order outcome the multi-tier fallback was added to prevent, reached by a different route. Note that rotation is not the mitigation: `rotateCheckoutIdempotencyKey` clears every tier ([`GeneralFunctions.js`](frontend/evo_market/src/General/GeneralFunctions.js#L242)), so this only occurs while an attempt is genuinely pending.

**Suggested fix:** Read across all available tiers before minting a key, and promote an existing lower-tier key into the higher tier rather than replacing it — search first, create only after every tier has come back empty. The same read-then-create ordering must apply to the memory tier so all three are consulted consistently.

### P2 — Concurrent tabs can mint different keys from the same store

The tier loop performs a non-atomic read-modify-write: it reads with `getItem` and, on an empty result, mints a key and writes it with `setItem` ([`GeneralFunctions.js`](frontend/evo_market/src/General/GeneralFunctions.js#L218-L221)). Web Storage offers no atomic compare-and-set, and `localStorage` is shared process-wide across a customer's tabs. Two tabs that reach this code before either writes both read an empty value, both call `newIdempotencyKey()` — a fresh `crypto.randomUUID()` each time ([`GeneralFunctions.js`](frontend/evo_market/src/General/GeneralFunctions.js#L137)) — and both `setItem` calls succeed with the second overwriting the first. Each tab returns the value it generated locally, so the shared store ends up holding one key while the two in-flight checkouts carry two different ones, and the server has no basis to recognise them as one attempt.

This contradicts the documented behaviour directly above it: the doc comment states that two tabs checking out at the same time "contend for one pending key and the server refuses the loser with 409" ([`GeneralFunctions.js`](frontend/evo_market/src/General/GeneralFunctions.js#L207-L210)). That outcome holds only when one tab's write lands before the other's read. The comment describes a guarantee the code does not provide, and it is the reasoning used to accept cross-tab key sharing in place of the reload risk.

Impact: both requests carry distinct keys, so both create orders and the customer is charged twice. The window is narrow — it requires both tabs to reach checkout before either writes — but it is exactly the window a customer duplicating a tab would produce.

**Suggested fix:** Either make the claim true by having the writer re-read after `setItem` and return the stored value when another tab won the race, or correct the comment to state that concurrent tabs may mint independent keys and that the residual exposure is accepted. If the guarantee is to be made real rather than documented, the authoritative pending key has to live on the server, which is the same server-managed checkout attempt raised in the previous review.

No source code was changed, and no tests or builds were run during this review.

## Sixth pass — 2026-10-03 — both Fifth findings fixed

Both defects from the Fifth re-review are resolved in `frontend/evo_market/src/General/GeneralFunctions.js`.

### Higher-priority tier replacing an existing key — fixed

`getCheckoutIdempotencyKey` no longer returns from the first tier that answers. It now walks every available tier first and mints only once all of them have come back empty. A key found in a lower tier is written into each tier above it, so the tiers converge instead of diverging — `sessionStorage` becoming writable after an attempt parked its key in `localStorage` now recovers that key and promotes it, rather than minting a replacement. The memory tier participates on the same footing: it is consulted after both stores and, when it holds the key, promoted into every store that accepts one. So all three tiers are treated uniformly, which is what the suggested fix asked for and what the previous loop failed to do.

The doc comment now explains why search-then-create is the required order, not an optimisation.

### Concurrent tabs minting different keys — narrowed, and documented honestly

The writer now re-reads the store after `setItem` and returns the value actually stored, so a tab that loses the write race adopts the winner's key instead of its own. This resolves the interleaving where the competing write lands between our read and our write.

It does **not** close the window, and the code no longer claims it does. Web Storage provides no atomic compare-and-set, so a competing write that lands after the re-read remains invisible to that tab. The doc comment previously promised that two simultaneous checkouts "contend for one pending key and the server refuses the loser with 409"; that guarantee was false and is replaced with a statement of what the code actually does and where the residual exposure sits. Eliminating it entirely requires the authoritative key to live server-side — the server-managed checkout attempt already discussed under accepted residual risk — which was out of scope here.

### Verification

Both behaviours were tested against the real module, with the two storage tiers backed by genuinely independent maps. An earlier draft of the harness gave both tiers a single shared map, which allowed either tier to answer for the other and silently masked the first defect; the independent backing is what makes the promotion check meaningful.

- Restoring the old first-answering-tier behaviour fails 7 checks.
- Removing only the post-write re-read fails the 3 cross-tab checks, and nothing else.
- The clean implementation passes all 15 checks, plus the earlier tier/accessor suite unchanged: stability across 500 re-renders, survival of a reload via a fresh module instance, rotation clearing every tier, and tolerance of null/`undefined` storage values and throwing property accessors.

Regression: backend unit 84/84; integration 32/32 against PostgreSQL and a clean 32-test skip without it; conformance 106/106 on both `:5002` and `:5003`; both frontend builds succeed.

Still open after this pass: the Node engine and package-manager authority decision, and the storefront ESLint plugin resolution. Neither is a checkout defect.

## Seventh pass — 2026-10-09

Static review of the current working tree. I made no application-code changes and did not run tests or builds.

### P1 — Checkout does not validate or reserve product stock

The product model stores `stock_quantity`, and both the admin dashboard and storefront display it as the number of items in stock ([`1700000000001_initial-commerce-schema.cjs`](backend/db/migrations/1700000000001_initial-commerce-schema.cjs#L45), [`ProductPage.jsx`](frontend/evo_market/src/Components/ProductPage/ProductPage.jsx#L319)). But the checkout query reads only product title, image, price, and deletion state ([`orders.repository.js`](backend/src/modules/orders/infrastructure/orders.repository.js#L71)), and order creation never checks or updates stock ([`orders.usecases.js`](backend/src/modules/orders/application/orders.usecases.js#L92)). The cart page also permits quantities beyond available stock because its product details omit the stock field.

As a result, a customer can place an order for more items than exist, and repeated or concurrent checkouts can all succeed against the same inventory. The displayed stock count never falls after a sale.

**Suggested fix:** In the order transaction, atomically decrement each product only when `stock_quantity >= requested quantity`; reject and roll back the order if any item is unavailable. Add coverage for insufficient stock and concurrent checkouts competing for the final units.

### P3 — Cart-add error handling reads the wrong Axios error fields

On a failed cart-add request, [`CartAPIFunctions.js`](frontend/evo_market/src/API/CartAPIFunctions.js#L56) reads `error.data.response.message`. Axios exposes the response body as `error.response.data`, so this access normally throws a second `TypeError` before the wrapper can return its intended error result. The Redux thunk then takes its generic rejected path, and the backend's actual error message is lost.

**Suggested fix:** Read the message from `error.response?.data?.message` and use a fallback for network errors without a response.

## Eighth pass — 2026-10-09 — both Seventh findings fixed

### P1 — checkout now validates and reserves stock

Order creation reserves inventory inside the same transaction that inserts the order. `decrementStock` ([`orders.repository.js`](backend/src/modules/orders/infrastructure/orders.repository.js#L86)) issues one conditional `UPDATE products SET stock_quantity = stock_quantity - $1 ... WHERE id = $2 AND stock_quantity >= $1 AND is_deleted = false` per line, so the availability test and the write are atomic: PostgreSQL evaluates the guard while the row is locked, and two concurrent checkouts for the last unit serialize instead of both reading one. The lines are locked in ascending product-id order so two multi-line checkouts holding the same products in a different order cannot deadlock. When any line matches no row, the product ids are returned and [`createOrder`](backend/src/modules/orders/application/orders.usecases.js#L202) throws a `400` carrying `details.outOfStock`; throwing aborts the transaction, so the already-inserted order and any lines that *did* reserve are rolled back together. `ApiError.badRequest` gained the `options` argument it needed to carry those details ([`api-error.js`](backend/src/shared/http/api-error.js#L10)).

The reservation runs after the idempotency insert and only on the `created` path, so a retried request that replays the original order does not decrement a second time.

The storefront can now bound the quantity it offers: `getProductDetails` exposes `stock_quantity` as `amount` ([`carts.repository.js`](backend/src/modules/carts/infrastructure/carts.repository.js#L157)), `PRODUCT_DETAIL_KEYS` passes it through ([`carts.usecases.js`](backend/src/modules/carts/application/carts.usecases.js#L6)), and both cart quantity controls pass `maxRange` ([`ItemComponent.jsx`](frontend/evo_market/src/Components/CartDrawer/ItemComponent/ItemComponent.jsx#L175)). The UI bound is advisory; the transaction is what enforces it.

### P3 — cart-add error text now reads the Axios fields

[`CartAPIFunctions.js`](frontend/evo_market/src/API/CartAPIFunctions.js#L57) reads `error.response?.data?.message` with a fallback, instead of the previous `error.data.response.message`, which threw a second `TypeError` before the wrapper could return its intended result.

### The database backstop, and why the guard still matters

The schema already carries a `stock_quantity >= 0` CHECK constraint (migration `1700000000001`), exercised by [`schema.test.js`](backend/test/integration/schema.test.js). That constraint alone would stop the oversell even without the guard, but it does so by rejecting the row PostgreSQL was writing as a *negative* value (`23514`, surfaced as the generic "Value does not satisfy the required format"). The explicit guard is the intended business path — it never attempts the negative write and returns a structured `outOfStock` the client can act on. The tests assert the structured refusal specifically, which is what makes them sensitive to the guard rather than to the constraint: with the guard removed, the losing concurrent request is still refused, but by the constraint and with no `details.outOfStock`, and the test fails.

### Coverage

- [`repositories.test.js`](backend/test/unit/repositories.test.js): two `decrementStock` tests through the query double — availability guard and `is_deleted` in the predicate, one bound value per placeholder, parameterized `[quantity, productId]`, ascending lock order for out-of-order input, and an empty result when every line succeeds.
- [`concurrency.test.js`](backend/test/integration/concurrency.test.js): a successful checkout decrements stock; a checkout larger than stock is refused with `400`/`details.outOfStock`, leaves no order, and touches neither stock nor cart; two concurrent checkouts for the last unit yield exactly `[201, 400]`, one order, one structured refusal and stock `0`. The existing duplicate-lines test now seeds stock above the `999` quantity cap, because that case governs the per-product quantity limit and stock has its own tests.

### Verification

- Backend unit: 86/86 (was 84; +2).
- Backend integration against the rebuilt scratch cluster: 35/35 (was 32; +3), and a clean 35-test skip without `INTEGRATION_DATABASE_URL`.
- Conformance: 107/107 on both `:5002` and `:5003` (was 106; +1 assertion that a cart item's `productDetails.amount` is a number).
- Both frontend builds succeed; `GeneralFunctions.js` remains CRLF.
- Mutation: removing `AND stock_quantity >= $1` from the decrement fails both new stock tests; each was verified to fail for the right reason (the insufficient case against `/stock/i`, the race case against the missing `details.outOfStock`).

### Deferred

Restock on order cancel or delete is **not** implemented. `decrementStock` is a one-way reservation, and `setStatus` has no idempotency guard, so adding restock now would risk double-crediting a cancellation. It is recorded as a follow-up rather than approximated.

## Ninth pass — 2026-10-09

Static re-review of the latest working tree. The Seventh-pass stock reservation and cart-add error handling findings are addressed in the current source. I found one remaining inventory issue; no application code was changed and no tests or builds were run.

### P2 — Canceling or deleting an order does not restore its reserved stock

Checkout now decrements inventory when it creates an order ([`orders.usecases.js`](backend/src/modules/orders/application/orders.usecases.js#L202)). But the admin status path only updates the order status ([`orders.usecases.js`](backend/src/modules/orders/application/orders.usecases.js#L252), [`orders.repository.js`](backend/src/modules/orders/infrastructure/orders.repository.js#L234)), and the customer-facing “Cancel order” action calls the delete path ([`OrderCard.jsx`](frontend/evo_market/src/Components/UserInfoPage/OrdersComponent/OrderCard.jsx#L33), [`orders.usecases.js`](backend/src/modules/orders/application/orders.usecases.js#L261)). Neither path restores the quantities. Cancelled or deleted orders therefore leave stock permanently reduced, and products can appear out of stock after their orders are canceled.

**Suggested fix:** Restore quantities transactionally when an eligible order transitions to canceled, and make that transition idempotent so repeated requests cannot add stock twice. Apply the same rule to deletion or prevent deleting orders until their inventory has been reconciled. Cover cancellation, deletion, and repeated cancellation in integration coverage.

## Tenth pass — 2026-10-09 — reserved stock is returned on cancel and delete

The reservation added in the Eighth pass was one-way: canceling or deleting an order left its units permanently deducted. Both paths now reconcile inventory.

### What changed

`restoreStock` is the inverse of `decrementStock` ([`orders.repository.js`](backend/src/modules/orders/infrastructure/orders.repository.js#L115)). It credits each line with an unconditional `stock_quantity = stock_quantity + $1`, applies lines in ascending product-id order so a restore cannot deadlock a concurrent checkout on the same products, and skips a line whose product was hard-deleted after the order (its row is gone, so there is nothing to restock). It is exported alongside two locking reads, `findByIdForUpdate` and `findScopedForUpdate`, which select the order `FOR UPDATE`.

[`setOrderStatus`](backend/src/modules/orders/application/orders.usecases.js#L266) now runs in a transaction. It takes the locked read first, then decides from the transition using `RESTOCKABLE_STATUSES = ["pending", "processing"]`:

- a stock-holding state (`pending`/`processing`) → `canceled` restores the reservation;
- `canceled` → a stock-holding state re-reserves it, so reopening an order cannot leak inventory, and refuses with a `400`/`details.outOfStock` if the units are no longer available;
- every other transition leaves stock alone. In particular `delivered` is not restocked, because a fulfilled order has consumed its units, and `canceled` is not restocked again.

[`deleteOrder`](backend/src/modules/orders/application/orders.usecases.js#L293) also runs in a transaction and takes the same locked read (scoped to the owner for a customer, unscoped for an admin). Deleting an order whose status is still `pending`/`processing` is a cancellation by another name, so it restores first; a `canceled` order has already been returned and a `delivered` one was fulfilled, so neither is touched. This covers the storefront “Cancel order” action, which deletes the order.

### Idempotency

No new column was needed. The order row lock taken by the locked read serializes two concurrent cancels, a repeated cancel, and a cancel racing a delete; each reads the status the previous writer committed and does not return the same units twice. The status is the single source of truth for whether stock is currently held.

### Coverage and verification

- [`concurrency.test.js`](backend/test/integration/concurrency.test.js): canceling returns the units and a repeated cancel does not return them again; two concurrent cancels return them once; the customer delete path returns them; deleting an already-canceled order does not credit twice; a delivered order keeps its stock when canceled; and reopening a canceled order re-reserves, refuses when the units are gone, then succeeds after they are replenished. A `seedAdmin` fixture was added for the status route.
- [`repositories.test.js`](backend/test/unit/repositories.test.js): `restoreStock` credits in ascending id order and skips a null product id, with one bound value per placeholder; `findByIdForUpdate` and `findScopedForUpdate` assert the `FOR UPDATE` clause and their bindings.
- Backend unit 89/89 (was 86; +3); integration 41/41 (was 35; +6); conformance 107/107 on both `:5002` and `:5003`; no frontend change this pass.
- Mutation: dropping the cancel restock fails four tests, restocking on *every* cancel (no status check) fails three, dropping the delete restock fails one, and removing the `FOR UPDATE` lock fails the concurrent-cancel test — the lock is what makes the restore idempotent.

### Deferred

`PUT /api/orders/:id` can still rewrite an order's items or status without reconciling stock. No client calls it — the admin dashboard changes status with `PATCH /api/orders/:orderId/:status` and deletes with `DELETE /api/orders/:orderId` — so it is left as-is rather than given a third stock code path. A deliberate return/restock of a delivered order is likewise not modelled; `delivered` is treated as terminal for inventory.

## Eleventh pass — 2026-10-09

The Tenth-pass cancellation/deletion restock is present in the current source. This pass found three remaining issues; no application code was changed and no tests or builds were run.

### P2 — An order can move from canceled directly to delivered without reserving stock

`setOrderStatus` accepts every status in `VALID_STATUSES`, including `delivered`, from any current status. The stock re-reservation branch only runs when a canceled order moves to `pending` or `processing` ([`orders.usecases.js`](backend/src/modules/orders/application/orders.usecases.js#L256)). A direct admin request to mark a canceled order `delivered` therefore skips `decrementStock`, even though cancellation already returned those units. The order can be marked fulfilled after its stock has been sold or allocated elsewhere.

**Suggested fix:** Reject a direct `canceled` → `delivered` transition, or reacquire the order's inventory before allowing it. Add a status-transition case that proves unavailable stock prevents delivery.

### P2 — The admin order update endpoint bypasses stock reconciliation

The admin-only `PUT /api/orders/:id` route calls `updateOrder` ([`orders.router.js`](backend/src/modules/orders/http/orders.router.js#L14)). That use case accepts replacement items and status fields and sends them to the repository without locking the order or adjusting stock ([`orders.usecases.js`](backend/src/modules/orders/application/orders.usecases.js#L231), [`orders.repository.js`](backend/src/modules/orders/infrastructure/orders.repository.js#L218)). Replacing a pending order's items leaves the original quantities deducted and never reserves the new items; changing its status to canceled also skips the stock return. The dashboard currently uses the separate `PATCH` status route, but this `PUT` endpoint remains reachable to any authenticated admin.

**Suggested fix:** Remove or restrict the unused mutation route, or make it reconcile inventory under the same order lock and transaction as cancellation/status changes. Validate replacement items before writing them.

### P2 — Persistent profile data makes an expired session appear logged in

Both storefront and admin `IsUserLoggedIn` helpers test `localStorage` profile data without requiring the token cookie because `||` binds outside the `&&` check ([storefront `GeneralFunctions.js`](frontend/evo_market/src/General/GeneralFunctions.js#L351), [admin `GeneralFunctions.js`](frontend/admin_dashboard/src/General/GeneralFunctions.js#L132)). “Remember me” keeps the profile in `localStorage`, while the token cookie expires after seven days. After that expiry, these helpers still report the user as logged in. API calls then fail because `GetTokenAndUserId` requires the token cookie, leaving the UI in a stale authenticated state until its delayed cleanup runs.

**Suggested fix:** Require both saved profile data and the corresponding token cookie in each login check. Cover the local-storage-without-token and session-storage-without-token cases.

## Twelfth pass — 2026-10-09 — all three Eleventh findings fixed

All three were reproduced before being fixed: a canceled order was marked `delivered` with its stock already sold elsewhere ([`orders.usecases.js`](backend/src/modules/orders/application/orders.usecases.js#L256)), `PUT /api/orders/:id` returned `200` and rewrote an order without touching stock, and `IsUserLoggedIn()` returned `true` with a `localStorage` profile and no token cookie in both apps.

### P2 — stock is reacquired when a canceled order leaves canceled

The status change now keys off two named sets instead of one. `STOCK_HOLDING_STATUSES` is `pending`/`processing` — the states whose stock is currently deducted — and drives the restock on the way *into* `canceled`. `STOCK_CONSUMING_STATUSES` is `pending`/`processing`/`delivered` and drives re-reservation on the way *out* of `canceled`, so a direct canceled → delivered jump reserves the units exactly like a reopen to `processing`. Both run inside the locked transaction, so an unavailable line refuses with `400`/`details.outOfStock`, changes no status, and reserves nothing. `deleteOrder` keeps using `STOCK_HOLDING_STATUSES`, since a delivered order has consumed its units and must not be credited on deletion.

### P2 — the unused admin order update route is gone

`PUT /api/orders/:id` and its `updateOrder` use case were removed, together with the repository `update`, `getProductSnapshots` and `mapField` helpers they were the only callers of, and the three `orders update` unit tests that pinned the allowlisted-column write. No client called the route; the admin dashboard uses `PATCH /api/orders/:orderId/:status` and `DELETE /api/orders/:orderId`. A regression test asserts `PUT /api/orders/:id` now resolves to no handler (`404`).

### P2 — the login check requires the token and the profile

The predicate now lives once in [`frontend/shared_files/General/session.mjs`](frontend/shared_files/General/session.mjs) as `isLoggedIn({ localInfo, sessionInfo, token })` returning `Boolean((localInfo || sessionInfo) && token)`. Both `IsUserLoggedIn` helpers delegate to it — the storefront reading `Cookies.get('token')` and `customerInfo`, the admin reading `Cookies.get('admin-token')` and `adminInfo` — so an expired token cookie can no longer be masked by a remembered profile in either app.

### Coverage and verification

- [`orders.usecases` tests](backend/test/unit/repositories.test.js): the three `orders update` tests were removed with the dead code; unit 86/86 (was 89).
- [`concurrency.test.js`](backend/test/integration/concurrency.test.js): a canceled order cannot jump to `delivered` without reacquiring its units (refused with `details.outOfStock` and unchanged status when they are gone, then delivered and consumed once they are replenished), and `PUT /api/orders/:id` answers `404`. Integration 43/43 (was 41; +2).
- [`session.test.mjs`](frontend/shared_files/General/session.test.mjs): five cases pin the predicate (local profile without token, session profile without token, token without profile, profile plus token, missing arguments).
- Both real functions were also bundled with stubbed browser dependencies and exercised against the built module: a remembered profile with no cookie is `false` in both apps, and profile plus token is `true`.
- Conformance 107/107 on both `:5002` and `:5003`; both frontend builds green. Mutation: dropping `delivered` from `STOCK_CONSUMING_STATUSES` fails the canceled → delivered test, and restoring the `||`/`&&` precedence fails the no-token predicate case.

### Still open

`PUT` removal means an admin who genuinely needs to edit an order's items has no route; that was already true in practice because no client used it, and a correct editor would need the same lock-and-reconcile treatment as the status route rather than the old blind write.

## Thirteenth pass — 2026-10-09

`PATCH /api/orders/:orderId/:status` ([`orders.router.js`](backend/src/modules/orders/http/orders.router.js#L14)) lets an admin move an order from any valid status to any other. This pass found one remaining inventory issue in those transitions. The review was read-only: no application code was changed and no tests or builds were run.

### P2 — status reversals reconcile stock inconsistently and can double-decrement

The use case validates only that the requested status is one of `VALID_STATUSES` ([`orders.usecases.js`](backend/src/modules/orders/application/orders.usecases.js#L10)), then reconciles stock for exactly two cases ([`setOrderStatus`](backend/src/modules/orders/application/orders.usecases.js#L234)): a `pending`/`processing` order becoming `canceled` restores its units, and a `canceled` order moving to a stock-consuming status re-reserves them. Every other transition just calls `setStatus`, so leaving `delivered` — whose units were permanently consumed at checkout — is never modelled even though the target status may be read as holding or not holding stock.

- **delivered → pending → canceled inflates inventory.** Delivery consumes the units and nothing returns them, but the order is now `pending`, which `STOCK_HOLDING_STATUSES` ([line 13](backend/src/modules/orders/application/orders.usecases.js#L13)) treats as holding stock. A following cancel matches the restock branch and credits those already-sold units back to the catalog, making fulfilled inventory available to buy again.
- **delivered → canceled → processing double-decrements.** `delivered → canceled` is a stock no-op under the current branches, so the order sits `canceled` while its units stay consumed. Moving it on to `processing` matches the reconnect branch and calls `decrementStock` a second time for the same order, removing units that its original checkout already took.

Both paths expose the same gap: `delivered` is terminal for the holding set but not for the transition graph, so it can be left and re-entered while inventory only tracks `pending`/`processing` versus `canceled`.

**Suggested fix:** Define the allowed transition graph and reject anything outside it with a `400` instead of performing an implicit reversal, then derive the stock delta from the `(from, to)` pair rather than from two independent membership tests, so a reversal reserves exactly once or restores exactly once. At minimum, treat `delivered` as terminal, or make leaving it re-reserve its units the way leaving `canceled` does, and make entering `canceled` restore only when the order currently holds stock. Add integration scenarios for `delivered → pending → canceled` (the catalog must not regain already-sold units) and `delivered → canceled → processing` (the units must not be removed twice), plus one for a transition the graph forbids.
