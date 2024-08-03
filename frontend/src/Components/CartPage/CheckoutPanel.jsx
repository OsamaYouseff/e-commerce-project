/* eslint-disable react/prop-types */
import { useState } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import { useTheme } from "@emotion/react";
import { ColorModeContext } from "../../Theme/theme";
import { Box, Stack } from "@mui/system";
import { Button, Typography } from "@mui/material";

const CheckoutPanel = ({ totalPrice }) => {
    const theme = useTheme(ColorModeContext);

    const [country, setCountry] = useState("");
    const [stateCity, setStateCity] = useState("");

    const discount =
        totalPrice >= 100 ? Number((totalPrice * 0.1).toFixed(2)) : 0;
    const shippingCalc = totalPrice !== 0 ? (totalPrice >= 50 ? 0 : 20) : 0;
    const shippingCost = shippingCalc === 0 ? "Free" : "$20";
    const finalPrice =
        totalPrice !== 0
            ? (totalPrice - discount + shippingCalc).toFixed(2)
            : 0;

    const handleChangeCountry = (event) => {
        setCountry(event.target.value);
    };

    const handleChangeState = (event) => {
        setStateCity(event.target.value);
    };
    return (
        <Box
            sx={{
                width: { xs: "100%", md: "30%" },
                borderRadius: "15px",
                p: 2,
                boxShadow: 2,
                border: `1px solid ${theme.palette.footerBgColor.background}`,
                bgcolor: theme.palette.bgColor.main,
            }}
        >
            <Typography
                variant="h1"
                fontSize={"20px"}
                sx={{ mb: 2, fontWeight: "bolder" }}
            >
                Calculated Shipping
            </Typography>
            <FormControl
                sx={{ mb: 2, minWidth: 120, width: "100%" }}
                size="small"
            >
                <InputLabel id="demo-select-small-label">Country</InputLabel>
                <Select
                    labelId="demo-select-small-label"
                    id="demo-select-small"
                    value={country}
                    label="Country"
                    onChange={handleChangeCountry}
                    sx={{ borderRadius: "35px" }}
                >
                    <MenuItem value={2}>Egypt</MenuItem>
                    <MenuItem value={3}>KSA</MenuItem>
                    <MenuItem value={4}>UAE</MenuItem>
                    <MenuItem value={8}>UK</MenuItem>
                    <MenuItem value={1}>USA</MenuItem>
                </Select>
            </FormControl>
            <Stack
                direction="row"
                justifyContent={"space-between"}
                alignItems={"center"}
                mb={2}
                gap={1}
            >
                <FormControl sx={{ minWidth: 120, width: "50%" }} size="small">
                    <InputLabel id="demo-select-small-label">
                        State / City
                    </InputLabel>
                    <Select
                        labelId="demo-select-small-label"
                        id="demo-select-small"
                        value={stateCity}
                        label="State / City"
                        onChange={handleChangeState}
                        sx={{ borderRadius: "35px" }}
                    >
                        <MenuItem value={1}>New York</MenuItem>
                        <MenuItem value={2}>Cairo</MenuItem>
                        <MenuItem value={3}>Riyadh</MenuItem>
                        <MenuItem value={4}>London</MenuItem>
                        <MenuItem value={5}>Abu Dhabi</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    label="Zip Code"
                    id="outlined-size-small"
                    size="small"
                    sx={{
                        ".MuiOutlinedInput-root": {
                            borderRadius: "25px",
                        },
                        width: "50%",
                    }}
                />
            </Stack>
            <Button
                variant="contained"
                sx={{
                    width: " 100%",
                    borderRadius: "25px",
                    fontWeight: "bolder",
                    mb: 3,
                }}
            >
                Update
            </Button>
            <Divider sx={{ mb: 3 }} />
            <Typography
                variant="h1"
                fontSize={"20px"}
                sx={{ mb: 2, fontWeight: "bolder" }}
            >
                Coupon Code
            </Typography>
            <Typography
                variant="h6"
                fontSize={"13px"}
                sx={{ mb: 2, fontWeight: "bolder" }}
            >
                lorem ipsum dolor sit amet adipiscing elit lorem ipsum dolor sit
                amet consectetur elit ipsum dolor sit amet adipiscing elit lorem
            </Typography>
            <TextField
                label="Coupon Code"
                id="outlined-size-small"
                size="small"
                sx={{
                    ".MuiOutlinedInput-root": {
                        borderRadius: "25px",
                    },
                    width: "100%",
                    mb: 2,
                }}
            />
            <Button
                variant="contained"
                sx={{
                    width: " 100%",
                    borderRadius: "25px",
                    fontWeight: "bolder",
                    mb: 3,
                }}
            >
                Apply
            </Button>
            <Box
                sx={{
                    borderRadius: "15px",
                    boxShadow: 1,
                    bgcolor: theme.palette.footerBgColor.accent,
                    p: 2,
                    mb: 3,
                }}
            >
                <Typography
                    variant="h1"
                    fontSize={"20px"}
                    sx={{ mb: 2, fontWeight: "bolder" }}
                >
                    Total Cart Price
                </Typography>
                <Stack sx={{ fontWeight: "bolder" }}>
                    <Typography
                        variant="h6"
                        fontSize={"14px"}
                        sx={{
                            mb: 1,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontWeight: "inherit",
                        }}
                    >
                        Cart Subtotal
                        <span style={{ fontSize: "15px" }}>
                            ${totalPrice.toFixed(2)}
                        </span>
                    </Typography>
                    <Typography
                        variant="h6"
                        fontSize={"14px"}
                        sx={{
                            mb: 1,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontWeight: "inherit",
                        }}
                    >
                        Shipping
                        <span style={{ fontSize: "15px" }}>{shippingCost}</span>
                    </Typography>
                    <Typography
                        variant="h6"
                        fontSize={"14px"}
                        sx={{
                            mb: 1,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontWeight: "inherit",
                        }}
                    >
                        Discount
                        <span style={{ fontSize: "15px" }}>- ${discount}</span>
                    </Typography>
                    <Typography
                        variant="h6"
                        fontSize={"14px"}
                        sx={{
                            mb: 1,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontWeight: "inherit",
                        }}
                    >
                        Cart Total price
                        <span
                            style={{
                                color: "#ff4450",
                                fontSize: "20px",
                            }}
                        >
                            {finalPrice}
                        </span>
                    </Typography>
                </Stack>
            </Box>
            <Button
                variant="contained"
                sx={{
                    width: " 100%",
                    borderRadius: "25px",
                    fontWeight: "bolder",
                    mb: 1,
                    bgcolor: "#1d273b",
                    color: "white",
                }}
            >
                Checkout
            </Button>
        </Box>
    );
};

export default CheckoutPanel;
