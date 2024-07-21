import axios from "axios";

export const customerLogin = async (customerData, rememberMe) => {
    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://localhost:1337/api/auth/local',
        headers: {
            'Content-Type': 'application/json'
        },
        data: customerData
    };

    try {
        const response = await axios.request(config);

        if (rememberMe) {
            //// store token in local storage
            localStorage.setItem('token', response.data.jwt);

            // ///// store customer Info in local storage
            localStorage.setItem('customerInfo', JSON.stringify(response.data.user));

        } else {
            //// store token in session Storage
            sessionStorage.setItem('token', response.data.jwt);

            ///// store customer Info in session Storage
            sessionStorage.setItem('customerInfo', JSON.stringify(response.data.user));
        }


        // alert(`Customers fetched successfully: ${customer.email}`);



        return true;
    } catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
    }
};
export const createCustomerAccount = async (customerFromData) => {
    const url = 'http://localhost:1337/api/auth/local/register';

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
        localStorage.setItem('token', response.data.jwt);

        // ///// store customer Info in local storage
        localStorage.setItem('customerInfo', JSON.stringify(response.data.user));


        return true;

    } catch (error) {
        console.error('Error creating customer:', error);
        return false;
    }
};

export const editCustomerAccount = async () => {
    const customerId = 1;
    const url = `http://localhost:1337/api/customers/${customerId}`;

    const updatedData = {
        data: {
            FirstName: "Hassan",
            LastName: "Mostafa",
            Email: "Hassan@gmail.com",
            Gender: "Male",
            PhoneNumber: "01011534486",
            Address: "street 1 at city in country "
        }
    };

    const config = {
        method: 'put', // Use 'put' for update requests
        url: url,
        headers: {
            'Content-Type': 'application/json',
        },
        data: updatedData,
    };

    try {
        const response = await axios.request(config);
        console.log('Customer updated successfully:', response.data);
        // Handle success, update UI, etc.
    } catch (error) {
        console.error('Error updating customer:', error);
        // Handle error, show error message, etc.
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