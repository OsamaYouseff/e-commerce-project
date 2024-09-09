import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getSpecificOrderForCustomerDetailed, deleteOrder, getAllOrdersPaginated, updateOrderStatus, searchForOrder } from '../../API/OrdersAPIFunctions';
import toast from 'react-hot-toast';


export const getSpecificOrderForCustomerDetailedReducer = createAsyncThunk("getSpecificOrderForCustomerDetailedAPI/sendRequest", async (orderId) => {

    const response = await getSpecificOrderForCustomerDetailed(orderId);

    // console.log(response)

    return response;
})

export const deleteOrderReducer = createAsyncThunk("deleteCustomerOrderAPI/sendRequest", async (orderId) => {

    const response = await deleteOrder(orderId);

    if (response.status) {
        toast.success(response.message);

        setTimeout(() => { document.location.href = "/orders"; }, 1500)

    } else {
        toast.error(response.message);
    }
})

export const getAllOrdersPaginatedReducer = createAsyncThunk("getAllOrdersPaginatedAPI/sendRequest", async (filter) => {

    const response = await getAllOrdersPaginated(filter);

    return response;

})

export const updateOrderStatusReducer = createAsyncThunk("updateOrderAPI/sendRequest", async (orderData) => {

    const response = await updateOrderStatus(orderData);

    return response;

})


export const searchForOrderReducer = createAsyncThunk("searchForOrderAPI/sendRequest", async (filter) => {

    const response = await searchForOrder(filter);
    return response;

})


///// state
const initialState = {
    response: {
        _id: "",
        userId: null,
        financials: {
            currency: "USD",
            discount: 0,
            shippingCostInCents: 0,
            subtotalInCents: 0,
            totalAmountInCents: 0,
        },
        shippingInfo: {
            estimatedDeliveryDate: ""
        },
        status: "pending",
        paymentMethod: "Cash on delivery",
        createdAt: null,
        shippingAddress: {
            firstName: "",
            fullAddress: "",
            label: "",
            lastName: "",
            phoneNumber: " ",
        },
        items: []
    },
    minOrdersResponse: [],
    meta: {
        total: 0,
        page: 0,
        totalPages: 0,
        limit: 0
    },
    isLoading: false,
    error: false,

}

export const CartApiSlice = createSlice({
    name: "CartsApiRequest",
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder

            // getSpecificOrderForCustomerDetailedReducer cases
            .addCase(getSpecificOrderForCustomerDetailedReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(getSpecificOrderForCustomerDetailedReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;

                if (action.payload.status) {
                    currentState.response = action.payload.order;
                } else {
                    currentState.error = true;
                    toast.error(action.payload.message);
                }

            })
            .addCase(getSpecificOrderForCustomerDetailedReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                currentState.error = true;
                toast.error(action.payload.message);
            })

            // getAllOrdersPaginatedReducer cases
            .addCase(getAllOrdersPaginatedReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(getAllOrdersPaginatedReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;

                if (action.payload.status) {
                    currentState.minOrdersResponse = action.payload.data.data;
                    currentState.meta = action.payload.data.meta;

                } else {
                    currentState.error = true;
                    toast.error(action.payload.message);
                }
            })
            .addCase(getAllOrdersPaginatedReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                currentState.error = true;
                toast.error(action.payload.message);
            })


            // updateOrderStatusReducer cases
            .addCase(updateOrderStatusReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(updateOrderStatusReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;
                if (action.payload.status) {
                    currentState.response = action.payload.response;
                    toast.success(action.payload.message);
                } else {
                    toast.error(action.payload.message);
                }
            })
            .addCase(updateOrderStatusReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                currentState.error = true;
                toast.error(action.payload.message);
            })


            // searchForOrderReducer cases
            .addCase(searchForOrderReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(searchForOrderReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;

                if (action.payload.status) {
                    currentState.minOrdersResponse = [action.payload.response];
                    toast.success(action.payload.message);
                } else {
                    // currentState.error = true;
                    toast.error(action.payload.message);
                }
            })
            .addCase(searchForOrderReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                currentState.error = true;
                toast.error(action.payload.message);
            })


    }
});


export default CartApiSlice.reducer;


