/* eslint-disable no-useless-catch */
import axios from "axios";
import { GetTokenAndUserId } from "../General/GeneralFunctions";

const baseURL = import.meta.env.VITE_BASE_URL;

export const getCustomerWishlist = async () => {

    const { customerId, accessToken } = GetTokenAndUserId();


    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/wishlist/wishlist_detailed_products/${customerId}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    try {
        const response = await axios.request(config);

        // console.log("XXXXXXXXXXXXX : ", response.data)

        return { status: true, response: response.data }

    } catch (error) {
        console.log('Error Fetching Wishlist Data : ', error);

        return { status: false, message: "Failed to get your wishlist items😢" };

        // throw error;
    }
};

export const addProductToWishlist = async (addedProduct) => {

    const { customerId, accessToken } = GetTokenAndUserId();

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/wishlist/add-product/${customerId}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        data: addedProduct
    };

    try {
        const response = await axios.request(config);

        return { status: true, products: response.data, message: "This product added successfully to wishlist.😎" };

    } catch (error) {
        console.log('Error Adding Product To Wishlist : ', error);
        return { status: false, message: "Failed to add product to wishlist 😢" };

    }


}

export const removeProductFromWishlist = async (removeProduct) => {


    const { customerId, accessToken } = GetTokenAndUserId();


    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/wishlist/remove-product/${customerId}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        data: removeProduct
    };

    try {
        const response = await axios.request(config);

        // console.log(" XXXXXX : ", response.data)

        return { status: true, products: response.data, message: "this product removed successfully from wishlist. 😎" };

    } catch (error) {
        console.log('Error Removing Product From Wishlist : ', error);
        return { status: false, message: "Failed to remove product from wishlist 😢" };

    }


}

export const createCustomerWishlist = async () => {

    const { customerId, accessToken } = GetTokenAndUserId();

    let data = JSON.stringify({
        "userId": customerId,
        "products": []
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/wishlist`,
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

export const isProductInWishlist = async (productId) => {

    const { customerId, accessToken } = GetTokenAndUserId();

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/wishlist/check-product/${customerId}/${productId}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
    };

    try {
        const response = await axios.request(config);

        // console.log("CCCCCCCCCCCCCCCCCCCC : ", response.data["isInWishlist"])

        if (response.data["isInWishlist"])
            return true;
        else
            return false;

    } catch (error) {
        return false;
    }


}


