import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getFilteredProducts } from '../../API/ProductAPIFunctions';
// import axios from 'axios'

export const getFilteredProductsReducer = createAsyncThunk("getFilteredProductsAPI/sendRequest", async (filter = "") => {
    //const response = await axios.get("https://fakestoreapi.com/products");

    const response = await getFilteredProducts(filter);

    return response.data;

})

///// state
const initialState = {
    response: null,           ///////////////////////////// make sure to make it an object to avoid Error ////////////////////////////
    isLoading: false,
    error: false,
}

export const ProductsApiSlice = createSlice({
    name: "ProductsApiRequest",
    initialState: initialState,

    reducers: {},

    extraReducers(builder) {
        builder.addCase(getFilteredProductsReducer.pending, (state) => {
            state.isLoading = true;
        }).addCase(getFilteredProductsReducer.fulfilled, (state, action) => {
            state.isLoading = false;
            state.response = action.payload;
        }).addCase(getFilteredProductsReducer.rejected, (state) => {
            state.isLoading = false;
            state.error = true;
        })
    }
})

export default ProductsApiSlice.reducer;
