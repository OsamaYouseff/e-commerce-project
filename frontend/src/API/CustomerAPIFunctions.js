/* eslint-disable no-useless-catch */
import axios from "axios";
import { ResetLocalStorage, StoreDataAtLocalStorage } from "../redux/GeneralFunctions";

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

        if (rememberMe)
            StoreDataAtLocalStorage('localStorage', response.data);
        else
            StoreDataAtLocalStorage('sessionStorage', response.data);

        return response.data.userInfo;

    } catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
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

        alert('Customer created successfully:', response.data);

        StoreDataAtLocalStorage('localStorage', response.data);

        return true;

    } catch (error) {
        console.error('Error creating customer:', error.response.data.message);
        alert("Error " + error.response.data.message);
        return false;
    }
};

export const updateCustomerAccount = async (customerFromData) => {

    const customerData = localStorage.getItem('customerInfo') || sessionStorage.getItem('customerInfo');
    const accessToken = localStorage.getItem('token') || sessionStorage.getItem('token');


    if (!customerData || !accessToken) {
        alert("Please login first");
        return;
    }
    const customerId = JSON.parse(customerData)["_id"];

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
        console.log('Customer updated successfully:', response.data);


        if (localStorage.getItem('customerInfo')) {
            localStorage.setItem('customerInfo', JSON.stringify(response.data));
        } else {
            sessionStorage.setItem('customerInfo', JSON.stringify(response.data));
        }

        return response.data;

    } catch (error) {
        console.error('Error updating customer:', error);
    }

};

///// TODO: refactor delete customer
export const deleteCustomerAccount = async (customerId) => {
    const url = `${baseURL}/api/customers/${customerId}`;

    try {
        const response = await axios.delete(url, {
            headers: {
                'Content-Type': 'application/json',
                // Add any necessary authentication token here if required
                // 'Authorization': `Bearer ${token}`
            },
        });
        console.log('Customer deleted successfully:', response.data);
        // Handle success, update UI, etc.
    } catch (error) {
        console.error('Error deleting customer:', error);
        // Handle error, show error message, etc.
    }
};