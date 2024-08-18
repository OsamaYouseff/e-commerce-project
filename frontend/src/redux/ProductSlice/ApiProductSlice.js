import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getFilteredProducts, getAllProductsPaginated } from '../../API/ProductAPIFunctions';
import toast from 'react-hot-toast';
// import axios from 'axios'

export const getFilteredProductsReducer = createAsyncThunk("getFilteredProductsAPI/sendRequest", async (filter = "") => {
    //const response = await axios.get("https://fakestoreapi.com/products");

    const response = await getFilteredProducts(filter);

    return response.data;

})

export const getAllProductsPaginatedReducer = createAsyncThunk("getAllProductsPaginatedAPI/sendRequest", async (filter) => {

    const response = await getAllProductsPaginated(filter);

    // console.log(response.response.data);

    return response.response.data;

})



///// state
const initialState = {
    response: [],           ///////////////////////////// make sure to make it an object to avoid Error ////////////////////////////
    meta: {
        total: 0,
        page: 0,
        totalPages: 0,
        limit: 0
    },
    isLoading: false,
    error: false,
}

export const ProductsApiSlice = createSlice({
    name: "ProductsApiRequest",
    initialState: initialState,

    reducers: {},

    extraReducers(builder) {

        builder

            ///// getFilteredProductsReducer
            .addCase(getFilteredProductsReducer.pending, (state) => {
                state.isLoading = true;
            }).addCase(getFilteredProductsReducer.fulfilled, (state, action) => {
                state.isLoading = false;

                if (action.payload.status) {
                    state.response = action.payload.data;
                } else {
                    toast.error(action.payload.message);
                    state.error = true;
                }

            }).addCase(getFilteredProductsReducer.rejected, (state) => {
                state.isLoading = false;
                state.error = true;
            })


            ///// getAllProductsPaginatedReducer
            .addCase(getAllProductsPaginatedReducer.pending, (state) => {
                state.isLoading = true;
            }).addCase(getAllProductsPaginatedReducer.fulfilled, (state, action) => {
                state.isLoading = false;
                state.response = action.payload.data;
                state.meta = action.payload.meta;
            }).addCase(getAllProductsPaginatedReducer.rejected, (state) => {
                state.isLoading = false;
                state.error = true;
            })
    }
})

export default ProductsApiSlice.reducer;
