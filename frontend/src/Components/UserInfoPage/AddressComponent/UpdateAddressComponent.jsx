/* eslint-disable no-unused-vars */
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

//// custom components
import FormAddressComponent from "./AddressFromComponent";
import toast from 'react-hot-toast';


///// hooks
import { useEffect, useState } from "react";

/// redux
import { CheckDuplicated, GetAddressInfo, IsUserLoggedIn } from "../../../General/GeneralFunctions";
import { useDispatch, useSelector } from "react-redux";
import { getCustomerAddressReducer, updateCustomerAddressReducer } from "../../../redux/AddressSlice/ApiAddressSlice";
import CountriesComponent from "./CountriesComponent";

const UpdateAddressComponent = () => {
    // const { elementId } = useParams();
    const dispatch = useDispatch();

    let addressData = GetAddressInfo();

    const fullPhone = addressData?.phoneNumber?.split(" ");
    const code = fullPhone[0];
    const number = fullPhone[1];
    const fullAddress = addressData?.fullAddress?.split(",");

    //// states
    const [formData, setFormData] = useState({
        userId: addressData?.userId,
        firstName: addressData?.firstName,
        lastName: addressData?.lastName,
        fullAddress: fullAddress[1],
        label: addressData?.label,
        phoneNumber: number,
        isDefault: addressData?.isDefault,
    });

    const [isDataChanged, setIsDataChanged] = useState(false);

    //// handlers
    const checkDataChanged = (formData) => {

        let updatedAddressData = {
            ...formData,
            phoneNumber: `+${phoneCode} ${formData.phoneNumber}`,
            fullAddress: `${country},${formData.fullAddress}`,
        };

        if (CheckDuplicated(updatedAddressData, addressData)) setIsDataChanged(false);
        else setIsDataChanged(true);
    };

    const handleUpdateAddress = async (e) => {
        e.preventDefault();

        let updatedAddressData = {
            ...formData,
            phoneNumber: `+${phoneCode} ${formData.phoneNumber}`,
            fullAddress: `${country},${formData.fullAddress}`,
        };

        if (IsUserLoggedIn()) {
            dispatch(
                updateCustomerAddressReducer({
                    updatedAddressData,
                    addressId: addressData._id,
                })
            );
            setIsDataChanged(false);
        } else toast.error("Please log in or sign up with new account");
    };

    const handelFormData = (key, value) => {
        const updatedFormData = {
            ...formData,
            [key]: value,
        };
        setFormData(updatedFormData);
        checkDataChanged(updatedFormData);
    };

    const [country, setCountry] = useState(fullAddress[0]);
    const [phoneCode, setPhoneCode] = useState(code.slice(1));
    const handleChangeCountry = (newValue) => {
        setCountry(newValue);

        if (newValue === fullAddress[0])
            setIsDataChanged(false);
        else setIsDataChanged(true);

    };
    const handleChangePhoneCode = (newValue) => {
        setPhoneCode(newValue);
    };

    // useEffect(() => {
    //     // if (IsUserLoggedIn()) dispatch(getCustomerAddressReducer(addressId));
    //        else toast.error("Please log in or sign up with new account");

    // }, []);

    return (
        <Stack sx={{ minWidth: "67vw", p: 1, px: 2, flex: 1 }}>
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
                    Edit address
                </Typography>
                <Typography variant="body" sx={{ fontSize: "15px" }}>
                    Edit your address and contact details so we can deliver to
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
            {/*== Address Form ==*/}

            <Button
                onClick={handleUpdateAddress}
                type="submit"
                fullWidth
                variant="contained"
                disabled={!isDataChanged}
                sx={{
                    mt: 3,
                    mb: 2,
                    fontWeight: "bolder",
                    width: { xs: "100%", md: "200px" },
                }}
            >
                Update Address
            </Button>
        </Stack>
    );
};

export default UpdateAddressComponent;

