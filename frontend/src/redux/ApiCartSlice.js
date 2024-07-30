import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getCustomerCart } from '../API/CartAPIFunctions';

export const getCustomerCartReducer = createAsyncThunk("getCartsAPI/sendRequest", async () => {
    const response = await getCustomerCart();

    // console.log("response.data : ", response);
    return response;
})

///// state
const initialState = {
    response: {
        _id: "",
        userId: "",
        products: [],
        totalPrice: {
            "$numberDecimal": 0
        }
    },
    isLoading: false,
}





export const CartApiSlice = createSlice({
    name: "CartsApiRequest",
    initialState: initialState,

    reducers: {},

    extraReducers(builder) {
        builder.addCase(getCustomerCartReducer.pending, (state, action) => {
            state.isLoading = true;
        }).addCase(getCustomerCartReducer.fulfilled, (state, action) => {
            state.isLoading = false;
            state.response = action.payload;
        }).addCase(getCustomerCartReducer.rejected, (state, action) => {
            state.isLoading = false;
        })
    }
})


export default CartApiSlice.reducer;
