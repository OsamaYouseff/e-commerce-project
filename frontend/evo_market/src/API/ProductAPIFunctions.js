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


