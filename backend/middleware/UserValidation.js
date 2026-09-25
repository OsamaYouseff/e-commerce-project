const bcrypt = require('bcrypt');

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
    const phoneRegex = /^(01)[0-2,5]{1}[0-9]{8}$/;
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


module.exports = { isUsernameValid, isEmailValid, isPasswordValid, isPhoneValid, isPasswordStrong, isPasswordReused };
