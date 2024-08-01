import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { addUpdateProductInCart, getCustomerCart, removeProductToCart } from '../API/CartAPIFunctions';


export const getCustomerCartReducer = createAsyncThunk("getCartsAPI/sendRequest", async () => {
    const response = await getCustomerCart();
    // console.log("response.data : ", response);
    return response;
})


export const addUpdateProductInCartReducer = createAsyncThunk("addUpdateProductAPI/sendRequest", async (addedProduct) => {

    const response = await addUpdateProductInCart(addedProduct);

    // console.log(response)

    return response;
})

export const removeProductFromCartReducer = createAsyncThunk("removeProductAPI/sendRequest", async (removedProduct) => {

    const response = await removeProductToCart(removedProduct);

    // console.log(response)

    return response;
})



///// state
const initialState = {
    response: {
        _id: "",
        userId: "",
        products: [],
        totalPrice: 0
    },
    isLoading: false,
    actionType: null,
}

export const CartApiSlice = createSlice({
    name: "CartsApiRequest",
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // getCustomerCartReducer cases
            .addCase(getCustomerCartReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(getCustomerCartReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;
                currentState.response = action.payload;
                currentState.actionType = "getCustomerCartReducer";
            })
            .addCase(getCustomerCartReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                currentState.error = action.error.message;
            })

            // addUpdateProductInCartReducer cases
            .addCase(addUpdateProductInCartReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(addUpdateProductInCartReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;
                currentState.response = action.payload; // You may want to update the products array or other fields accordingly
                currentState.actionType = "addUpdateProductInCartReducer";

            })
            .addCase(addUpdateProductInCartReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                currentState.error = action.error.message;
            })

            // removeProductFromCartReducer cases
            .addCase(removeProductFromCartReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(removeProductFromCartReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;
                currentState.response = action.payload; // Update the response state as needed
                currentState.actionType = "removeProductFromCartReducer";
            })
            .addCase(removeProductFromCartReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                currentState.error = action.error.message;
            });
    }
});


export default CartApiSlice.reducer;
