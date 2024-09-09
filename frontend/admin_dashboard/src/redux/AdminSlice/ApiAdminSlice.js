import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { adminLogin, changeAdminPassword, updateAdminAccount, deleteAdminAccount } from '../../API/AdminAPIFunctions.js';
import { GoLoginPage, ResetLocalStorage } from '../../General/GeneralFunctions.js';
import { GoHome } from '../../../../shared_files/General/GeneralFunctions.js';
import toast from 'react-hot-toast';

export const adminLoginReducer = createAsyncThunk("adminLoginAPI/sendRequest", async (data) => {

    const { rememberMe, ...formFields } = data;

    const response = await adminLogin(formFields, rememberMe);

    return response;

})

export const logoutAdminReducer = createAsyncThunk("logoutAdminAPI/sendRequest", async () => {
    ResetLocalStorage();
    return true;
})

export const updateAdminAccountReducer = createAsyncThunk("updateAdminAccountAPI/sendRequest", async (formData) => {

    const response = await updateAdminAccount(formData);

    // console.log(response.message)

    return response;

})

export const changePasswordReducer = createAsyncThunk("changeAdminPasswordAPI/sendRequest", async (formData) => {

    const response = await changeAdminPassword(formData);

    if (response.status) {
        setTimeout(() => {
            document.location.reload();
        }, 1000)
    }

    return response;
})

export const deleteAdminAccountReducer = createAsyncThunk("DeleteAdminAccountAPI/sendRequest", async () => {
    const response = await deleteAdminAccount();

    return response;
})



///// state
const initialState = {
    response: null,     ///////////////////////////// make sure to make it an object to avoid Error ////////////////////////////
    isLoading: false,
    error: false,
    message: null,
}

export const AdminApiSlice = createSlice({
    name: "ProductsApiRequest",
    initialState: initialState,

    reducers: {},

    extraReducers(builder) {
        builder


            //// login an admin
            .addCase(adminLoginReducer.pending, (currentState) => {
                currentState.isLoading = true;
            }).addCase(adminLoginReducer.fulfilled, (currentState, action) => {

                currentState.isLoading = false;

                console.log("payload : ", action.payload);

                if (action.payload.status) {
                    GoHome();
                }

                else {
                    currentState.error = true;
                    toast.error(action.payload.message);
                }

            }).addCase(adminLoginReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                toast.error(action.payload.message);
                currentState.error = true;
            })

            ///// updateAdminAccountReducer
            .addCase(updateAdminAccountReducer.pending, (currentState) => {
                currentState.isLoading = true;
            }).addCase(updateAdminAccountReducer.fulfilled, (currentState, action) => {
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

            }).addCase(updateAdminAccountReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                currentState.error = true;
                toast.error(action.payload.message);
            })

            ///// change admin's password
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

            ////// delete Admin account
            .addCase(deleteAdminAccountReducer.pending, (currentState) => {
                currentState.isLoading = true;
            }).addCase(deleteAdminAccountReducer.fulfilled, (currentState, action) => {
                ResetLocalStorage();

                currentState.isLoading = false;
                if (action.payload.status) {
                    toast.success("Your account deleted successfully 😑");

                    setTimeout(() => { GoLoginPage() }, 1000)
                }
                else {
                    currentState.error = true;
                    toast.error(action.payload.message);
                }
            }).addCase(deleteAdminAccountReducer.rejected, (currentState, action) => {
                currentState.error = true;
                toast.error(action.payload.message);
            })

    }
})


export default AdminApiSlice.reducer;