import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getFilteredProducts, getAllProductsPaginated, getAProduct, addNewProduct, editProduct, deleteProduct, toggleDisableProduct } from '../../API/ProductAPIFunctions';
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

export const addNewProductReducer = createAsyncThunk("addNewProductAPI/sendRequest", async (productData) => {

    const response = await addNewProduct(productData);

    return response;

})

export const editProductReducer = createAsyncThunk("editProductAPI/sendRequest", async (productData) => {

    const response = await editProduct(productData);

    return response;

})

export const deleteProductReducer = createAsyncThunk("deleteProductAPI/sendRequest", async (productId) => {

    const response = await deleteProduct(productId);

    return response;

})

export const toggleDisableProductReducer = createAsyncThunk("toggleDisableProductAPI/sendRequest", async (productId) => {

    const response = await toggleDisableProduct(productId);

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
        "_id": null,
        "title": "",
        "desc": "",
        "img": "",
        "categories": [],
        "size": "",
        "color": "",
        "price": 0,
        "rating": 0,
        "amount": 1,
        "isDeleted": false,
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


            ///// addNewProductReducer
            .addCase(addNewProductReducer.pending, (state) => {
                state.isLoading = true;
            }).addCase(addNewProductReducer.fulfilled, (state, action) => {
                state.isLoading = false;

                if (action.payload.status) {
                    toast.success(action.payload.message);
                    setTimeout(() => {
                        window.location.href = "/products";
                    }, 1000)
                } else {
                    state.error = true;
                    toast.error(action.payload.message);
                }

            }).addCase(addNewProductReducer.rejected, (state, action) => {
                state.isLoading = false;
                state.error = true;
                toast.error(action.payload.message);
            })


            ///// editProductReducer
            .addCase(editProductReducer.pending, (state) => {
                state.isLoading = true;
            }).addCase(editProductReducer.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.status) {
                    state.singleProduct = action.payload.data;
                    toast.success(action.payload.message);
                } else {
                    state.error = true;
                    toast.error(action.payload.message);
                }

            }).addCase(editProductReducer.rejected, (state, action) => {
                state.isLoading = false;
                state.error = true;
                toast.error(action.payload.message);
            })

            ///// deleteProductReducer
            .addCase(deleteProductReducer.pending, (state) => {
                state.isLoading = true;
            }).addCase(deleteProductReducer.fulfilled, (state, action) => {
                state.isLoading = false;

                if (action.payload.status) {
                    toast.success(action.payload.message);
                    setTimeout(() => {
                        window.location.href = "/products";
                    }, 1000)
                }
                else {
                    state.error = true;
                    toast.error(action.payload.message);
                }

            }).addCase(deleteProductReducer.rejected, (state, action) => {
                state.isLoading = false;
                state.error = true;
                toast.error(action.payload.message);
            })

            ///// toggleDisableProductReducer
            .addCase(toggleDisableProductReducer.pending, (state) => {
                state.isLoading = true;
            }).addCase(toggleDisableProductReducer.fulfilled, (state, action) => {
                state.isLoading = false;

                if (action.payload.status) {
                    toast.success(action.payload.message);
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000)
                }
                else {
                    state.error = true;
                    toast.error(action.payload.message);
                }
            }).addCase(toggleDisableProductReducer.rejected, (state, action) => {
                state.isLoading = false;
                state.error = true;
                toast.error(action.payload.message);
            })


    }
})

export default ProductsApiSlice.reducer;
