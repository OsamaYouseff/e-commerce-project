import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { addProductToWishlist, getCustomerWishlist, removeProductFromWishlist } from '../../API/WishlistAPIFunctions';
import toast from 'react-hot-toast';


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

                if (action.payload.status) {
                    currentState.response = action.payload.response;
                } else {
                    currentState.error = true;
                    toast.error(action.payload.message);
                }
            })
            .addCase(getCustomerWishlistReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                currentState.error = true;
                toast.error(action.payload.message);
            })


            // addProductToWishlistReducer cases
            .addCase(addProductToWishlistReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(addProductToWishlistReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;

                if (action.payload.status) {
                    toast.success(action.payload.message);
                    currentState.response = action.payload.products;
                }
                else {
                    currentState.error = true;
                    toast.error(action.payload.message);
                }

                currentState.message = action.payload.message;

            })
            .addCase(addProductToWishlistReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                currentState.error = true;
                toast.error(action.payload.message);
            })


            // removeProductFromWishlistReducer cases
            .addCase(removeProductFromWishlistReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(removeProductFromWishlistReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;

                if (action.payload.status) {
                    toast.success(action.payload.message);
                    currentState.response = action.payload.products;
                }
                else {
                    currentState.error = true;
                    toast.error(action.payload.message);
                }

            })
            .addCase(removeProductFromWishlistReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                currentState.error = true;
                toast.error(action.payload.message);
            });
    }
});


export default WishlistApiSlice.reducer;
