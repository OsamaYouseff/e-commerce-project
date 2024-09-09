import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { coupons } from "./GeneralVariables.jsx"
import { GoHome } from "../../../shared_files/General/GeneralFunctions.js";


export function GetUserInfo() {
    if (localStorage.getItem("customerInfo"))
        return JSON.parse(localStorage.getItem("customerInfo"));
    else if (sessionStorage.getItem("customerInfo"))
        return JSON.parse(sessionStorage.getItem("customerInfo"));

    return {
        _id: null,
        firstname: "",
        lastname: "",
        username: "",
        email: "",
        address: "",
        gender: "",
        phone: "",
        createdAt: "",
        updatedAt: "",
    };
}

export function ResetLocalStorage() {
    sessionStorage.removeItem("customerInfo");
    localStorage.removeItem("customerInfo");
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    Cookies.remove("token");
}

export function StoreDataAtLocalStorage(Type = "localStorage", data) {

    if (!data) {
        toast.error("there are some data missing please logout and login again");
        GoHome();
        return
    }

    if (Type === "localStorage") {
        localStorage.setItem('customerInfo', JSON.stringify(data.userInfo));

    } else if (Type === "sessionStorage") {
        sessionStorage.setItem('customerInfo', JSON.stringify(data.userInfo));
    }

    Cookies.set('token', data.accessToken, { expires: 7 });


}

export function GetAddressInfo() {
    if (sessionStorage.getItem("edited-address"))
        return JSON.parse(sessionStorage.getItem("edited-address"));

    return {
        userId: null,
        firstName: null,
        lastName: null,
        fullAddress: null,
        label: null,
        phoneNumber: null,
        isDefault: null,
    };
}

export function GetTokenAndUserId() {
    const customerData = localStorage.getItem('customerInfo') || sessionStorage.getItem('customerInfo');
    const accessToken = Cookies.get('token');


    if (!customerData) {
        toast("there are some data missing please login again");
        setTimeout(() => {
            ResetLocalStorage()
            GoHome();
        }, 1500)
        return;
    }

    if (!customerData || !accessToken) {
        toast.error("Your session has expired please login again");
        setTimeout(() => {
            ResetLocalStorage()
            GoHome();
        }, 1500)
        return;
    }
    const customerId = JSON.parse(customerData)["_id"];


    return { customerId, accessToken };
}

export function CalcTotalCartPrice(subtotalPrice, couponCode = "") {
    const discount = couponCode ? Number((GetCouponDiscount(couponCode) * subtotalPrice).toFixed(2)) : 0;
    const shippingCalc = subtotalPrice !== 0 ? (subtotalPrice >= 50 ? 0 : 20) : 0;
    const shippingCost = shippingCalc === 0 ? "Free" : "$20";
    const finalPrice = subtotalPrice !== 0 ? (subtotalPrice - discount + shippingCalc).toFixed(2) : 0;


    return { finalPrice, shippingCost, discount, shippingCalc };
}

export function IsDiscountValid(couponCode) {
    return coupons.includes(couponCode)
}

function GetCouponDiscount(couponCode) {
    if (coupons.includes(couponCode)) {
        return Number(couponCode.slice(0, -3) / 100);
    } else {
        return 0;
    }

}

export function GetEstimatedDeliveryDate() {
    return new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
}

export function ValidateSignUpForm(formData, confirmPassword) {
    const errors = {};

    // Username validation
    if (!formData.username || formData.username.trim().length === 0) {
        errors.username = "Username is required";
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
        errors.username = "Username must be 3-20 characters long and can only contain letters, numbers, and underscores";
    }

    // Email validation
    if (!formData.email || formData.email.trim().length === 0) {
        errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Invalid email format";
    }

    if (!(formData.password.trim() === confirmPassword.trim())) {
        errors.password = "Passwords do not match";
    } else {
        // Password validation
        if (!formData.password || formData.password.length === 0) {
            errors.password = "Password is required";
        } else if (!/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/.test(formData.password)) {
            errors.password = "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character";
        }
    }

    // Phone validation
    if (!formData.phone || formData.phone.trim().length === 0) {
        errors.phone = "Phone number is required";
    } else if (!/^\+\d{1,3}\d{10,14}$/.test(formData.phone)) {
        errors.phone = "Invalid phone number format. Use international format (e.g., +1234567890)";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
}

export function IsUserLoggedIn() {
    if ((localStorage.getItem("customerInfo") || (sessionStorage.getItem("customerInfo")) && Cookies.get('token')))
        return true;
    else
        return false;
}





