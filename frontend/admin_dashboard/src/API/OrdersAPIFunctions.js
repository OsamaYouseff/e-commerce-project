/* eslint-disable no-useless-catch */
import axios from "axios";
import { GetTokenAndUserId } from "../General/GeneralFunctions.js";

const baseURL = import.meta.env.VITE_BASE_URL;

//// admin dashboard functions

export const getAllOrdersPaginated = async (filter) => {

    const { accessToken } = GetTokenAndUserId();

    const { page, limit, sorting } = filter;


    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/orders/?page=${page}&limit=${limit}&sorting=${sorting}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    try {
        const response = await axios.request(config);
        return { status: true, data: response.data, message: "Orders fetched successfully" };

    } catch (error) {
        console.log('Error Fetching Orders Data : ', error);
        return { status: false, message: "Failed to get Orders" };
    }
};

export const getSpecificOrderForCustomerDetailed = async (orderId) => {
    const { accessToken } = GetTokenAndUserId();

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/orders/detailed/${orderId}`,
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

export const deleteOrder = async (orderId) => {

    const { accessToken } = GetTokenAndUserId();

    let config = {
        method: 'delete',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/orders/${orderId}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    try {
        const response = await axios.request(config);

        // console.log("ORDER RESPONSE : ", response.data)

        return { status: true, message: "Your order cancelled successfully." };

    } catch (error) {
        console.log('Error Fetching order Data : ', error);
        return { status: false, message: "Failed to Cancel this order 😢" };
    }
};

export const updateOrderStatus = async (orderData) => {

    const { accessToken } = GetTokenAndUserId();

    const { orderId, orderStatus } = orderData;

    let config = {
        method: 'patch',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/orders/${orderId}/${orderStatus}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        data: orderData
    };

    try {
        const response = await axios.request(config);

        return { status: true, response: response.data, message: "Your order status updated successfully." };

    } catch (error) {
        console.log('Error Fetching order Data : ', error);
        return { status: false, message: "Failed to Update status for this order 😢" };
    }
};

export const searchForOrder = async (orderId) => {

    const { accessToken } = GetTokenAndUserId();

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/orders/search/${orderId}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
    };

    try {
        const response = await axios.request(config);

        // console.log("RESPONSE :::::: ", response.data);

        return { status: true, response: response.data, message: "order was found🙂" };

    } catch (error) {
        console.log('Error Fetching order Data : ', error);
        return { status: false, message: "can't find any order with id : " + orderId + " 😢" };
    }
};





