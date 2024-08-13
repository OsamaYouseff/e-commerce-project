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
    localStorage.removeItem("customerInfo");
    localStorage.removeItem("token");
    sessionStorage.removeItem("customerInfo");
    sessionStorage.removeItem("token");
}

export function StoreDataAtLocalStorage(Type = "localStorage", data) {

    if (Type === "localStorage") {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('customerInfo', JSON.stringify(data.userInfo));

    } else if (Type === "sessionStorage") {
        sessionStorage.setItem('token', data.accessToken);
        sessionStorage.setItem('customerInfo', JSON.stringify(data.userInfo));
    }

}

export function IsUserLoggedIn() {

    if ((localStorage.getItem("customerInfo") && localStorage.getItem("token"))
        || (sessionStorage.getItem("customerInfo") && sessionStorage.getItem("token")))
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
    const accessToken = localStorage.getItem('token') || sessionStorage.getItem('token');


    if (!customerData || !accessToken) {
        alert("there are some data missing please logout and login again");
        GoHome();
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

export const GetStateColor = (state) => {
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

const coupons = [
    "10OFF", "15OFF", "20OFF", "25OFF", "50OFF"
]

export function CalcTotalCartPrice(subtotalPrice, couponCode = "") {
    const discount = couponCode ? Number((GetCouponDiscount(couponCode) * subtotalPrice).toFixed(2)) : 0;
    const shippingCalc = subtotalPrice !== 0 ? (subtotalPrice >= 50 ? 0 : 20) : 0;
    const shippingCost = shippingCalc === 0 ? "Free" : "$20";
    const finalPrice = subtotalPrice !== 0 ? (subtotalPrice - discount + shippingCalc).toFixed(2) : 0;


    return { finalPrice, shippingCost, discount, shippingCalc };
}

export function isDiscountValid(couponCode) {
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

export function getMessagesFromObject(errors) {
    let message = '';

    Object.keys(errors).forEach((key) => {
        message += `\n${key}: ${errors[key]}`;
    });
    return message;
}
