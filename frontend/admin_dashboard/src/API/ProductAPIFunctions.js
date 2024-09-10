/* eslint-disable no-useless-catch */
import axios from "axios";
import { GetTokenAndUserId } from "../General/GeneralFunctions.js";

const baseURL = import.meta.env.VITE_BASE_URL;

export const getFilteredProducts = async (filter) => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/products?${filter}`,
        headers: {}
    };

    try {
        const response = await axios.request(config);

        return { status: true, data: response, message: "Products fetched successfully" };

    } catch (error) {
        console.log('Error Fetching Products Data : ', error);
        return { status: false, message: "Failed to get products" };
    }
};
export const getAllProductsPaginated = async (filter) => {
    const { page, limit, sorting } = filter;

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/products/all?page=${page}&limit=${limit}&sorting=${sorting}`,
        headers: {}
    };

    try {
        const response = await axios.request(config);

        return { status: true, data: response.data, message: "Products fetched successfully" };

    } catch (error) {
        console.log('Error Fetching Products Data : ', error);
        return { status: false, message: "Failed to get products" };
    }
};
export const getAProduct = async (productId) => {

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/products/find/${productId}`,
        headers: {}
    };

    try {
        const response = await axios.request(config);

        return { status: true, data: response.data, message: "Product fetched successfully" };

    } catch (error) {
        console.error('Error Fetching Products Data : ', error);
        return { status: false, message: "Failed to get this product" };
    }
};
export const addNewProduct = async (productData) => {

    const { accessToken } = GetTokenAndUserId();

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/products/`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        data: productData

    };

    try {
        const response = await axios.request(config);

        return { status: true, data: response.data, message: "Product created successfully" };

    } catch (error) {
        console.log('Error Fetching Products Data : ', error);
        return { status: false, message: "Failed to create this product" };
    }
}
export const editProduct = async (productData) => {

    const { accessToken } = GetTokenAndUserId();


    let config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/products/${productData._id}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        data: productData

    };

    try {
        const response = await axios.request(config);

        // console.log(response)

        return { status: true, data: response.data, message: "Product updated successfully" };

    } catch (error) {
        console.log('Error Fetching Products Data : ', error);
        return { status: false, message: "Failed to update this product : " + error.response.data.error };
    }
}
export const deleteProduct = async (productId) => {

    const { adminId, accessToken } = GetTokenAndUserId();

    let config = {
        method: 'delete',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/products/${adminId}/${productId}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    try {
        const response = await axios.request(config);

        return { status: true, data: response.data, message: "Product has been deleted successfully" };

    } catch (error) {
        console.log('Error Fetching Products Data : ', error);
        return { status: false, message: "Failed to delete this product" };
    }
}
export const toggleDisableProduct = async (productId) => {

    const { adminId, accessToken } = GetTokenAndUserId();

    let config = {
        method: 'patch',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/products/disable/${adminId}/${productId}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    try {
        const response = await axios.request(config);

        // console.log(response)

        return { status: true, data: response.data, message: response.data.message };

    } catch (error) {
        console.log('Error Fetching Products Data : ', error);
        return { status: false, message: "Failed to delete this product" };
    }
}

export const searchForProduct = async (productName) => {

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/products/search/${productName}`,
        headers: {},
    };

    try {
        const response = await axios.request(config);

        // console.log("RESPONSE :::::: ", response.data);

        if (response.data.length === 0)
            return { status: true, response: response.data, message: "can't find any products with name : " + productName + " 😢" };
        else
            return { status: true, response: response.data, message: "some products were found🙂" };

    } catch (error) {
        console.log('Error Fetching product Data : ', error);
        return { status: false, message: "can't find any product with name : " + productName + " 😢" };
    }
};


