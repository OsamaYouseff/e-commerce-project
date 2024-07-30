import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { customerLogin, registerACustomer, updateCustomerAccount } from '../API/CustomerAPIFunctions';
import { GoHome, ResetLocalStorage } from '../General/GeneralFunctions';

export const customerLoginReducer = createAsyncThunk("customerLoginAPI/sendRequest", async (data) => {

    const { rememberMe, ...formFields } = data;

    const response = await customerLogin(formFields, rememberMe);

    if (response) {
        GoHome();
    }

    return response;

})

export const registerACustomerReducer = createAsyncThunk("registerACustomerAPI/sendRequest", async (formData) => {

    const response = await registerACustomer(formData);

    if (response) {
        GoHome();
    }

    return response;

})

export const updateCustomerAccountReducer = createAsyncThunk("updateCustomerAccountAPI/sendRequest", async (formData) => {

    const response = await updateCustomerAccount(formData);

    return response;

})

export const logoutCustomerAccountReducer = createAsyncThunk("logoutCustomerAccountAPI/sendRequest", async () => {

    ResetLocalStorage();
    return true;
})



///// state
const initialState = {
    response: null,     ///////////////////////////// make sure to make it an object to avoid Error ////////////////////////////
    isLoading: false,
}

export const CustomerApiSlice = createSlice({
    name: "ProductsApiRequest",
    initialState: initialState,

    reducers: {},

    extraReducers(builder) {
        builder.addCase(customerLoginReducer.pending, (state, action) => {
            state.isLoading = true;
        }).addCase(customerLoginReducer.fulfilled, (state, action) => {
            state.isLoading = false;
            state.response = action.payload;
            GoHome();
        }).addCase(customerLoginReducer.rejected, (state, action) => {
            state.isLoading = false;
        })
    }
})


export default CustomerApiSlice.reducer;