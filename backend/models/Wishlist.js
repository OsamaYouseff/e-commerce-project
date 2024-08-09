const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, unique: true },
        products: [
            {
                productId: {
                    type: String,
                },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Wishlist", WishlistSchema);
