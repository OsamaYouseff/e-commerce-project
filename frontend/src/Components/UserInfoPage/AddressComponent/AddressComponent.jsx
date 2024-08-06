/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Button, Stack, Typography } from "@mui/material";
import AddressCard from "./AddressCard";
import { Link } from "react-router-dom";

import { useEffect } from "react";

//// redux
import { useSelector, useDispatch } from "react-redux";
import { getCustomerAddressesReducer } from "../../../redux/ApiAddressSlice.js";

const AddressPage = () => {
    const dispatch = useDispatch();
    const customerAddresses = useSelector(
        (state) => state.AddressesApiRequest.response
    );

    useEffect(() => {
        dispatch(getCustomerAddressesReducer());
    }, []);

    const showAddresses = () => {
        const numOfAddresses = customerAddresses?.length || 0;
        if (customerAddresses) {
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
            return <Box>You do not have any addresses</Box>;
        }
    };

    return (
        <Stack sx={{ minWidth: "67vw" }}>
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

            <Link to={"/userInfo/add-address"}>
                <Button
                    variant="contained"
                    sx={{
                        maxWidth: "200px",
                        fontWeight: "bolder",
                        mb: 2,
                        mx: { xs: 0.5, md: 1 },
                    }}
                >
                    Add new address
                </Button>
            </Link>
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
                {/* Address Card */}
                {showAddresses()}
                {/*== Address Card ==*/}
            </Stack>
            {/*== Addresses List ==*/}
        </Stack>
    );
};

export default AddressPage;
