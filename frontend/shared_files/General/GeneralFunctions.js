//// shared
export function GetMessagesFromObject(errors) {
    let message = '';

    Object.keys(errors).forEach((key) => {
        message += `\n${key}: ${errors[key]}`;
    });
    return message;
}
export function DoScrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
export function GoHome() {
    window.location.href = "/";
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
export function GetStatusColor(state) {
    const stateColorDict = {
        pending: "#ff9100",
        processing: "#9c27b0",
        delivered: "#38ae04",
        canceled: "#f44336",
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




