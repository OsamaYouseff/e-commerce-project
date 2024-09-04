/* eslint-disable no-useless-catch */
import axios from "axios";
import { GetTokenAndUserId } from "../General/GeneralFunctions";

const baseURL = import.meta.env.VITE_BASE_URL;

export const getCustomerOrders = async () => {

    const { customerId, accessToken } = GetTokenAndUserId();

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/orders/find/${customerId}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    try {
        const response = await axios.request(config);

        console.log("XXXXXXXXXXXXX : ", response.data[0].items)

        if (response.data[0].items.length == 0) return response.data[0]; //// order is empty
        else return response.data[0];

    } catch (error) {
        console.log('Error Fetching Order Data : ', error);
        // throw error;
    }
};

export const getCustomerOrdersMinimized = async () => {

    const { customerId, accessToken } = GetTokenAndUserId();

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/orders/min/${customerId}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    try {
        const response = await axios.request(config);

        // console.log("XXXXXXXXXXXXX : ", response)

        return { status: true, response: response.data };

    } catch (error) {
        console.log('Error Fetching Order Data : ', error);
        return { status: false, message: "Failed to fetch your order items 😢" };

        // throw error;
    }
};

export const getSpecificOrderForCustomerDetailed = async (orderId) => {

    const { customerId, accessToken } = GetTokenAndUserId();

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/orders/detailed/${customerId}/${orderId}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    try {
        const response = await axios.request(config);

        // console.log("XXXXXXXXXXXXX : ", response.data)

        return { status: true, order: response.data };

    } catch (error) {
        console.log('Error Fetching order Data : ', error);
        return { status: false, message: "Failed to get your order information 😢" };
    }
};

export const createCustomerOrder = async (orderData) => {

    const { customerId, accessToken } = GetTokenAndUserId();

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/orders/${customerId}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        data: orderData,
    };

    try {
        const response = await axios.request(config);

        console.log("ORDER RESPONSE : ", response.data)

        return { status: true, message: "Your order has been placed successfully." };

    } catch (error) {
        console.log('Error Fetching order Data : ', error);
        return { status: false, message: "Failed to place your order please confirm your address and payment method and try again later." };
    }
};

export const deleteOrder = async (orderId) => {

    const { customerId, accessToken } = GetTokenAndUserId();

    let config = {
        method: 'delete',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/orders/${customerId}/${orderId}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    try {
        const response = await axios.request(config);

        console.log("ORDER RESPONSE : ", response.data)

        return { status: true, message: "Your order cancelled successfully." };

    } catch (error) {
        console.log('Error Fetching order Data : ', error);
        return { status: false, message: "Failed to Cancel this order 😢" };
    }
};
