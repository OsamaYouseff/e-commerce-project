import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getFilteredProducts, getAllProductsPaginated, getAProduct } from '../../API/ProductAPIFunctions';
import toast from 'react-hot-toast';
// import axios from 'axios'

export const getFilteredProductsReducer = createAsyncThunk("getFilteredProductsAPI/sendRequest", async (filter = "") => {
    //const response = await axios.get("https://fakestoreapi.com/products");

    const response = await getFilteredProducts(filter);

    return response.data;

})

export const getAllProductsPaginatedReducer = createAsyncThunk("getAllProductsPaginatedAPI/sendRequest", async (filter) => {

    const response = await getAllProductsPaginated(filter);

    // console.log(response);

    return response;

})


export const getAProductReducer = createAsyncThunk("getAProductAPI/sendRequest", async (productId) => {

    const response = await getAProduct(productId);

    // console.log(response.response);

    return response;

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
    singleProduct: {
        "_id": "",
        "title": "",
        "desc": "",
        "img": "",
        "categories": [],
        "size": "",
        "color": "",
        "price": 0,
        "rating": 0,
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

            }).addCase(getFilteredProductsReducer.rejected, (state, action) => {
                state.isLoading = false;
                state.error = true;
                toast.error(action.payload.message);

            })


            ///// getAllProductsPaginatedReducer
            .addCase(getAllProductsPaginatedReducer.pending, (state) => {
                state.isLoading = true;
            }).addCase(getAllProductsPaginatedReducer.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.status) {
                    state.response = action.payload.data.data;
                    state.meta = action.payload.data.meta;
                } else {
                    state.error = true;
                    toast.error(action.payload.message);
                }
            }).addCase(getAllProductsPaginatedReducer.rejected, (state, action) => {
                state.isLoading = false;
                state.error = true;
                toast.error(action.payload.message);

            })

            ///// getAProductReducer
            .addCase(getAProductReducer.pending, (state) => {
                state.isLoading = true;
            }).addCase(getAProductReducer.fulfilled, (state, action) => {
                state.isLoading = false;

                if (action.payload.status) {
                    state.singleProduct = action.payload.data;
                } else {
                    state.error = true;
                    toast.error(action.payload.message);
                }

            }).addCase(getAProductReducer.rejected, (state, action) => {
                state.isLoading = false;
                state.error = true;
                toast.error(action.payload.message);
            })
    }
})

export default ProductsApiSlice.reducer;
