/* eslint-disable no-useless-catch */
import axios from "axios";
import { GetTokenAndUserId } from "../General/GeneralFunctions.js";



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

        // console.log("XXXXXXXXXXXXX : ", response.data[0].items)

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

        // A 2xx here means the order exists and its total matched what the
        // customer confirmed. The API refuses a stale preview with 409 before
        // writing anything, so a success never needs a confirmation step, and
        // there is no staleCart flag left on the response to interpret.
        return {
            status: true,
            message: "Your order has been placed successfully.",
            // The order is passed on rather than dropped: the caller needs the
            // id to know the attempt succeeded, and the totals to show what was
            // actually charged.
            order: response.data,
            orderId: response.data && response.data._id,
        };

    } catch (error) {
        console.log('Error Fetching order Data : ', error);

        // 409 carrying pricing details is the server-authoritative price having
        // moved: no order was created, so the customer must accept the new
        // total and retry with the same idempotency key.
        const errorBody = error.response && error.response.data;
        const details = errorBody && errorBody.details;
        if (error.response && error.response.status === 409 && details && details.staleCart) {
            return {
                status: false,
                needsConfirmation: true,
                staleCart: true,
                financials: details.financials,
                message: "The price changed while you were checking out. Confirm the new total to place your order.",
            };
        }

        const serverMessage = errorBody && errorBody.message;
        return {
            status: false,
            message: serverMessage || "Failed to place your order please confirm your address and payment method and try again later.",
        };
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
