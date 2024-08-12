/* eslint-disable no-useless-catch */
import axios from "axios";
import { GetTokenAndUserId } from "../General/GeneralFunctions";

const baseURL = import.meta.env.VITE_BASE_URL;

export const getCustomerOrders = async () => {

    const { customerId, accessToken } = GetTokenAndUserId();

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/orders/find/${customerId}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    try {
        const response = await axios.request(config);

        // console.log("XXXXXXXXXXXXX : ", response.data[0].items)

        if (response.data[0].items.length == 0) return response.data[0]; //// order is empty
        else return response.data[0];

    } catch (error) {
        console.log('Error Fetching Order Data : ', error);
        // throw error;
    }
};

export const getCustomerOrdersMinimized = async () => {

    const { customerId, accessToken } = GetTokenAndUserId();

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/orders/${customerId}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    try {
        const response = await axios.request(config);

        // console.log("XXXXXXXXXXXXX : ", response.data)

        return response.data;

    } catch (error) {
        console.log('Error Fetching Order Data : ', error);
        // throw error;
    }
};

export const getSpecificOrderForCustomerDetailed = async (orderId) => {

    const { customerId, accessToken } = GetTokenAndUserId();

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/orders/${customerId}/${orderId}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    try {
        const response = await axios.request(config);

        // console.log("XXXXXXXXXXXXX : ", response.data[0])

        return { status: true, order: response.data[0] };

    } catch (error) {
        console.log('Error Fetching order Data : ', error);
        return { status: false, message: "Failed to fetch order items" };

        // throw error;
    }
};


export const createCustomerOrder = async (orderData) => {

    const { customerId, accessToken } = GetTokenAndUserId();

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${baseURL}/api/orders/${customerId}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        data: orderData,
    };

    try {
        const response = await axios.request(config);

        console.log("ORDER RESPONSE : ", response.data)

        return { status: true, message: "Your order has been placed successfully." };

    } catch (error) {
        console.log('Error Fetching order Data : ', error);
        // throw error;
        return { status: true, message: "Failed to place your order try again later." };

    }
};







// export const addUpdateProductInOrder = async (addedProduct) => {

//     const { customerId, accessToken } = GetTokenAndUserId();

//     let config = {
//         method: 'post',
//         maxBodyLength: Infinity,
//         url: `${baseURL}/api/orders/add_update-product/${customerId}`,
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${accessToken}`
//         },
//         data: addedProduct
//     };

//     try {
//         const response = await axios.request(config);

//         return response.data;

//     } catch (error) {
//         console.error('Error Updating Product To order : ', error);
//         throw error;
//     }


// }

// export const removeProductFromOrder = async (removeProduct) => {

//     const { customerId, accessToken } = GetTokenAndUserId();


//     let config = {
//         method: 'post',
//         maxBodyLength: Infinity,
//         url: `${baseURL}/api/orders/remove-product/${customerId}`,
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${accessToken}`
//         },
//         data: removeProduct
//     };

//     try {
//         const response = await axios.request(config);

//         // console.log(" XXXXXX : ", response.data)

//         return response.data;

//     } catch (error) {
//         console.error('Error Removing Product From order : ', error);
//         throw error;
//     }


// }