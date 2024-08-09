import { Box, Button, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

//// custom components
import FormAddressComponent from "./AddressFromComponent";

///// hooks
import { useState } from "react";

/// redux
import { GetUserInfo } from "../../../General/GeneralFunctions";
import { useDispatch } from "react-redux";
import CountriesComponent from "./CountriesComponent";
import { addNewCustomerAddressReducer } from "../../../redux/AddressSlice/ApiAddressSlice";

const AddAddressComponent = () => {
    const dispatch = useDispatch();
    let customerData = GetUserInfo();

    //// states
    const [formData, setFormData] = useState({
        userId: customerData._id,
        firstName: customerData?.firstname,
        lastName: customerData?.lastname,
        fullAddress: "",
        label: "",
        phoneNumber: "",
        isDefault: false,
    });
    //// handlers

    const handleAddAddress = async (e) => {
        e.preventDefault();
        let addressData = {
            ...formData,
            phoneNumber: `+${phoneCode} ${formData.phoneNumber}`,
            fullAddress: `${country},${formData.fullAddress}`,
        };

        dispatch(addNewCustomerAddressReducer(addressData));
    };

    const handelFormData = (key, value) => {
        const updatedFormData = {
            ...formData,
            [key]: value,
        };

        setFormData(updatedFormData);
    };

    const [country, setCountry] = useState("Egypt");
    const [phoneCode, setPhoneCode] = useState("20");
    const handleChangeCountry = (newValue) => {
        setCountry(newValue);
    };
    const handleChangePhoneCode = (newValue) => {
        setPhoneCode(newValue);
    };

    return (
        <Stack
            sx={{ minWidth: "67vw", p: 1, px: 2, flex: 1, overflowX: "hidden" }}
        >
            <Box sx={{ mb: 6 }}>
                <Link to="/userInfo/address">
                    <Button
                        size="small"
                        sx={{ fontWeight: "bolder", mb: 1 }}
                        variant="outlined"
                    >
                        <ArrowBackIosIcon />
                        Back to addresses
                    </Button>
                </Link>
                <Typography
                    variant="h4"
                    sx={{
                        mb: 1,
                        fontSize: { xs: "22px", md: "30px" },
                        fontWeight: "bolder",
                    }}
                >
                    Add new address
                </Typography>
                <Typography variant="body" sx={{ fontSize: "15px" }}>
                    Enter your address and contact details so we can deliver to
                    you quickly and efficiently
                </Typography>
            </Box>
            {/* Address Form */}
            <FormAddressComponent
                formData={formData}
                phoneCode={phoneCode}
                handelFormData={handelFormData}
            >
                <CountriesComponent
                    country={country}
                    handleChangeCountry={handleChangeCountry}
                    handleChangePhoneCode={handleChangePhoneCode}
                />
            </FormAddressComponent>
            <Button
                onClick={handleAddAddress}
                type="submit"
                fullWidth
                variant="contained"
                // disabled={!isDataChanged}
                sx={{
                    mt: 3,
                    mb: 2,
                    fontWeight: "bolder",
                    width: { xs: "100%", md: "200px" },
                }}
            >
                Add Address
            </Button>
            {/*== Address Form ==*/}
        </Stack>
    );
};

export default AddAddressComponent;
