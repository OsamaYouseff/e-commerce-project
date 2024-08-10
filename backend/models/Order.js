const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, min: 1 },
      priceAtOrderInCents: { type: Number, required: true },
    }],
    financials: {
      subtotalInCents: { type: Number, required: true },
      discount: { type: Number, required: true },
      shippingCostInCents: { type: Number, required: true },
      totalAmountInCents: { type: Number, required: true },
      currency: { type: String, required: true, default: 'USD' },
    },
    shippingAddressId: {
      type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'delivered', 'cancelled'],
      default: 'pending'
    },
    paymentMethod: {
      type: String, required: true
    },
    shippingInfo: {
      trackingNumber: { type: String },
      estimatedDeliveryDate: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
