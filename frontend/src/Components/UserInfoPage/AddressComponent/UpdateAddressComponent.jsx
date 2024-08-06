/* eslint-disable no-unused-vars */
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

//// custom components
import FormAddressComponent from "./AddressFromComponent";

///// hooks
import { useEffect, useState } from "react";

/// redux
import { GetAddressInfo } from "../../../General/GeneralFunctions";
import { useDispatch, useSelector } from "react-redux";
import {
    getCustomerAddressReducer,
    updateCustomerAddressReducer,
} from "../../../redux/ApiAddressSlice";
import CountriesComponent from "./CountriesComponent";

const UpdateAddressComponent = () => {
    // const { addressId } = useParams();
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

    ///// TODO : Return isDataChanged to false after doing your job
    const [isDataChanged, setIsDataChanged] = useState(false);

    //// handlers
    const checkDataChanged = (formData) => {
        // if (
        //     formData.userId === "" &&
        //     formData.firstName === "" &&
        //     formData.lastName === "" &&
        //     formData.fullAddress === "" &&
        //     formData.label === "" &&
        //     formData.phoneNumber === "" &&
        //     formData.isDefault === ""
        // ) {
        //     setIsDataChanged(false);
        // } else {
        //     setIsDataChanged(true);
        // }
    };

    const handleUpdateAddress = async (e) => {
        e.preventDefault();

        let updatedAddressData = {
            ...formData,
            phoneNumber: `+${phoneCode} ${formData.phoneNumber}`,
            fullAddress: `${country},${formData.fullAddress}`,
        };

        dispatch(
            updateCustomerAddressReducer({
                updatedAddressData,
                addressId: addressData._id,
            })
        );

        setIsDataChanged(false);
    };

    const handelFormData = (key, value) => {
        const updatedFormData = {
            ...formData,
            [key]: value,
        };
        setFormData(updatedFormData);
        // checkDataChanged(updatedFormData);
    };

    const [country, setCountry] = useState(fullAddress[0]);
    const [phoneCode, setPhoneCode] = useState(code.slice(1));
    const handleChangeCountry = (newValue) => {
        setCountry(newValue);
    };
    const handleChangePhoneCode = (newValue) => {
        setPhoneCode(newValue);
    };

    // useEffect(() => {
    //     // dispatch(getCustomerAddressReducer(addressId));
    // }, []);

    return (
        <Stack sx={{ minWidth: "67vw", p: 1, px: 2, flex: 1 }}>
            <Box sx={{ mb: 6 }}>
                <Link to="/userInfo/address">
                    <Button size="small" sx={{ fontWeight: "bolder", mb: 1 }}>
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
                // disabled={!isDataChanged}
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

{
    /* <Stack
                sx={{
                    gap: 2,
                    mb: 2,
                    width: "100%",
                    overflowY: "auto",
                    // maxHeight: { xs: "auto", md: "70vh", lg: "60vh" },
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: "flex-start",
                    justifyContent: "center",
                }}
            >
                
                <Box
                    component="form"
                    noValidate
                    sx={{
                        flexGrow: 1,
                        width: { xs: "100%", md: "50%" },
                        maxWidth: { xs: "100%", md: "50%" },
                        overflowX: "hidden",
                    }}
                >
                    <Typography variant="h6" mb={2}>
                        Location details
                    </Typography>

                    <CountriesComponent
                        country={country}
                        handleChangeCountry={handleChangeCountry}
                        handleChangePhoneCode={handleChangePhoneCode}
                    />

                    <Grid mt={1} container spacing={2}>
                        <TextFieldComponent
                            value={formData.fullAddress}
                            setFormData={handelFormData}
                            label="Full Address"
                            id="fullAddress"
                            type="text"
                            colWidth={12}
                            keyName="fullAddress"
                            placeholder="[City]-[Street Name]-[building Number]"
                        />
                    </Grid>

                    <FormControl sx={{ mb: 1 }}>
                        <FormLabel id="row-radio">
                            Address label (optional)
                        </FormLabel>
                        <RadioGroup
                            value={formData.label}
                            row
                            aria-labelledby="row-radio"
                            name="row-radio-buttons-group"
                            sx={{ pl: 2 }}
                        >
                            <FormControlLabel
                                value="Home"
                                control={<Radio />}
                                label="Home"
                                onClick={() => handelFormData("label", "Home")}
                            />
                            <FormControlLabel
                                value="Work"
                                control={<Radio />}
                                label="Work"
                                onClick={() => handelFormData("label", "Work")}
                            />
                        </RadioGroup>
                    </FormControl>

                    <FormControlLabel
                        sx={{ display: "block" }}
                        control={
                            <SwitchButton
                                defaultChecked={formData.isDefault}
                                sx={{ mr: 1 }}
                            />
                        }
                        onClick={() =>
                            handelFormData("isDefault", !formData.isDefault)
                        }
                        labelPlacement="start"
                        label="Set as default address"
                        // disabled
                        value={formData.isDefault}
                    />
                </Box>

                <Divider orientation="vertical" flexItem>
                    <Divider orientation="horizontal" flexItem></Divider>
                </Divider>

                <Box
                    component="form"
                    noValidate
                    sx={{
                        maxWidth: { xs: "100%", md: "50%" },
                        width: { xs: "100%", md: "50%" },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        minHeight: "100%",
                    }}
                >
                    <Typography variant="h6" mb={2}>
                        Your contact details
                    </Typography>

                    <Stack
                        className="flex-between"
                        sx={{
                            justifyContent: "space-between",
                            width: "100%",
                            gap: 2,
                        }}
                    >
                        <TextField
                            size="small"
                            sx={{
                                maxWidth: 90,
                                mb: 3,
                            }}
                            defaultValue={phoneCode}
                            mb={3}
                        />
                        <Box sx={{ flexGrow: 1 }}>
                            <TextFieldComponent
                                value={formData.phoneNumber}
                                setFormData={handelFormData}
                                label="phone Number"
                                id="phoneNumber"
                                type="text"
                                colWidth={12}
                                keyName="phoneNumber"
                            />
                        </Box>
                    </Stack>
                    <Grid container>
                        <TextFieldComponent
                            value={formData.firstName}
                            setFormData={handelFormData}
                            label="First Name"
                            id="firstname"
                            type="text"
                            colWidth={12}
                            keyName="firstname"
                        />
                        <TextFieldComponent
                            value={formData.lastName}
                            setFormData={handelFormData}
                            label="Last Name"
                            id="lastname"
                            type="text"
                            colWidth={12}
                            keyName="lastname"
                        />
                    </Grid>
                </Box>
            </Stack> */
}
