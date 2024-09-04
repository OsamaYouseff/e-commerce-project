/* eslint-disable no-useless-catch */
import axios from "axios";
import { GetTokenAndUserId } from "../General/GeneralFunctions";

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

    // const { customerId, accessToken } = GetTokenAndUserId();

    const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YTRlYTRlN2MyMzE1NDgwNjQ3NmI5YiIsImlzQWRtaW4iOnRydWUsImlhdCI6MTcyNTIyOTU5NSwiZXhwIjoxNzI1NDg4Nzk1fQ.AR5paSazML92eOkDq5B82NbA3cZ_23mvQz7dkgCunak";

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

    console.log(productData);

    // const { customerId, accessToken } = GetTokenAndUserId();

    const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YTRlYTRlN2MyMzE1NDgwNjQ3NmI5YiIsImlzQWRtaW4iOnRydWUsImlhdCI6MTcyNTIyOTU5NSwiZXhwIjoxNzI1NDg4Nzk1fQ.AR5paSazML92eOkDq5B82NbA3cZ_23mvQz7dkgCunak";
    const adminId = "66a4ea4e7c23154806476b9b";


    let config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/products/${adminId}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        data: productData

    };

    try {
        const response = await axios.request(config);

        console.log(response)

        return { status: true, data: response.data, message: "Product updated successfully" };

    } catch (error) {
        console.log('Error Fetching Products Data : ', error);
        return { status: false, message: "Failed to update this product : " + error.response.data.error };
    }
}
export const deleteProduct = async (productId) => {

    // const { customerId, accessToken } = GetTokenAndUserId();

    const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YTRlYTRlN2MyMzE1NDgwNjQ3NmI5YiIsImlzQWRtaW4iOnRydWUsImlhdCI6MTcyNTIyOTU5NSwiZXhwIjoxNzI1NDg4Nzk1fQ.AR5paSazML92eOkDq5B82NbA3cZ_23mvQz7dkgCunak";
    const adminId = "66a4ea4e7c23154806476b9b";

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

    // const { customerId, accessToken } = GetTokenAndUserId();

    const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YTRlYTRlN2MyMzE1NDgwNjQ3NmI5YiIsImlzQWRtaW4iOnRydWUsImlhdCI6MTcyNTIyOTU5NSwiZXhwIjoxNzI1NDg4Nzk1fQ.AR5paSazML92eOkDq5B82NbA3cZ_23mvQz7dkgCunak";
    const adminId = "66a4ea4e7c23154806476b9b";

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

        console.log(response)

        return { status: true, data: response.data, message: response.data.message };

    } catch (error) {
        console.log('Error Fetching Products Data : ', error);
        return { status: false, message: "Failed to delete this product" };
    }
}


