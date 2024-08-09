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

        if (response.data.products.length == 0) return response.data; //// cart is empty
        else return response.data;

    } catch (error) {
        console.console.log('Error Fetching Cart Data : ', error);
        // throw error;
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

        return response.data;

    } catch (error) {
        console.error('Error Updating Product To Cart : ', error);
        throw error;
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

        return response.data;

    } catch (error) {
        console.error('Error Removing Product From Cart : ', error);
        throw error;
    }


}