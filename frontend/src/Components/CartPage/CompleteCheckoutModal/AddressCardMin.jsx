/* eslint-disable react/prop-types */
import { Box, Stack, Typography, Button } from "@mui/material";

import { ColorModeContext } from "../../../Theme/theme";
import { useTheme } from "@emotion/react";


const defaultStyle = {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    padding: "2px 10px",
    borderRadius: "5px",
    fontSize: "15px",
    fontWeight: "bold",
    background: "#009688"
}

const selectedStyle = {
    position: "absolute",
    top: "10px",
    right: "10px",
    padding: "2px 10px",
    borderRadius: "5px",
    fontSize: "15px",
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
                pt: 1.3,
                borderRadius: "6px",
                boxShadow: 1,
                width: "100%",
                position: "relative",
                transition: "all 0.3s ease",
                border: `1px solid ${isSelectedAddress ? "#673AB7" : "transparent"}`,
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
                        fontSize: "18px",
                        paddingTop: "0",
                        mb: "5px",
                    }}
                >
                    {address.label} Address
                </Typography>

            </Stack>

            <Stack className="flex-start-row" gap={4}>
                <p style={{ fontWeight: "bolder", minWidth: "70px" }}>Name</p>
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
                    maxWidth: { xs: "100%", md: "390px" },
                    alignItems: "flex-start",
                }}
            >
                <p
                    style={{
                        fontWeight: "bolder",
                        marginTop: 0,
                        minWidth: "70px",
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
                <p style={{ fontWeight: "bolder", minWidth: "70px" }}>Phone</p>
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