/* eslint-disable no-useless-catch */
import axios from "axios";
import { GetTokenAndUserId } from "../General/GeneralFunctions";

const baseURL = import.meta.env.VITE_BASE_URL;

export const getCustomerCart = async () => {

    const { customerId, accessToken } = GetTokenAndUserId();

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/carts/cart_detailed_products/${customerId}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    try {
        const response = await axios.request(config);

        // console.log("XXXXXXXXXXXXX : ", response.data)

        if (response.data.products.length == 0)
            return { status: true, response: response.data };
        else
            return { status: true, response: response.data };

    } catch (error) {
        console.log('Error Fetching Cart Data : ', error);
        return { status: false, message: "Failed to get your cart items😢" };
    }
};

export const addUpdateProductInCart = async (addedProduct) => {

    const { customerId, accessToken } = GetTokenAndUserId();

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/carts/add_update-product/${customerId}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        data: addedProduct
    };

    try {
        const response = await axios.request(config);

        return { status: true, response: response.data, message: "This item has been added/updated successfully to your cart" };

    } catch (error) {
        console.log('Error Updating Product To Cart : ', error.data.response.message);
        return { status: false, message: error.data.response.message };
    }


}

export const removeProductFromCart = async (removeProduct) => {

    const { customerId, accessToken } = GetTokenAndUserId();

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/carts/remove-product/${customerId}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        data: removeProduct
    };

    try {
        const response = await axios.request(config);

        // console.log(" XXXXXX : ", response.data)

        return { status: true, response: response.data, message: "This item has been deleted successfully to your cart" }

    } catch (error) {
        console.error('Error Removing Product From Cart : ', error);
        throw error;
    }


}
export const clearCart = async () => {

    const { customerId, accessToken } = GetTokenAndUserId();

    let config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/carts/clear/${customerId}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    try {
        const response = await axios.request(config);

        console.log(" XXXXXX : ", response.data)

        return response.data;

    } catch (error) {
        console.error('Error Removing Product From Cart : ', error);
        throw error;
    }


}

export const createCustomerCart = async () => {

    const { customerId, accessToken } = GetTokenAndUserId();

    let data = JSON.stringify({
        "userId": customerId,
        "products": []
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/carts`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        data: data,
    };

    try {
        const response = await axios.request(config);

        console.log(" XXXXXX : ", response.data)

        return response.data;

    } catch (error) {
        console.error('Error Creating Customer Cart : ', error.response.data.message);
        throw error;
    }


}