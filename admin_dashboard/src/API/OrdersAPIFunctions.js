/* eslint-disable no-useless-catch */
import axios from "axios";
import { GetTokenAndUserId } from "../General/GeneralFunctions";
import { ReportRounded } from "@mui/icons-material";

const baseURL = import.meta.env.VITE_BASE_URL;

const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YTRlYTRlN2MyMzE1NDgwNjQ3NmI5YiIsImlzQWRtaW4iOnRydWUsImlhdCI6MTcyNTIyOTU5NSwiZXhwIjoxNzI1NDg4Nzk1fQ.AR5paSazML92eOkDq5B82NbA3cZ_23mvQz7dkgCunak";

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

//// admin dashboard functions


export const getAllOrdersPaginated = async (filter) => {

    // const { customerId, accessToken } = GetTokenAndUserId();

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
    // const { customerId, accessToken } = GetTokenAndUserId();

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

    // const { customerId, accessToken } = GetTokenAndUserId();

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

    // const { customerId, accessToken } = GetTokenAndUserId();

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



