const User = require("../models/User");
const bcrypt = require('bcrypt');

const checkUserFields = async (req, res, next) => {
    const { username, email, password, phone } = req.body;
    const errors = {};

    // Check for empty fields
    if (!username || !email || !password || !phone) {
        errors.message = "Please fill all fields";
    }

    // Validate each field
    if (!isUsernameValid(username)) errors.username = "Invalid username";
    if (!isEmailValid(email)) errors.email = "Invalid email";
    if (!isPasswordValid(password)) errors.password = "Invalid password";
    if (!isPhoneValid(phone)) errors.phone = "Invalid phone number";

    // Check for existing username, email, and phone
    try {
        const [usernameExists, emailExists, phoneExists] = await Promise.all([
            User.exists({ username }),
            User.exists({ email }),
            User.exists({ phone })
        ]);

        if (usernameExists) errors.username = "Username already in use";
        if (emailExists) errors.email = "Email already in use";
        if (phoneExists) errors.phone = "Phone number already in use";
    } catch (err) {
        console.error('Error checking user data:', err);
        return res.status(500).json({ message: "Server error occurred" });
    }

    // If there are any errors, send them back
    if (Object.keys(errors).length > 0) {
        return res.status(400).json(errors);
    }

    next();
};

const isUsernameValid = (username) => {
    return username && username.trim().length >= 3;
};

const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email && emailRegex.test(email);
};

const isPasswordValid = (password) => {
    return password && password.trim().length >= 8;
};

const isPhoneValid = (phone) => {
    const phoneRegex = /^\+?(?:[0-9]●?){6,14}[0-9]$/;
    return phone && phoneRegex.test(phone);
};

const isPasswordStrong = (password) => {
    const minLength = 8;
    const maxLength = 30;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);
    return password.length >= minLength &&
        password.length <= maxLength &&
        hasUpperCase && hasLowerCase &&
        hasNumbers && hasNonalphas;
};

async function isPasswordReused(user, newPassword) {
    for (let oldPassword of user.passwordHistory) {
        if (await bcrypt.compare(newPassword, oldPassword)) {
            return true;
        }
    }
    return false;
}


module.exports = { checkUserFields, isPasswordStrong, isPasswordReused };
