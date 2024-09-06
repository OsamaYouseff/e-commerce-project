import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import axios from "axios";
const baseURL = import.meta.env.VITE_BASE_URL;
import { coupons } from "./GeneralVariables.jsx"

export function GoHome() {
    window.location.href = "/";
}

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

export function IsUserLoggedIn() {

    if ((localStorage.getItem("customerInfo") || (sessionStorage.getItem("customerInfo")) && Cookies.get('token')))
        return true;
    else
        return false;
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

export function FormatDate(dateString) {
    const date = new Date(dateString);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayOfWeek = days[date.getDay()];
    const dayOfMonth = date.getDate();
    const month = months[date.getMonth()];
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Determine AM/PM
    const ampm = hours >= 12 ? 'PM' : 'AM';
    // Convert 24-hour time to 12-hour time
    const formattedHours = hours % 12 || 12;
    // Add leading zero to minutes if needed
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    // Suffix for the day of the month (1st, 2nd, 3rd, etc.)
    const daySuffix = dayOfMonth % 10 === 1 && dayOfMonth !== 11 ? 'st' :
        dayOfMonth % 10 === 2 && dayOfMonth !== 12 ? 'nd' :
            dayOfMonth % 10 === 3 && dayOfMonth !== 13 ? 'rd' : 'th';

    return `${dayOfWeek}, ${dayOfMonth}${daySuffix} ${month}, ${formattedHours}:${formattedMinutes} ${ampm}`;
}

export const GetStatusColor = (state) => {
    const stateColorDict = {
        delivered: "#38ae04",
        canceled: "#f44336",
        pending: "#ff9100",
        processing: "#9c27b0",
    };
    if (state in stateColorDict) {
        return stateColorDict[state];
    }
    return "#9C27B0";
};

export function GetOrderMessage(status = "", estimatedDeliveryDate = "") {
    let orderStatus = "";
    let message = "";

    switch (status.toLowerCase()) {
        case "delivered":
            orderStatus = "Delivered";
            message = `successfully on ${estimatedDeliveryDate}`;
            break;
        case "canceled":
            orderStatus = "Canceled";
            message = "If you have any questions, please contact support.";
            break;
        case "pending":
            orderStatus = "Pending";
            message = `We estimate it will be delivered on ${estimatedDeliveryDate}`;
            break;
        case "processing":
            orderStatus = "Processing";
            message = `Estimated delivery is on  ${estimatedDeliveryDate}`;
            break;
        default:
            orderStatus = "Unknown";
            message = `Please check your order details.`;
            break;
    }

    return { orderStatus, message }

}

export function convertCentsToDollars(cents) {
    return (cents / 100).toFixed(2);
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

export function GetMessagesFromObject(errors) {
    let message = '';

    Object.keys(errors).forEach((key) => {
        message += `\n${key}: ${errors[key]}`;
    });
    return message;
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

export function ValidateLoginForm(formData) {
    const errors = {};

    // Username validation
    if (!formData.username || formData.username.trim().length === 0) {
        errors.username = "Username is required";
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
        errors.username = "Username must be 3-20 characters long and can only contain letters, numbers, and underscores";
    }
    // Password validation
    if (!formData.password || formData.password.length === 0) {
        errors.password = "Password is required";
    } else if (!/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/.test(formData.password)) {
        errors.password = "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
}

export function PrintErrors(errors) {
    let errorMessage = "";

    for (const key in errors) {
        errorMessage += `${key} : ` + errors[key] + "\n";
    }

    return errorMessage;
}

export function CheckDuplicated(firstObject, secondObject) {

    let isDuplicated = true;
    // console.log(firstObject, secondObject)

    Object.keys(firstObject).forEach((key) => {
        if (firstObject[key] !== secondObject[key]) isDuplicated = false;
    });

    return isDuplicated;

}

async function checkUsernameExistence(targetUsername) {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/users/check-username/${targetUsername}`,
        headers: {}
    };

    try {
        const response = await axios.request(config);
        // console.log('username checked successfully : ', response.data.message);
        return response.data.result;

    } catch (error) {
        console.log('username checked failed : ', error.message);
        return error.data.result;
    }

}

export async function ValidateProfileInfoForm(formData, isUsernameChanged) {
    const errors = {};

    // Username validation
    if (!formData.username || formData.username.trim().length === 0) {
        errors.username = "Username is required";
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
        errors.username = "Username must be 3-20 characters long and can only contain letters, numbers, and underscores";
    } else {

        //// check if username already used or not
        if (isUsernameChanged) {
            let usernameExistence = await checkUsernameExistence(formData.username)
            if (usernameExistence) errors.username = "Username already used";
        }
    }

    // FirstName validation
    if (formData.firstname.trim().length > 0) {
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.firstname))
            errors.firstname = "FirstName must be 3-20 characters long and can only contain letters, numbers, and underscores";
    }
    // LastName validation
    if (formData.lastname.trim().length > 0) {
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.lastname))
            errors.lastname = "LastName must be 3-20 characters long and can only contain letters, numbers, and underscores";
    }

    // Email validation
    if (!formData.email || formData.email.trim().length === 0) {
        errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Invalid email format";
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