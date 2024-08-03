import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getFilteredProducts } from '../API/ProductAPIFunctions';
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
        builder.addCase(getFilteredProductsReducer.pending, (state, action) => {
            state.isLoading = true;
        }).addCase(getFilteredProductsReducer.fulfilled, (state, action) => {
            state.isLoading = false;
            state.response = action.payload;
        }).addCase(getFilteredProductsReducer.rejected, (state, action) => {
            state.isLoading = false;
            state.error = true;
        })
    }
})


export default ProductsApiSlice.reducer;




//////////////////////////////


// Need to use the React-specific entry point to import createApi
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// // Define a service using a base URL and expected endpoints
// export const productApi = createApi({
//     reducerPath: 'productApi',
//     baseQuery: fetchBaseQuery({ baseUrl: `${import.meta.env.VITE_BASE_URL}/api/` }),
//     endpoints: (builder) => ({
//         getProductByName: builder.query({
//             query: (name) => `/${name}`,
//         }),
//     }),
// })

// // Export hooks for usage in functional components, which are
// // auto-generated based on the defined endpoints
// export const { useGetProductByNameQuery } = productApi