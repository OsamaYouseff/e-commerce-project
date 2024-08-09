import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { addProductToWishlist, getCustomerWishlist, removeProductFromWishlist } from '../../API/WishlistAPIFunctions';


export const getCustomerWishlistReducer = createAsyncThunk("getCustomerWishlistAPI/sendRequest", async () => {
    const response = await getCustomerWishlist();

    // console.log("response.data : ", response);

    return response;
})

export const addProductToWishlistReducer = createAsyncThunk("addProductToWishlistAPI/sendRequest", async (addedProduct) => {

    const response = await addProductToWishlist(addedProduct);

    // console.log("ADD : ", response)
    return response;
})

export const removeProductFromWishlistReducer = createAsyncThunk("removeProductFromWishlistAPI/sendRequest", async (removedProduct) => {

    const response = await removeProductFromWishlist(removedProduct);

    // console.log("REMOVE : ", response)

    return response;
})



///// state
const initialState = {
    response: {
        _id: null,
        userId: "",
        products: [],
    },
    isLoading: false,
    error: false,
    message: null,

}

export const WishlistApiSlice = createSlice({
    name: "WishlistsApiRequest",
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // getCustomerWishlistReducer cases
            .addCase(getCustomerWishlistReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(getCustomerWishlistReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;
                currentState.response = action.payload;
            })
            .addCase(getCustomerWishlistReducer.rejected, (currentState) => {
                currentState.isLoading = false;
                currentState.error = true;
                currentState.message = "Failed to Get Your wishlist.";

            })


            // addProductToWishlistReducer cases
            .addCase(addProductToWishlistReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(addProductToWishlistReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;

                if (action.payload.state)
                    currentState.response = action.payload.products;
                else
                    currentState.error = true;

                currentState.message = action.payload.message;

            })
            .addCase(addProductToWishlistReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                currentState.message = action.error.message;
                currentState.error = true;
            })


            // removeProductFromWishlistReducer cases
            .addCase(removeProductFromWishlistReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(removeProductFromWishlistReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;

                if (action.payload.state)
                    currentState.response = action.payload.products;
                else
                    currentState.error = true;

                currentState.message = action.payload.message;
            })
            .addCase(removeProductFromWishlistReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                currentState.message = action.error.message;
                currentState.error = true;
            });
    }
});


export default WishlistApiSlice.reducer;
