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

        if (response.data.products.length == 0) return response.data; //// Wishlist is empty
        else return response.data;

    } catch (error) {
        console.console.log('Error Fetching Wishlist Data : ', error);
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

        return { state: true, products: response.data, message: "Product Added Successfully To Wishlist." };

    } catch (error) {
        console.log('Error Adding Product To Wishlist : ', error.response.data.message);
        return { state: false, message: error.response.data.message };

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

        return { state: true, products: response.data, message: "Product Removed Successfully From Wishlist." };

    } catch (error) {
        console.log('Error Removing Product From Wishlist : ', error.response.data.message);
        return { state: false, message: error.response.data.message };

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
