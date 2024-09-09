import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { addUpdateProductInCart, getCustomerCart, removeProductFromCart } from '../../API/CartAPIFunctions';
import toast from 'react-hot-toast';


export const getCustomerCartReducer = createAsyncThunk("getCustomerCartAPI/sendRequest", async () => {
    const response = await getCustomerCart();

    // console.log("response.data : ", response);

    return response;
})

export const addUpdateProductInCartReducer = createAsyncThunk("addUpdateProductToCartAPI/sendRequest", async (addedProduct) => {

    const response = await addUpdateProductInCart(addedProduct);

    // console.log(response)

    return response;
})

export const removeProductFromCartReducer = createAsyncThunk("removeProductFromCartAPI/sendRequest", async (removedProduct) => {

    const response = await removeProductFromCart(removedProduct);

    // console.log(response)

    return response;
})



///// state
const initialState = {
    response: {
        _id: null,
        userId: "",
        products: [],
        totalPrice: 0
    },
    isLoading: false,
    error: false

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
                if (action.payload.status) {
                    currentState.response = action.payload.response;
                } else {
                    currentState.error = true;
                    toast.error(action.payload.message);
                }
            })
            .addCase(getCustomerCartReducer.rejected, (currentState) => {
                currentState.isLoading = false;
                toast.error("Failed to get your cart items😢");
                currentState.error = true;
            })


            // addUpdateProductInCartReducer cases
            .addCase(addUpdateProductInCartReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(addUpdateProductInCartReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;
                if (action.payload.status) {
                    currentState.response = action.payload.response; // You may want to update the products array or other fields accordingly
                    toast.success(action.payload.message);
                } else {
                    toast.error("Failed to add/update your product to cart😢");
                }
            })
            .addCase(addUpdateProductInCartReducer.rejected, (currentState) => {
                currentState.isLoading = false;
                toast.error("Failed to add/update your product to cart😢");
                currentState.error = true;
            })


            // removeProductFromCartReducer cases
            .addCase(removeProductFromCartReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(removeProductFromCartReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;
                if (action.payload.status) {
                    currentState.response = action.payload.response
                    toast.success(action.payload.message);
                } else {
                    toast.error("Failed to remove your product from cart😢");
                    // currentState.error = true;
                }
            })
            .addCase(removeProductFromCartReducer.rejected, (currentState) => {
                currentState.isLoading = false;
                toast.error("Failed to remove your product from cart😢");
                // currentState.error = true;
            });
    }
});


export default CartApiSlice.reducer;
