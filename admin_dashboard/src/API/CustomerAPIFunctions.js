/* eslint-disable no-useless-catch */
import axios from "axios";
import { GetTokenAndUserId, ResetLocalStorage, StoreDataAtLocalStorage } from "../General/GeneralFunctions";

const baseURL = import.meta.env.VITE_BASE_URL;

export const customerLogin = async (userData, rememberMe) => {
    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/auth/login`,
        headers: {
            'Content-Type': 'application/json'
        },
        data: userData
    };

    ResetLocalStorage();

    try {
        const response = await axios.request(config);

        if (rememberMe) StoreDataAtLocalStorage('localStorage', response.data);
        else StoreDataAtLocalStorage('sessionStorage', response.data);

        return { status: true, message: "Logged In Successfully" };

    } catch (error) {
        console.log('Error fetching customers:', error.response.data.message);
        return { status: false, message: error.response.data.message };
    }
};

export const registerACustomer = async (customerFromData) => {
    const url = `${baseURL}/api/auth/register`;

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: url,
        headers: {
            'Content-Type': 'application/json'
        },
        data: customerFromData
    };

    ResetLocalStorage();

    try {
        const response = await axios.request(config);

        // console.log('Customer created successfully:', response.data);

        StoreDataAtLocalStorage('localStorage', response.data);

        return { status: true, message: "Signed Up Successfully" };

    } catch (error) {
        console.log('Error creating customer : ', error.response.data);
        return { status: false, message: error.response.data };
    }
};
export const deleteCustomerAccount = async () => {

    const { customerId, accessToken } = GetTokenAndUserId();

    let config = {
        method: 'delete',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/users/${customerId}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
    };

    try {
        const response = await axios.request(config);
        // console.log('Customer deleted successfully:', response.data);
        return { status: true, message: response.data };

    } catch (error) {
        console.log('Error deleting customer:', error.response.data.error);
        return { status: false, message: "Failed to delete your account 😅" };

    }
};





///// new for dashboard

export const adminLogin = async (adminLoginData, rememberMe) => {
    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/auth/admin-login`,
        headers: {
            'Content-Type': 'application/json'
        },
        data: adminLoginData
    };

    ResetLocalStorage();

    try {
        const response = await axios.request(config);

        if (rememberMe) StoreDataAtLocalStorage('localStorage', response.data);
        else StoreDataAtLocalStorage('sessionStorage', response.data);

        return { status: true, message: "Logged In Successfully" };

    } catch (error) {
        console.log('Error fetching customers:', error.response.data.message);
        return { status: false, message: error.response.data.message };
    }
};

export const updateAdminAccount = async (adminFromData) => {

    const { adminId, accessToken } = GetTokenAndUserId();

    const config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/users/${adminId}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        data: adminFromData
    };

    try {
        const response = await axios.request(config);

        // console.log('Admin info updated successfully:', response.data);

        if (localStorage.getItem('adminInfo')) {
            localStorage.setItem('adminInfo', JSON.stringify(response.data));
        } else {
            sessionStorage.setItem('adminInfo', JSON.stringify(response.data));
        }

        // console.log('Admin info updated successfully : ', response.data);

        return { status: true, message: "Admin info updated successfully" };

    } catch (error) {
        console.log('Error updating Admin info : ', error);
        return { status: false, message: "Failed to update your account information" };

    }

};

export const changeAdminPassword = async (adminFromData) => {
    const { adminId, accessToken } = GetTokenAndUserId();

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/users/change-password/${adminId}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        data: adminFromData
    };

    try {
        const response = await axios.request(config);
        // console.log('password changed successfully : ', response.data.message);
        return { status: true, message: response.data.message };

    } catch (error) {

        // console.log('Error : ', error.response.data.message);
        // console.error('Error changing password : ', error);
        return { status: false, message: error.response.data.message }
    }

};