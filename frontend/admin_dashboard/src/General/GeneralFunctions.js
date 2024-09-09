import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import axios from "axios";
import { GoHome } from '../../../shared_files/General/GeneralFunctions';
////// admin used functions
export function ValidateProductInfoForm(formData) {
    const errors = {};

    // Username validation
    if (!formData.title || formData.title.trim().length === 0) {
        errors.title = "Title is required";
    }
    if (!formData.desc || formData.desc.trim().length === 0) {
        errors.desc = "Description is required";
    }
    if (!formData.img || formData.img.trim().length === 0) {
        errors.image = "You must choice at least an image";
    }
    if (!formData.categories || formData.categories.length === 0 || typeof formData.categories !== "object") {
        errors.categories = "You must choice at least one category";
    }
    if (!formData.size || formData.size.trim().length === 0) {
        errors.size = "You must choice a size";
    }
    if (!formData.color || formData.color.trim().length === 0) {
        errors.color = "You must choice a color";
    }
    if (!formData.price || formData.price <= 0) {
        errors.price = "You must choice a valid price";
    }
    if (formData.rating < 0) {
        errors.rating = "Please choose a rating between 1 and 5";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
}
export function GetNextStatus(currentStatus) {
    if (currentStatus === "pending") return "processing";
    if (currentStatus === "processing") return "delivered";
    if (currentStatus === "delivered") return "canceled";
}
export function StoreDataAtLocalStorage(Type = "localStorage", data) {

    if (!data) {
        toast.error("there are some data missing please logout and login again");
        GoHome();
        return
    }

    if (Type === "localStorage") {
        localStorage.setItem('adminInfo', JSON.stringify(data.userInfo));

    } else if (Type === "sessionStorage") {
        sessionStorage.setItem('adminInfo', JSON.stringify(data.userInfo));
    }

    Cookies.set('admin-token', data.accessToken, { expires: 7 });


}
export function ResetLocalStorage() {
    sessionStorage.removeItem("adminInfo");
    localStorage.removeItem("adminInfo");
    localStorage.removeItem("admin-token");
    sessionStorage.removeItem("admin-token");
    Cookies.remove("admin-token");
}
export function GoLoginPage() {
    window.location.href = "/login";
}
export function GetTokenAndUserId() {
    const userData = localStorage.getItem('adminInfo') || sessionStorage.getItem('adminInfo');
    const accessToken = Cookies.get('admin-token');


    if (!userData) {
        toast("there are some data missing please login again");
        setTimeout(() => {
            ResetLocalStorage()
            GoHome();
        }, 1500)
        return;
    }

    if (!userData || !accessToken) {
        toast.error("Your session has expired please login again");
        setTimeout(() => {
            ResetLocalStorage()
            GoHome();
        }, 1500)
        return;
    }
    const adminId = JSON.parse(userData)["_id"];


    return { adminId, accessToken };
}
export function FormatDateToSimpleDate(isoDate) {
    // Create a new Date object from the ISO date string
    const date = new Date(isoDate);

    // Get the day, month, and year components
    const day = String(date.getDate()).padStart(2, '0'); // Get the day of the month (1-31)
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month (0-11, so we add 1)
    const year = date.getFullYear(); // Get the full year (e.g., 2024)

    // Format the date as dd/mm/yyyy
    return `${day}/${month}/${year}`;
}
export function GetUserInfo() {
    if (localStorage.getItem("adminInfo"))
        return JSON.parse(localStorage.getItem("adminInfo"));
    else if (sessionStorage.getItem("adminInfo"))
        return JSON.parse(sessionStorage.getItem("adminInfo"));

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
export function IsUserLoggedIn() {

    if ((localStorage.getItem("adminInfo") || (sessionStorage.getItem("adminInfo")) && Cookies.get('admin-token')))
        return true;
    else
        return false;
}

