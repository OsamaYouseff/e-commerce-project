/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-catch */
import axios from "axios";
import { GetTokenAndUserId } from "../General/GeneralFunctions";

import toast from "react-hot-toast";

const baseURL = import.meta.env.VITE_BASE_URL;

export const getCustomerAddresses = async () => {

    const { customerId, accessToken } = GetTokenAndUserId();


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

        return { status: true, addresses: response.data };

    } catch (error) {
        console.log('Error Customer Addresses Data : ', error.response.data.message);
        return { status: false, message: error.response.data.message };
    }
};

export const deleteCustomerAddress = async (addressId) => {

    const { customerId, accessToken } = GetTokenAndUserId();

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

        return { status: true, ...response.data };

    } catch (error) {
        console.log('Error Customer Addresses Data : ', error);
        return { status: false, message: "Failed to delete address." };
    }
};

export const getCustomerAddress = async (addressId) => {

    const { customerId, accessToken } = GetTokenAndUserId();

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/addresses/find/${customerId}/${addressId}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    try {
        const response = await axios.request(config);

        return { status: true, address: response.data, message: "Address changed successfully." };

    } catch (error) {
        console.log('Error Customer Addresses Data : ', error);
        throw error;
    }
};

export const addNewCustomerAddress = async (addressData) => {

    const { customerId, accessToken } = GetTokenAndUserId();


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

        return { status: true, message: "Address Added Successfully." };

    } catch (error) {
        console.log('Error Customer Addresses Data : ', error);
        return { status: false, message: "Failed to add this address😢 make sure all fields is valid" };
    }
};

export const updateCustomerAddress = async (addressData, addressId) => {

    if (!addressData || !addressId) {
        toast.error("Please provide address data and address id");
        return;
    }

    const { customerId, accessToken } = GetTokenAndUserId();

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

        // console.log(response)

        return { status: true, message: "Address Updated Successfully." };

    } catch (error) {
        console.log('Error Customer Addresses Data : ', error.response.data.message);
        return { status: false, message: "Failed to update this address" };
    }
};

export const setAddressDefault = async (addressId) => {

    if (!addressId) {
        toast.error("Please provide address id");
        return;
    }

    const { customerId, accessToken } = GetTokenAndUserId();

    let config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/addresses/set-default/${customerId}/${addressId}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
    };

    try {
        const response = await axios.request(config);

        // console.log(response)

        return { status: true, message: "Address set as default Successfully.", updatedAddresses: response.data.addresses };

    } catch (error) {
        console.log('Error Customer Addresses Data : ', error);
        return { status: false, message: "Failed to set address as default" };
    }
};

export const getCustomerDefaultAddress = async () => {
    const { customerId, accessToken } = GetTokenAndUserId();

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/addresses/find-default/${customerId}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
    };

    try {
        const response = await axios.request(config);

        // console.log(response.data)

        return { status: true, message: "Default address Fetched Successfully.", defaultAddress: response.data };

    } catch (error) {
        console.log('Error Customer Addresses Data : ', error.response.data.message);
        return { status: false, message: error.response.data.message };
    }
};

