const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        firstname: {
            type: String,
            default: null,
        },
        lastname: {
            type: String,
            default: null,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        passwordHistory: {
            type: [String],
            default: [],
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
        gender: { type: String, default: null },
        phone: { type: String, required: true, unique: true },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", UserSchema);
