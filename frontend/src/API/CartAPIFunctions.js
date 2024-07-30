/* eslint-disable no-useless-catch */
import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

export const getCustomerCart = async () => {
    const customerData = localStorage.getItem('customerInfo') || sessionStorage.getItem('customerInfo')._id;
    const accessToken = localStorage.getItem('token') || sessionStorage.getItem('token');


    if (!customerData || !accessToken) {
        alert("Please login first");
        return;
    }

    const customerId = JSON.parse(customerData)["_id"];

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

        // console.log(" XXXXXX : ", response.data[0])

        if (response.data.length === 0) return response.data;
        else return response.data[0];


    } catch (error) {
        console.error('Error Fetching Cart Data : ', error);
        throw error;
    }
};
