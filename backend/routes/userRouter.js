const User = require("../models/User");
const { isPasswordStrong, isPasswordReused } = require("../middleware/UserValidation.js");
const jwt = require("jsonwebtoken");
const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");

const Cart = require("../models/Cart");
const Address = require("../models/Address");
const Order = require("../models/Order");
const Wishlist = require("../models/Wishlist");

const router = require("express").Router();
const bcrypt = require('bcrypt');
const mongoose = require("mongoose");


//UPDATE USER
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        // Try to find user first
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // If password is being updated, hash it
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        // Remove password from response
        const { password, ...otherFields } = updatedUser._doc;
        res.status(200).json(otherFields);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occurred while updating the user" });
    }
});

// //DELETE USER
// router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {

//     ////// try to find user first
//     const user = await User.findById(req.params.id);
//     if (!user) {
//         return res.status(404).json({ error: "User not found" });
//     }

//     try {
//         await User.findByIdAndDelete(req.params.id);
//         res.status(200).json("User has been deleted successfully.");
//     } catch (err) {
//         res.status(500).json(err);
//     }
// });

//DELETE USER

router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const user = await User.findById(req.params.id).session(session);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ error: "User not found" });
        }

        await Cart.deleteMany({ userId: req.params.id }).session(session);
        await Order.deleteMany({ userId: req.params.id }).session(session);
        await Wishlist.deleteMany({ userId: req.params.id }).session(session);
        await Address.deleteMany({ userId: req.params.id }).session(session);

        await User.findByIdAndDelete(req.params.id).session(session);

        await session.commitTransaction();
        session.endSession();
        res.status(200).json("User has been deleted successfully.");
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json(err);
    }
});

//// GET ALL USERS
router.get("/", verifyTokenAndAdmin, async (req, res) => {
    try {
        const users = await User.find();

        // //// remove password from response
        const clearedPasswordData = users.map((user) => {
            const { password, ...otherFields } = user._doc
            return otherFields;
        })

        res.status(200).json(clearedPasswordData);
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET A USER
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { password, ...otherFields } = user._doc;
        res.status(200).json(otherFields);
    } catch (err) {
        res.status(500).json(err);
    }
});

/// CHANGE PASSWORD
router.post("/change-password/:id", verifyTokenAndAuthorization, async (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.user.id;

    if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    if (!isPasswordStrong(newPassword)) {
        return res.status(400).json({ message: "Password does not meet strength requirements" });
    }



    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Invalid request" });
        }

        if (newPassword === currentPassword) {
            return res.status(400).json({ message: "New password cannot be the same as the current password" });
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({ message: "Wrong password" });
        }

        if (await isPasswordReused(user, newPassword)) {
            return res.status(400).json({ message: "Password has been used recently" });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        user.passwordHistory.unshift(user.password);
        user.password = hashedNewPassword;
        user.passwordHistory = user.passwordHistory.slice(0, 5); // Keep only the last 5 passwords
        await user.save();

        // Log password change event (securely)
        // logger.info(`Password changed for user ${userId}`);

        res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occurred" });
    }
});


router.get("/check-username/:username", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (user) {
            return res.status(200).json({ message: "Username already exists", result: true });
        } else {
            return res.status(200).json({ message: "Username is available", result: false });
        }
    } catch (err) {
        res.status(500).json({ message: "An error occurred while checking the username", result: true });
    }
})



module.exports = router;
