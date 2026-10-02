/**
 * Binds an idempotency key to the request that created an order, and records the
 * coupon that produced the stored discount so the order explains its own totals.
 *
 * Checkout already derives a deterministic order id from
 * sha256(userId|clientKey), which makes a retry return the stored order. Without
 * a recorded request fingerprint, reusing a key with a *different* cart or
 * address silently returned the first order. `request_fingerprint` stores a
 * digest of the order-defining fields so the use case can reject a mismatched
 * payload with 409.
 */
exports.up = async (pgm) => {
  pgm.addColumn("orders", {
    request_fingerprint: {
      type: "text",
      notNull: false,
    },
  });
  pgm.addColumn("orders", {
    coupon_code: {
      type: "text",
      notNull: false,
    },
  });
};

exports.down = async (pgm) => {
  pgm.dropColumn("orders", "coupon_code");
  pgm.dropColumn("orders", "request_fingerprint");
};