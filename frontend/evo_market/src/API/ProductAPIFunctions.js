/* eslint-disable no-useless-catch */
import axios from "axios";

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

        return { status: true, data: response, message: "Products Fetched Successfully" };

    } catch (error) {
        console.log('Error Fetching Products Data : ', error);
        return { status: false, message: "Failed to get products" };
    }
};
export const getAllProductsPaginated = async (filter) => {
    const { page, limit } = filter;

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/products/all?page=${page}&limit=${limit}`,
        headers: {}
    };

    try {
        const response = await axios.request(config);

        return { status: true, data: response.data, message: "Products Fetched Successfully" };

    } catch (error) {
        console.error('Error Fetching Products Data : ', error);
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

        return { status: true, data: response.data, message: "Product Fetched Successfully" };

    } catch (error) {
        console.error('Error Fetching Products Data : ', error);
        return { status: false, message: "Failed to get this product" };
    }
};


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
