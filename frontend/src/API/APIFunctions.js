/* eslint-disable no-useless-catch */
import axios from "axios";

export const customerLogin = async (customerData, rememberMe) => {
    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://localhost:5000/api/auth/login',
        headers: {
            'Content-Type': 'application/json'
        },
        data: customerData
    };

    try {
        const response = await axios.request(config);

        if (rememberMe) {
            localStorage.setItem('token', response.data.accessToken);
            localStorage.setItem('customerInfo', JSON.stringify(response.data.userInfo));
        } else {
            sessionStorage.setItem('token', response.data.accessToken);
            sessionStorage.setItem('customerInfo', JSON.stringify(response.data.userInfo));
        }
        // alert(`Customers fetched successfully: ${customerData.username}`);

        return true;
    } catch (error) {
        // console.error('Error fetching customers:', error);
        throw error;
    }
};
export const registerACustomer = async (customerFromData) => {
    const url = 'http://localhost:5000/api/auth/register';

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: url,
        headers: {
            'Content-Type': 'application/json'
        },
        data: customerFromData
    };


    try {
        const response = await axios.request(config);

        alert('Customer created successfully:', response.data);

        //// store token in local storage
        localStorage.setItem('token', response.data.accessToken);

        // ///// store customer Info in local storage
        localStorage.setItem('customerInfo', JSON.stringify(response.data.userInfo));


        return true;

    } catch (error) {
        console.error('Error creating customer:', error.response.data.message);
        alert("Error " + error.response.data.message);
        return false;
    }
};

export const updateCustomerAccount = async (customerFromData) => {

    const customerData = localStorage.getItem('customerInfo') || sessionStorage.getItem('customerInfo');
    const accessToken = localStorage.getItem('token') || sessionStorage.getItem('token');


    if (!customerData || !accessToken) {
        alert("Please login first");
        return;
    }
    const customerId = JSON.parse(customerData)["_id"];

    const config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: `http://localhost:5000/api/users/${customerId}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        data: customerFromData
    };

    try {
        const response = await axios.request(config);
        console.log('Customer updated successfully:', response.data);


        if (localStorage.getItem('customerInfo')) {
            localStorage.setItem('customerInfo', JSON.stringify(response.data));
        } else {
            sessionStorage.setItem('customerInfo', JSON.stringify(response.data));
        }

        return response.data;

    } catch (error) {
        console.error('Error updating customer:', error);
    }

};

export const deleteCustomerAccount = async () => {
    const customerId = 6;
    const url = `http://localhost:1337/api/customers/${customerId}`;

    try {
        const response = await axios.delete(url, {
            headers: {
                'Content-Type': 'application/json',
                // Add any necessary authentication token here if required
                // 'Authorization': `Bearer ${token}`
            },
        });
        console.log('Customer deleted successfully:', response.data);
        // Handle success, update UI, etc.
    } catch (error) {
        console.error('Error deleting customer:', error);
        // Handle error, show error message, etc.
    }
};