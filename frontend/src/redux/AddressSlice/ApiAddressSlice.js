import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    deleteCustomerAddress, getCustomerAddresses, getCustomerAddress, addNewCustomerAddress,
    updateCustomerAddress, setAddressDefault, getCustomerDefaultAddress
} from "../../API/AddressAPIFunctions";
import toast from "react-hot-toast";

// import axios from 'axios'

export const getCustomerAddressesReducer = createAsyncThunk("getCustomerAddressesAPI/sendRequest", async () => {
    const response = await getCustomerAddresses();

    // console.log("########### : ", response);

    return response;
}
);

export const deleteCustomerAddressReducer = createAsyncThunk(
    "deleteCustomerAddressAPI/sendRequest",
    async (addressId) => {
        const response = await deleteCustomerAddress(addressId);

        // console.log(response)

        // console.log("########### : ", response.data.updatedAddresses
        //     , response.data.message);
        return response;

    }
);

export const getCustomerAddressReducer = createAsyncThunk(
    "getCustomerAddressAPI/sendRequest",
    async (addressId) => {

        const response = await getCustomerAddress(addressId);

        // console.log("%%%%%%%%%%%% : ", response)

        return response;
    }
);

export const getCustomerDefaultAddressReducer = createAsyncThunk("getCustomerDefaultAddressAPI/sendRequest", async () => {
    const response = await getCustomerDefaultAddress();

    // console.log("%%%%%%%%%%%% : ", response)

    return response;
}
);

export const addNewCustomerAddressReducer = createAsyncThunk("addNewCustomerAddressAPI/sendRequest", async (addressData) => {
    const response = await addNewCustomerAddress(addressData);

    if (response.status) history.back();

    return response;
}
);

export const updateCustomerAddressReducer = createAsyncThunk("updateCustomerAddressAPI/sendRequest", async (addressData) => {
    const { updatedAddressData, addressId } = addressData;

    const response = await updateCustomerAddress(updatedAddressData, addressId);

    // alert(response.message);

    // if (response.status)
    //     history.back()

    return response;
}
);

export const setDefaultAddressReducer = createAsyncThunk(
    "setDefaultAddressAPI/sendRequest",
    async (addressId) => {
        const response = await setAddressDefault(addressId);

        // if (!response.status) {
        //     alert(response.message);
        // }
        // console.log(response)

        return response;
    }
);

///// state
const initialState = {
    response: [], ///////////////////////////// make sure to make it an object to avoid Error ////////////////////////////
    singleAddressResponse: {},
    isLoading: false,
    error: false,
};

export const AddressApiSlice = createSlice({
    name: "AddressApiRequest",
    initialState: initialState,

    reducers: {},

    extraReducers(builder) {
        builder
            //// get customer address
            .addCase(getCustomerAddressesReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(getCustomerAddressesReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;
                currentState.response = action.payload;
            })
            .addCase(getCustomerAddressesReducer.rejected, (currentState) => {
                currentState.isLoading = false;
                currentState.error = true;
            })

            //// delete customer address
            .addCase(deleteCustomerAddressReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(deleteCustomerAddressReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;
                if (action.payload.status) {
                    currentState.response = action.payload.updatedAddresses;
                    toast.success(action.payload.message);
                } else {
                    currentState.error = true;
                    toast.error("Failed to delete this address😢");
                }
            }
            )
            .addCase(deleteCustomerAddressReducer.rejected, (currentState) => {
                currentState.isLoading = false;
                currentState.error = true;
            })

            //// get customer address
            .addCase(getCustomerAddressReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(getCustomerAddressReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;

                if (action.payload.status) {
                    currentState.singleAddressResponse = action.payload.address;
                    toast.success(action.payload.message);
                } else {
                    toast.error("Failed to get address or address not found");
                    // currentState.error = true;
                }
            })
            .addCase(getCustomerAddressReducer.rejected, (currentState) => {
                currentState.isLoading = false;
                toast.error("Failed to get address or address not found");
                // currentState.error = true;
            })

            //// get customer default address
            .addCase(getCustomerDefaultAddressReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(getCustomerDefaultAddressReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;

                if (action.payload.status) {
                    currentState.singleAddressResponse = action.payload.defaultAddress;
                    // toast.success(action.payload.message);
                } else {
                    currentState.error = true;
                    toast.error(action.payload.message);
                }
            })
            .addCase(getCustomerDefaultAddressReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                toast.error(action.payload.message);
                currentState.error = true;
            })

            //// add new customer address
            .addCase(addNewCustomerAddressReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(addNewCustomerAddressReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;

                if (action.payload.status) {
                    toast.success(action.payload.message);
                } else {
                    currentState.error = true;
                    toast.error(action.payload.message);
                }
            }
            )
            .addCase(addNewCustomerAddressReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                toast.error(action.payload.message);
                currentState.error = true;
            })


            //// update  customer address
            .addCase(updateCustomerAddressReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(updateCustomerAddressReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;

                if (action.payload.status) {
                    toast.success(action.payload.message);
                } else {
                    currentState.error = true;
                    toast.error(action.payload.message);
                }
            }
            )
            .addCase(updateCustomerAddressReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                toast.error(action.payload.message);
                currentState.error = true;
            })


            //// set default address
            .addCase(setDefaultAddressReducer.pending, (currentState) => {
                currentState.isLoading = true;
            })
            .addCase(setDefaultAddressReducer.fulfilled, (currentState, action) => {
                currentState.isLoading = false;

                if (action.payload.status) {
                    toast.success(action.payload.message);
                    currentState.response = action.payload.updatedAddresses;
                } else {
                    currentState.error = true;
                    toast.error(action.payload.message);
                }

            })
            .addCase(setDefaultAddressReducer.rejected, (currentState, action) => {
                currentState.isLoading = false;
                toast.error(action.payload.message);
                currentState.error = true;
            });
    },
});

export default AddressApiSlice.reducer;
