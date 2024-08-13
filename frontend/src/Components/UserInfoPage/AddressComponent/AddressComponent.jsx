/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Button, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

//// custom component
import LoaderComponent from "../../GenericComponents/LoaderComponent/LoaderComponent";
import AddressCard from "./AddressCard";

//// hooks
import { useEffect } from "react";

//// redux
import { useSelector, useDispatch } from "react-redux";
import { getCustomerAddressesReducer } from "../../../redux/AddressSlice/ApiAddressSlice.js";
import { IsUserLoggedIn } from "../../../General/GeneralFunctions.js";


const AddressComponent = () => {
    const dispatch = useDispatch();
    const customerAddresses = useSelector(
        (state) => state.AddressesApiRequest.response
    );
    const isLoading = useSelector(
        (state) => state.AddressesApiRequest.isLoading
    );

    useEffect(() => {
        if (IsUserLoggedIn()) dispatch(getCustomerAddressesReducer());
        else alert("Please log in or sign up with new account");
    }, []);

    const showAddresses = () => {
        const numOfAddresses = customerAddresses?.length || 0;
        if (numOfAddresses >= 1) {
            return customerAddresses.map((address) => {
                return (
                    <AddressCard
                        key={address._id}
                        address={address}
                        numOfAddresses={numOfAddresses}
                    />
                );
            });
        } else {
            return (
                <Box
                    className="flex-column-center"
                    sx={{ minHeight: "40vh", gap: "15px", width: "100%" }}
                >
                    <Typography variant="h5">You do not have any address yet 🤷‍♂️</Typography>
                </Box>
            );
        }
    };

    return (
        <Stack sx={{ minWidth: "67vw", minHeight: "70vh" }}>
            <Box sx={{ mb: 2, px: { xs: 0.5, md: 1 } }}>
                <Typography
                    variant="h4"
                    sx={{
                        my: 1,
                        fontSize: { xs: "22px", md: "30px" },
                        fontWeight: "bolder",
                    }}
                >
                    Addresses
                </Typography>
                <Typography variant="body" sx={{ my: 1, fontSize: "15px" }}>
                    Manage your saved addresses for fast and easy checkout
                    across our marketplaces
                </Typography>
            </Box>

            <Button
                variant="contained"
                sx={{
                    maxWidth: "200px",
                    fontWeight: "bolder",
                    mb: 2,
                    mx: { xs: 0.5, md: 1 },
                    a: {
                        textDecoration: "none !important",
                        color: "inherit",
                    },
                }}
            >
                <Link to={"/userInfo/add-address"}>Add new address</Link>
            </Button>
            {/* Addresses List */}
            <Stack
                sx={{
                    px: { xs: 0.5, md: 2 },
                    gap: 2,
                    mb: 2,
                    overflowY: "auto",
                    // maxHeight: { xs: "auto", md: "70vh", lg: "60vh" },
                }}
            >
                {isLoading ? <LoaderComponent /> : showAddresses()}

            </Stack>
            {/*== Addresses List ==*/}
        </Stack>
    );
};

export default AddressComponent;
