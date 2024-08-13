import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getCustomerOrdersMinimized, getSpecificOrderForCustomerDetailed, createCustomerOrder } from '../../API/OrdersAPIFunctions';
import { clearCart } from '../../API/CartAPIFunctions';


export const getCustomerOrdersMinimizedReducer = createAsyncThunk("getCustomerOrdersMinimizedAPI/sendRequest", async () => {

    const response = await getCustomerOrdersMinimized();

    // console.log("response.data : ", response);

    return response;
})

export const getSpecificOrderForCustomerDetailedReducer = createAsyncThunk("getSpecificOrderForCustomerDetailedAPI/sendRequest", async (orderId) => {

    const response = await getSpecificOrderForCustomerDetailed(orderId);

    // console.log(response)

    return response;
})

export const createCustomerOrderReducer = createAsyncThunk("createCustomerOrderAPI/sendRequest", async (orderData) => {

    const response = await createCustomerOrder(orderData);

    console.log(response)

    if (response.status) {

        await clearCart()
        alert(response.message);

        document.location.reload(true);
    } else {
        alert(response.message);
    }


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
    isLoading: false,
    error: false,
    message: null,

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
                currentState.minOrdersResponse = action.payload;
            })
            .addCase(getCustomerOrdersMinimizedReducer.rejected, (currentState) => {
                currentState.isLoading = false;
                currentState.error = true;
            })


            // getSpecificOrderForCustomerDetailedReducer cases
            .addCase(getSpecificOrderForCustomerDetailedReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(getSpecificOrderForCustomerDetailedReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;

                if (action.payload.status) currentState.response = action.payload.order;
                else currentState.error = true;

                currentState.message = action.payload.message;

            })
            .addCase(getSpecificOrderForCustomerDetailedReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                currentState.message = action.error.message;
                currentState.error = true;
            })


            // createCustomerOrderReducer cases
            .addCase(createCustomerOrderReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(createCustomerOrderReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;
                currentState.message = action.payload.message;
            })
            .addCase(createCustomerOrderReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                currentState.message = action.payload.message;
                currentState.error = true;
            });
    }
});


export default CartApiSlice.reducer;


