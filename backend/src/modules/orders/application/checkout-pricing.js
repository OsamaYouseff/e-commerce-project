const crypto = require("crypto");
const { ApiError } = require("../../../shared/http/api-error");

/**
 * Checkout pricing policy. The storefront used to compute discounts and shipping
 * in the browser and submit the result as the source of truth, which meant the
 * browser decided what a customer pays. Totals are now always derived here from
 * authoritative catalog prices; the client copy is only compared, never trusted.
 *
 * The storefront mirrors these constants in `GeneralVariables.jsx` for its
 * preview, so a change here must be made there too.
 */
const COUPONS = {
  "10OFF": 0.1,
  "15OFF": 0.15,
  "20OFF": 0.2,
  "25OFF": 0.25,
  "50OFF": 0.5,
};

const FREE_SHIPPING_THRESHOLD_IN_CENTS = 5000;
const FLAT_SHIPPING_IN_CENTS = 2000;

const normalizeCoupon = (code) => (typeof code === "string" ? code.trim().toUpperCase() : "");

/** Returns the discount rate, 0 when no coupon was given, null when unknown. */
const couponRate = (code) => {
  const key = normalizeCoupon(code);
  return key ? COUPONS[key] ?? null : 0;
};

/**
 * @throws {ApiError} 400 when a coupon was supplied but is not recognized, so an
 * invalid code can never be silently treated as "no discount".
 */
const computeTotals = ({ subtotalInCents, couponCode }) => {
  const subtotal = Math.round(Number(subtotalInCents) || 0);
  const rate = couponRate(couponCode);
  if (rate === null) throw ApiError.badRequest("Invalid coupon code");

  const discount = Math.round(subtotal * rate);
  const shippingCostInCents =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD_IN_CENTS ? 0 : FLAT_SHIPPING_IN_CENTS;

  return {
    subtotalInCents: subtotal,
    discount,
    shippingCostInCents,
    totalAmountInCents: subtotal - discount + shippingCostInCents,
    currency: "USD",
    couponCode: normalizeCoupon(couponCode) || null,
  };
};

/**
 * Digest of the order-defining part of a checkout request, stored alongside an
 * idempotency key so a retry that carries a different cart, address, coupon or
 * payment method is rejected with 409 instead of returning the first order.
 *
 * Monetary totals are deliberately excluded: they are computed server-side and
 * are compared separately (a mismatch is reported as `staleCart`), so including
 * them would turn a harmless stale preview into a conflict.
 */
const requestFingerprint = ({ userId, body, quantities }) => {
  const items = [...quantities.entries()]
    .map(([productId, quantity]) => [productId, quantity])
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));

  const payload = JSON.stringify({
    userId,
    items,
    address: body.addressId || null,
    shipping: body.shippingAddress
      ? {
          fullAddress: body.shippingAddress.fullAddress || null,
          phoneNumber: body.shippingAddress.phoneNumber || null,
          firstName: body.shippingAddress.firstName || null,
          lastName: body.shippingAddress.lastName || null,
          label: body.shippingAddress.label ?? null,
        }
      : null,
    couponCode: normalizeCoupon(body.couponCode),
    paymentMethod: body.paymentMethod || null,
  });

  return crypto.createHash("sha256").update(payload).digest("hex").slice(0, 32);
};

module.exports = {
  COUPONS,
  FREE_SHIPPING_THRESHOLD_IN_CENTS,
  FLAT_SHIPPING_IN_CENTS,
  normalizeCoupon,
  couponRate,
  computeTotals,
  requestFingerprint,
};