/* eslint-disable react/prop-types */
import { Box, Stack, Typography } from "@mui/material";

import { ColorModeContext } from "../../../Theme/theme";
import { useTheme } from "@emotion/react";


const defaultStyle = {
    position: "absolute",
    bottom: ".625rem",
    right: ".625rem",
    padding: ".125rem .625rem",
    borderRadius: ".3125rem",
    fontSize: ".9375rem",
    fontWeight: "bold",
    background: "#009688"
}

const selectedStyle = {
    position: "absolute",
    top: ".625rem",
    right: ".625rem",
    padding: ".125rem .625rem",
    borderRadius: ".3125rem",
    fontSize: ".9375rem",
    fontWeight: "bold",
    background: "#673AB7"
}

const AddressCardMin = ({ address, defaultAddress = false, selectedAddressId, handelSelectedAddress }) => {
    const theme = useTheme(ColorModeContext);

    const isSelectedAddress = selectedAddressId === address._id;

    // console.log(selectedAddressId)

    const handelChangeSelectedAddress = () => {
        if (!isSelectedAddress && !defaultAddress) {
            handelSelectedAddress(address._id);
        }

    }


    return (
        <Box
            onClick={() => handelChangeSelectedAddress()}
            sx={{
                bgcolor: theme.palette.natural.main,
                px: { xs: 2, sm: 3 },
                py: 4,


                borderRadius: ".375rem",
                boxShadow: 1,
                width: "100%",
                position: "relative",
                transition: "all 0.3s ease",
                border: `.0625rem solid ${isSelectedAddress ? "#673AB7" : "transparent"}`,
                "&:hover": {
                    borderColor: `${!defaultAddress ? "#E91E63" : "transparent"}`,
                    transform: `${!defaultAddress ? "scale(1.01)" : ""}`,
                },


                cursor: defaultAddress ? "default" : "pointer",
            }}
        >
            <span style={{ ...defaultStyle, display: address.isDefault ? "inline" : "none" }} >Default</span>
            <span style={{ ...selectedStyle, display: isSelectedAddress ? "inline" : "none" }} >Selected</span>
            <Stack
                direction={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
                sx={{
                    flexDirection: { xs: "column-reverse", sm: "row" },
                }}
            >
                <Typography
                    sx={{
                        fontWeight: "bolder",
                        width: { xs: "100%", sm: "50%" },
                        fontSize: "1.125rem",
                        paddingTop: "0",
                        mb: ".3125rem",
                    }}
                >
                    {address.label} Address
                </Typography>

            </Stack>

            <Stack className="flex-start-row" gap={4}>
                <p style={{ fontWeight: "bolder", minWidth: "4.375rem" }}>Name</p>
                <Box
                    className="flex-between"
                    sx={{ gap: 2, fontWeight: "bolder" }}
                >
                    {address.firstName + " " + address.lastName}
                </Box>
            </Stack>

            <Stack
                // mt={2}
                className="flex-start-row"
                gap={4}
                sx={{
                    maxWidth: { xs: "100%", md: "24.375rem" },
                    alignItems: "flex-start",
                }}
            >
                <p
                    style={{
                        fontWeight: "bolder",
                        marginTop: 0,
                        minWidth: "4.375rem",
                    }}
                >
                    Address
                </p>
                <Box
                    className="flex-center"
                    sx={{ gap: 2, fontWeight: "bolder" }}
                >
                    {address.fullAddress}
                </Box>
            </Stack>

            <Stack className="flex-start-row" gap={4}>
                <p style={{ fontWeight: "bolder", minWidth: "4.375rem" }}>Phone</p>
                <Box
                    className="flex-between"
                    sx={{ gap: 2, fontWeight: "bolder" }}
                >
                    {address.phoneNumber}
                </Box>
            </Stack>
        </Box>
    );
};

export default AddressCardMin;

// const address = {
//     _id: "66b3948c5bf683150118a774",
//     userId: "66a4ecdc15e14384d8786e7c",
//     fullAddress: "Egypt,Governorate-5003111-Marinah",
//     phoneNumber: "+020 1236789032",
//     firstName: "Ahmed",
//     lastName: "Moustafa",
//     label: "Home",
//     isDefault: true,
//     createdAt: "2024-08-07T15:36:44.417Z",
//     updatedAt: "2024-08-07T15:36:50.609Z",
// };