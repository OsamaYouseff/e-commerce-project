const User = require("../models/User");
const { checkUserFields } = require("../middleware/UserValidation.js");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const router = require("express").Router();

//// CREATE A NEW USER
router.post('/register', checkUserFields, async (req, res) => {
    try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create new user with hashed password
        const newUser = new User({
            ...req.body,
            password: hashedPassword,
            passwordHistory: [hashedPassword] // Add the initial password to history
        });

        // Save user to database
        const savedUser = await newUser.save();

        // Remove password from response
        const { password, ...userInfo } = savedUser._doc;

        // Create access token
        const accessToken = jwt.sign(
            { id: savedUser._id, isAdmin: savedUser.isAdmin },
            process.env.JWT_SEC,
            { expiresIn: "7d" }
        );

        res.status(201).json({ accessToken, userInfo });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occurred during registration" });
    }
});

//// LOGIN A USER

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }


        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const { password, passwordHistory, updatedAt, createdAt, __v, ...userInfo } = user._doc;

        // Create access token
        const accessToken = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SEC,
            { expiresIn: "7d" }
        );

        res.status(200).json({ accessToken, userInfo });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "An error occurred" });
    }
});


//// LOGIN AN ADMIN
router.post('/admin-login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }


        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid username or password" });
        }


        if (!user.isAdmin) {
            return res.status(401).json({ message: "Only admins can login" });
        }


        const { password, passwordHistory, updatedAt, createdAt, __v, ...userInfo } = user._doc;

        // Create access token
        const accessToken = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SEC,
            { expiresIn: "3d" }
        );

        res.status(200).json({ accessToken, userInfo });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "An error occurred" });
    }
});



module.exports = router