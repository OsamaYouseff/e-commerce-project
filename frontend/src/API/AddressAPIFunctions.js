/* eslint-disable no-useless-catch */
import axios from "axios";
import { GoHome } from "../General/GeneralFunctions";

const baseURL = import.meta.env.VITE_BASE_URL;

export const getCustomerAddresses = async () => {

    const customerData = localStorage.getItem('customerInfo') || sessionStorage.getItem('customerInfo');
    const accessToken = localStorage.getItem('token') || sessionStorage.getItem('token');


    if (!customerData || !accessToken) {
        alert("Please login first");
        GoHome();
        return;
    }
    const customerId = JSON.parse(customerData)["_id"];


    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/addresses/${customerId}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    try {
        const response = await axios.request(config);

        return response.data;

    } catch (error) {
        console.log('Error Customer Addresses Data : ', error);
        throw error;
    }
};

export const deleteCustomerAddress = async (addressId) => {

    const customerData = localStorage.getItem('customerInfo') || sessionStorage.getItem('customerInfo');
    const accessToken = localStorage.getItem('token') || sessionStorage.getItem('token');


    if (!customerData || !accessToken) {
        alert("Please login first");
        GoHome();

        return;
    }
    const customerId = JSON.parse(customerData)["_id"];


    let config = {
        method: 'delete',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/addresses/${customerId}/${addressId}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    try {
        const response = await axios.request(config);

        return response;

    } catch (error) {
        console.log('Error Customer Addresses Data : ', error);
        throw error;
    }
};

export const getCustomerAddress = async (addressId) => {

    const customerData = localStorage.getItem('customerInfo') || sessionStorage.getItem('customerInfo');
    const accessToken = localStorage.getItem('token') || sessionStorage.getItem('token');


    if (!customerData || !accessToken) {
        alert("Please login first");
        GoHome();
        return;
    }
    const customerId = JSON.parse(customerData)["_id"];


    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/addresses/${customerId}/${addressId}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    try {
        const response = await axios.request(config);

        return response.data;

    } catch (error) {
        console.log('Error Customer Addresses Data : ', error);
        throw error;
    }
};

export const addNewCustomerAddress = async (addressData) => {

    const customerData = localStorage.getItem('customerInfo') || sessionStorage.getItem('customerInfo');
    const accessToken = localStorage.getItem('token') || sessionStorage.getItem('token');


    if (!customerData || !accessToken) {
        alert("Please login first");
        GoHome();
        return;
    }
    const customerId = JSON.parse(customerData)["_id"];


    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/addresses/${customerId}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        data: addressData,
    };

    try {
        const response = await axios.request(config);

        return { state: true, message: "Address Added Successfully." };

    } catch (error) {
        console.log('Error Customer Addresses Data : ', error.response.data.message);
        return { state: false, message: error.response.data.message };
    }
};

export const updateCustomerAddress = async (addressData, addressId) => {

    if (!addressData || !addressId) {
        alert("Please provide address data and address id");
        return;
    }

    const customerData = localStorage.getItem('customerInfo') || sessionStorage.getItem('customerInfo');
    const accessToken = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!customerData || !accessToken) {
        alert("Please login first");
        GoHome();
        return;
    }

    const customerId = JSON.parse(customerData)["_id"];


    let config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/addresses/${customerId}/${addressId}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        data: addressData,
    };

    try {
        const response = await axios.request(config);

        console.log(response)

        return { state: true, message: "Address Added Successfully." };

    } catch (error) {
        console.log('Error Customer Addresses Data : ', error.response.data.message);
        return { state: false, message: error.response.data.message };
    }
};






