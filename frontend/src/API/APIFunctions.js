import axios from "axios";

export const getCustomer = async (customerId) => {
    const url = `http://localhost:1337/api/customers/${customerId}`;
    try {
        const response = await axios.get(url).then((response) => {
            return response.data
        });

        // console.log('Customers fetched successfully:', response.data.attributes);
        return response.data.attributes;
    } catch (error) {
        console.error('Error fetching customers:', error);
    }
};

export const createCustomerAccount = async () => {
    const url = 'http://localhost:1337/api/customers';
    const customerData = {
        data: {
            FirstName: "Hassan",
            LastName: "Mostafa",
            Email: "Hassan@gmail.com",
            Password: '1234',
            Gender: "Male",
            PhoneNumber: "01011534486",
            Address: "street 1 at city in country "
        }
    };

    const config = {
        method: 'post',
        url: url,
        headers: {
            'Content-Type': 'application/json',
        },
        data: customerData,
    };

    try {
        const response = await axios.request(config);
        console.log('Customer created successfully:', response.data);
        // Handle success, update UI, etc.
    } catch (error) {
        console.error('Error creating customer:', error);
        // Handle error, show error message, etc.
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