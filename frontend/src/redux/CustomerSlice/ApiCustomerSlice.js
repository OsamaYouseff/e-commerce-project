import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { changeCustomerPassword, customerLogin, deleteCustomerAccount, registerACustomer, updateCustomerAccount } from '../../API/CustomerAPIFunctions';
import { GetMessagesFromObject, GoHome, ResetLocalStorage } from '../../General/GeneralFunctions';
import { createCustomerCart } from '../../API/CartAPIFunctions';
import { createCustomerWishlist } from '../../API/WishlistAPIFunctions';
import toast from 'react-hot-toast';



export const customerLoginReducer = createAsyncThunk("customerLoginAPI/sendRequest", async (data) => {

    const { rememberMe, ...formFields } = data;

    const response = await customerLogin(formFields, rememberMe);

    return response;

})

export const registerACustomerReducer = createAsyncThunk("registerACustomerAPI/sendRequest", async (formData) => {

    const response = await registerACustomer(formData);

    // console.log("response : ", response);

    if (response.status) {
        await createCustomerCart();
        await createCustomerWishlist();
    }

    return response;

})

export const updateCustomerAccountReducer = createAsyncThunk("updateCustomerAccountAPI/sendRequest", async (formData) => {

    const response = await updateCustomerAccount(formData);

    // console.log(response.message)

    return response;

})

export const logoutCustomerAccountReducer = createAsyncThunk("logoutCustomerAccountAPI/sendRequest", async () => {

    ResetLocalStorage();
    return true;
})

export const changePasswordReducer = createAsyncThunk("ChangeCustomerPasswordAPI/sendRequest", async (formData) => {

    const response = await changeCustomerPassword(formData);

    // console.log("status :", response.status);
    // console.log("Message :", response.message);

    return response;
})

export const deleteCustomerAccountReducer = createAsyncThunk("DeleteCustomerAccountAPI/sendRequest", async () => {
    const response = await deleteCustomerAccount();

    // console.log("status :", response.status);
    // console.log("Message :", response.message);

    return response;
})


///// state
const initialState = {
    response: null,     ///////////////////////////// make sure to make it an object to avoid Error ////////////////////////////
    isLoading: false,
    error: false,
    message: null,
}

export const CustomerApiSlice = createSlice({
    name: "ProductsApiRequest",
    initialState: initialState,

    reducers: {},

    extraReducers(builder) {
        builder

            .addCase(customerLoginReducer.pending, (currentState) => {
                currentState.isLoading = true;
            }).addCase(customerLoginReducer.fulfilled, (currentState, action) => {

                currentState.isLoading = false;

                // console.log("payload : ", action.payload);

                if (action.payload.status) {
                    // toast.success("Login successfully ,Welcome 😀");
                    GoHome();
                }
                else {
                    currentState.error = true;
                    toast.error(action.payload.message);
                }



            }).addCase(customerLoginReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                toast.error(action.payload.message);
                currentState.error = true;
            })

            //// register a customer
            .addCase(registerACustomerReducer.pending, (currentState) => {
                currentState.isLoading = true;
            }).addCase(registerACustomerReducer.fulfilled, (currentState, action) => {

                currentState.isLoading = false;
                if (action.payload.status) {
                    // toast.success("Registered successfully ,Welcome 😀");
                    GoHome();
                }
                else {
                    currentState.error = true;
                    toast.error(GetMessagesFromObject(action.payload.message));
                }

            }).addCase(registerACustomerReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                toast.error(GetMessagesFromObject(action.payload.message));
                currentState.error = true;

            })

            ///// update customer account
            .addCase(updateCustomerAccountReducer.pending, (currentState) => {
                currentState.isLoading = true;
            }).addCase(updateCustomerAccountReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;
                if (action.payload.status) {
                    toast.success("Your account updated successfully 😀");

                    setTimeout(() => {
                        window.location.reload();
                    }, 1000)
                }
                else {
                    currentState.error = true;
                    toast.error(action.payload.message);
                }

            }).addCase(updateCustomerAccountReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                currentState.error = true;
                toast.error(action.payload.message);
            })

            ///// change customer's password
            .addCase(changePasswordReducer.pending, (currentState) => {
                currentState.isLoading = true;
            }).addCase(changePasswordReducer.fulfilled, (currentState, action) => {

                currentState.isLoading = false;
                if (action.payload.status) {
                    toast.success("Password changed successfully 😀");
                }
                else {
                    currentState.error = true;
                    toast.error(action.payload.message);
                }

            }).addCase(changePasswordReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                currentState.error = true;
                toast.error(action.payload.message);
            })


            ////// delete customer account
            .addCase(deleteCustomerAccountReducer.pending, (currentState) => {
                currentState.isLoading = true;
            }).addCase(deleteCustomerAccountReducer.fulfilled, (currentState, action) => {
                ResetLocalStorage();

                currentState.isLoading = false;
                if (action.payload.status) {
                    toast.success("Your account deleted successfully 😑");

                    setTimeout(() => {
                        window.location.reload();
                    }, 1000)
                }
                else {
                    currentState.error = true;
                    toast.error(action.payload.message);
                }

            }).addCase(deleteCustomerAccountReducer.rejected, (currentState, action) => {
                currentState.error = true;
                toast.error(action.payload.message);
            })
    }
})


export default CustomerApiSlice.reducer;