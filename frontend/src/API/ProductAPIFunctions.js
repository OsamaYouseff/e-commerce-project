/* eslint-disable no-useless-catch */
import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

export const getAllProducts = async () => {


    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/products`,
        headers: {}
    };

    try {
        const response = await axios.request(config);

        return response;

    } catch (error) {
        console.error('Error Fetching Products Data : ', error);
        throw error;
    }
};
