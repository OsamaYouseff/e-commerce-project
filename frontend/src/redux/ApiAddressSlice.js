import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { deleteCustomerAddress, getCustomerAddresses, getCustomerAddress, addNewCustomerAddress, updateCustomerAddress } from '../API/AddressAPIFunctions'
import { GoHome } from '../General/GeneralFunctions';
// import axios from 'axios'

export const getCustomerAddressesReducer = createAsyncThunk("getCustomerAddressesAPI/sendRequest", async () => {

    const response = await getCustomerAddresses();

    // console.log("########### : ", response);

    return response;

})
export const deleteCustomerAddressReducer = createAsyncThunk("deleteCustomerAddressAPI/sendRequest", async (addressId) => {

    const response = await deleteCustomerAddress(addressId);

    // console.log("########### : ", response.data.updatedAddresses
    //     , response.data.message);

    return {
        addresses: response.data.updatedAddresses
        , message: response.data.message
    };

})

export const getCustomerAddressReducer = createAsyncThunk("getCustomerAddressAPI/sendRequest", async (addressId) => {

    const response = await getCustomerAddress(addressId);

    // console.log("%%%%%%%%%%%% : ", response)

    return response;

})

export const addNewCustomerAddressReducer = createAsyncThunk("addNewCustomerAddressAPI/sendRequest", async (addressData) => {

    const response = await addNewCustomerAddress(addressData);

    alert(response.message);

    if (response.state)
        history.back()


    return response;

})

export const updateCustomerAddressReducer = createAsyncThunk("updateCustomerAddressAPI/sendRequest", async (addressData) => {

    const { updatedAddressData, addressId } = addressData;

    const response = await updateCustomerAddress(updatedAddressData, addressId);

    alert(response.message);

    // if (response.state)
    //     history.back()


    return response;

})

///// state
const initialState = {
    response: null,           ///////////////////////////// make sure to make it an object to avoid Error ////////////////////////////
    isLoading: false,
    error: false,
    message: null,
}

export const AddressApiSlice = createSlice({
    name: "AddressApiRequest",
    initialState: initialState,

    reducers: {},

    extraReducers(builder) {
        builder
            //// get customer address
            .addCase(getCustomerAddressesReducer.pending, (state) => {
                state.isLoading = true;
            }).addCase(getCustomerAddressesReducer.fulfilled, (state, action) => {
                state.isLoading = false;
                state.response = action.payload;
            }).addCase(getCustomerAddressesReducer.rejected, (state) => {
                state.isLoading = false;
                state.error = true;
            })


            //// delete customer address
            .addCase(deleteCustomerAddressReducer.pending, (state) => {
                state.isLoading = true;
            }).addCase(deleteCustomerAddressReducer.fulfilled, (state, action) => {
                state.isLoading = false;
                state.response = action.payload.addresses;
                state.message = action.payload.message;
            }).addCase(deleteCustomerAddressReducer.rejected, (state) => {
                state.isLoading = false;
                state.error = true;
            })

            //// get customer address
            .addCase(getCustomerAddressReducer.pending, (state) => {
                state.isLoading = true;
            }).addCase(getCustomerAddressReducer.fulfilled, (state, action) => {
                state.isLoading = false;
                state.response = action.payload[0];
            }).addCase(getCustomerAddressReducer.rejected, (state) => {
                state.isLoading = false;
                state.error = true;
            })


            //// add new customer address
            .addCase(addNewCustomerAddressReducer.pending, (state) => {
                state.isLoading = true;
            }).addCase(addNewCustomerAddressReducer.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action.payload.message;
                state.error = action.payload.state;
            }).addCase(addNewCustomerAddressReducer.rejected, (state) => {
                state.isLoading = false;
                state.error = true;
            })
    }
})

export default AddressApiSlice.reducer;
