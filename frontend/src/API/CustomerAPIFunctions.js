/* eslint-disable no-useless-catch */
import axios from "axios";
import { GetTokenAndUserId, ResetLocalStorage, StoreDataAtLocalStorage } from "../General/GeneralFunctions";

const baseURL = import.meta.env.VITE_BASE_URL;

export const customerLogin = async (customerData, rememberMe) => {
    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/auth/login`,
        headers: {
            'Content-Type': 'application/json'
        },
        data: customerData
    };

    ResetLocalStorage();

    try {
        const response = await axios.request(config);

        if (rememberMe) StoreDataAtLocalStorage('localStorage', response.data);
        else StoreDataAtLocalStorage('sessionStorage', response.data);

        return { state: true, message: "Logged In Successfully" };

    } catch (error) {
        console.log('Error fetching customers:', error.response.data.message);
        return { state: false, message: error.response.data.message };
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

        console.log('Customer created successfully:', response.data);

        StoreDataAtLocalStorage('localStorage', response.data);

        return { state: true, message: "Signed Up Successfully" };

    } catch (error) {
        console.log('Error creating customer : ', error.response.data);
        return { state: false, message: error.response.data };
    }
};

export const updateCustomerAccount = async (customerFromData) => {

    const { customerId, accessToken } = GetTokenAndUserId();

    const config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/users/${customerId}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        data: customerFromData
    };

    try {
        const response = await axios.request(config);

        // console.log('Customer updated successfully:', response.data);

        if (localStorage.getItem('customerInfo')) {
            localStorage.setItem('customerInfo', JSON.stringify(response.data));
        } else {
            sessionStorage.setItem('customerInfo', JSON.stringify(response.data));
        }

        // console.log('Customer updated successfully : ', response.data);

        return { state: true, message: "Customer updated successfully" };

    } catch (error) {
        console.log('Error updating customer : ', error);
        return { state: false, message: error.response.data };

    }

};

export const changeCustomerPassword = async (customerFromData) => {

    const { customerId, accessToken } = GetTokenAndUserId();


    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/users/change-password/${customerId}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        data: customerFromData
    };

    try {
        const response = await axios.request(config);
        // console.log('password changed successfully : ', response.data.message);
        return { state: true, message: response.data.message };

    } catch (error) {

        // console.log('Error : ', error.response.data.message);
        // console.error('Error changing password : ', error);
        return { state: false, message: error.response.data.message }
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
        return { state: true, message: response.data };

    } catch (error) {
        // console.log('Error deleting customer:', error.response.data.error);
        return { state: true, message: error.response.data.error };

    }
};