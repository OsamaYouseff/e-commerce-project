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
