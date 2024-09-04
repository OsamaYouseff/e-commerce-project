import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getCustomerOrdersMinimized, getSpecificOrderForCustomerDetailed, createCustomerOrder, deleteOrder } from '../../API/OrdersAPIFunctions';
import { clearCart } from '../../API/CartAPIFunctions';
import toast from 'react-hot-toast';


export const getCustomerOrdersMinimizedReducer = createAsyncThunk("getCustomerOrdersMinimizedAPI/sendRequest", async () => {

    const response = await getCustomerOrdersMinimized();

    console.log("response.data : ", response);

    return response;
})

export const getSpecificOrderForCustomerDetailedReducer = createAsyncThunk("getSpecificOrderForCustomerDetailedAPI/sendRequest", async (orderId) => {

    const response = await getSpecificOrderForCustomerDetailed(orderId);

    // console.log(response)

    return response;
})

export const createCustomerOrderReducer = createAsyncThunk("createCustomerOrderAPI/sendRequest", async (requestData) => {

    const { orderData, clearCartAtEnd } = requestData;

    const response = await createCustomerOrder(orderData);

    if (response.status) {
        toast.success(response.message);

        if (clearCartAtEnd) {
            await clearCart()
            setTimeout(() => { document.location.reload(true) }, 1000)
        }

    } else {
        toast.error(response.message);
    }


    return response;
})

export const deleteOrderReducer = createAsyncThunk("deleteCustomerOrderAPI/sendRequest", async (orderId) => {

    const response = await deleteOrder(orderId);

    if (response.status) {
        toast.success(response.message);
        setTimeout(() => { document.location.href = "userInfo/orders"; }, 1500)

    } else {
        toast.error(response.message);
    }
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
    isLoading: false,
    error: false,

}

export const CartApiSlice = createSlice({
    name: "CartsApiRequest",
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // getCustomerOrdersMinimizedReducer cases
            .addCase(getCustomerOrdersMinimizedReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(getCustomerOrdersMinimizedReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;
                if (action.payload.status) {
                    currentState.minOrdersResponse = action.payload.response;
                } else {
                    currentState.error = true;
                    toast.error(action.payload.message);
                }
            })
            .addCase(getCustomerOrdersMinimizedReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                currentState.error = true;
                toast.error(action.payload.message);
            })


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


            // createCustomerOrderReducer cases
            .addCase(createCustomerOrderReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(createCustomerOrderReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;
                if (action.payload.status) {
                    // toast.success(action.payload.message);
                } else {
                    // toast.error(action.payload.message);
                    currentState.error = true;
                }
            })
            .addCase(createCustomerOrderReducer.rejected, (currentState) => {
                currentState.isLoading = false;
                currentState.error = true;
                // toast.error(action.payload.message);
            });
    }
});


export default CartApiSlice.reducer;


