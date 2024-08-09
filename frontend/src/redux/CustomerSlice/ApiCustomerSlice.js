import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { changeCustomerPassword, customerLogin, deleteCustomerAccount, registerACustomer, updateCustomerAccount } from '../../API/CustomerAPIFunctions';
import { GoHome, ResetLocalStorage } from '../../General/GeneralFunctions';

export const customerLoginReducer = createAsyncThunk("customerLoginAPI/sendRequest", async (data) => {

    const { rememberMe, ...formFields } = data;

    const response = await customerLogin(formFields, rememberMe);

    if (response.state) {
        GoHome();
    }

    return response;

})

export const registerACustomerReducer = createAsyncThunk("registerACustomerAPI/sendRequest", async (formData) => {

    const response = await registerACustomer(formData);

    console.log("response : ", response);

    if (response.state) {
        GoHome();
    }

    return response;

})

export const updateCustomerAccountReducer = createAsyncThunk("updateCustomerAccountAPI/sendRequest", async (formData) => {

    const response = await updateCustomerAccount(formData);

    console.log(response.message)

    return response;

})

export const logoutCustomerAccountReducer = createAsyncThunk("logoutCustomerAccountAPI/sendRequest", async () => {

    ResetLocalStorage();
    return true;
})

export const changePasswordReducer = createAsyncThunk("ChangeCustomerPasswordAPI/sendRequest", async (formData) => {

    const response = await changeCustomerPassword(formData);

    console.log("state :", response.state);
    console.log("Message :", response.message);

    return response;
})

export const deleteCustomerAccountReducer = createAsyncThunk("DeleteCustomerAccountAPI/sendRequest", async () => {
    const response = await deleteCustomerAccount();

    // console.log("state :", response.state);
    // console.log("Message :", response.message);

    return response;
})


///// state
const initialState = {
    response: null,     ///////////////////////////// make sure to make it an object to avoid Error ////////////////////////////
    isLoading: false,
    error: null,
    message: null,
}

export const CustomerApiSlice = createSlice({
    name: "ProductsApiRequest",
    initialState: initialState,

    reducers: {},

    extraReducers(builder) {
        builder.addCase(customerLoginReducer.pending, (currentState) => {
            currentState.isLoading = true;
        }).addCase(customerLoginReducer.fulfilled, (currentState, action) => {

            currentState.isLoading = false;
            currentState.message = action.payload.message;

            if (action.payload.state) currentState.error = false;
            else currentState.error = true;


        }).addCase(customerLoginReducer.rejected, (currentState, action) => {
            currentState.isLoading = false;
            currentState.error = action.payload.message;
        })

        //// register a customer
        builder.addCase(registerACustomerReducer.pending, (currentState) => {
            currentState.isLoading = true;
        }).addCase(registerACustomerReducer.fulfilled, (currentState, action) => {

            currentState.isLoading = false;
            currentState.message = action.payload.message;

            if (action.payload.state) currentState.error = false;
            else currentState.error = true;


        }).addCase(registerACustomerReducer.rejected, (currentState, action) => {
            currentState.isLoading = false;
            currentState.error = action.payload.message;
        })

        ///// update customer account
        builder.addCase(updateCustomerAccountReducer.pending, (currentState) => {
            currentState.isLoading = true;
        }).addCase(updateCustomerAccountReducer.fulfilled, (currentState, action) => {
            currentState.isLoading = false;
            currentState.message = action.payload.message;

            if (action.payload.state) document.location.reload();

            if (action.payload.state) currentState.error = false;
            else currentState.error = true;
        }).addCase(updateCustomerAccountReducer.rejected, (currentState, action) => {
            currentState.isLoading = false;
            currentState.error = action.payload.message;
        })

        ///// change customer's password
        builder.addCase(changePasswordReducer.pending, (currentState) => {
            currentState.isLoading = true;
        }).addCase(changePasswordReducer.fulfilled, (currentState, action) => {

            currentState.isLoading = false;
            currentState.message = action.payload.message;

            if (action.payload.state) currentState.error = false;
            else currentState.error = true;

        }).addCase(changePasswordReducer.rejected, (currentState, action) => {
            currentState.isLoading = false;
            currentState.error = action.payload.message;
        })


        ////// delete customer account
        builder.addCase(deleteCustomerAccountReducer.pending, (currentState) => {
            currentState.isLoading = true;
        }).addCase(deleteCustomerAccountReducer.fulfilled, (currentState, action) => {
            ResetLocalStorage();

            currentState.isLoading = false;
            currentState.message = action.payload.message;

            if (action.payload.state) currentState.error = false;
            else currentState.error = true;

        }).addCase(deleteCustomerAccountReducer.rejected, (currentState, action) => {
            currentState.isLoading = false;
            currentState.error = action.payload.message;
        })
    }
})


export default CustomerApiSlice.reducer;