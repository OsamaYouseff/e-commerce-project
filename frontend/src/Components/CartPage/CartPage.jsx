import { Button, Container, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../Theme/theme";
import ItemComponentDetails from "./ItemComponentDetails";
import { Fragment } from "react";

import { useState } from "react";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import MidHeader from "../GenericComponents/Header/MidHeader";


const CartPage = () => {
    const theme = useTheme(ColorModeContext);
    const [country, setCountry] = useState('');
    const [stateCity, setStateCity] = useState('');

    const handleChangeCountry = (event) => {
        setCountry(event.target.value);
    };

    const handleChangeState = (event) => {
        setStateCity(event.target.value);
    };
    return (
        <Fragment>
            <MidHeader />
            <Container maxWidth="xl" sx={{
                bgcolor: theme.palette.sectionBgColor.main, py: 2, mt: 2, minHeight: "88vh",
                borderRadius: "8px",
            }}>
                <Stack direction="row" gap={2} justifyContent={"space-between"} sx={{
                    mb: 2, [theme.breakpoints.down("md")]: {
                        flexDirection: "column",
                    }
                }}>
                    <Box sx={{ width: { xs: "100%", md: "70%" }, maxHeight: { xs: "auto", sm: "auto" }, overflow: "auto" }}>
                        <Typography variant="h1" fontSize={"20px"} sx={{ mb: 1 }}>Shopping Bag</Typography>
                        <Typography variant="h2" fontSize={"20px"} sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ color: theme.palette.primary.main, fontWeight: "bolder" }}>2</span>
                            Items in your shopping bag
                        </Typography>

                        <Box sx={{
                            my: 2, boxShadow: 1, bgcolor: theme.palette.bgColor.main, py: 1, px: 2, borderRadius: "6px",

                        }}>
                            <Stack direction="row" p={1} gap={2} mb={2} mt={1} sx={{ boxShadow: 1, borderRadius: "6px", display: { xs: "none", sm: "flex" } }}>
                                <span style={{ fontSize: "19px", width: "33%", fontWeight: "bold" }}>Product</span>
                                <span style={{ fontSize: "19px", width: "9%", fontWeight: "bold" }}>Price</span>
                                <span style={{ fontSize: "19px", width: "20%", fontWeight: "bold", textAlign: "center" }}>Quantity</span>
                                <span style={{ fontSize: "19px", width: "32%", fontWeight: "bold", textAlign: "center" }}>Total Price</span>
                            </Stack>
                            <ItemComponentDetails />
                            <ItemComponentDetails />
                            <ItemComponentDetails />
                            <ItemComponentDetails />
                            <ItemComponentDetails />
                        </Box>
                    </Box>
                    <Box sx={{ width: { xs: "100%", md: "30%" }, borderRadius: "15px", p: 2, boxShadow: 2, border: `1px solid ${theme.palette.footerBgColor.background}`, bgcolor: theme.palette.bgColor.main }}>
                        <Typography variant="h1" fontSize={"20px"} sx={{ mb: 2, fontWeight: "bolder" }}>Calculated Shipping</Typography>
                        <FormControl sx={{ mb: 2, minWidth: 120, width: "100%" }} size="small">
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
                                <MenuItem value={3}>UAE</MenuItem>
                                <MenuItem value={3}>UK</MenuItem>
                                <MenuItem value={1}>USA</MenuItem>
                            </Select>
                        </FormControl>
                        <Stack direction="row" justifyContent={"space-between"} alignItems={"center"} mb={2} gap={1}>
                            <FormControl sx={{ minWidth: 120, width: "50%" }} size="small">
                                <InputLabel id="demo-select-small-label">State / City</InputLabel>
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
                                    <MenuItem value={3}>London</MenuItem>
                                    <MenuItem value={3}>Abu Dhabi</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label="Zip Code"
                                id="outlined-size-small"
                                size="small"
                                sx={{ ".MuiOutlinedInput-root": { borderRadius: "25px" }, width: "50%" }}
                            />
                        </Stack>
                        <Button variant="contained" sx={{ width: " 100%", borderRadius: "25px", fontWeight: "bolder", mb: 3 }}>Update</Button>
                        <Divider sx={{ mb: 3 }} />
                        <Typography variant="h1" fontSize={"20px"} sx={{ mb: 2, fontWeight: "bolder" }}>Coupon Code</Typography>
                        <Typography variant="h6" fontSize={"13px"} sx={{ mb: 2, fontWeight: "bolder" }}>
                            lorem ipsum dolor sit amet adipiscing elit lorem ipsum dolor sit amet consectetur elit ipsum dolor sit amet adipiscing elit lorem
                        </Typography>
                        <TextField
                            label="Coupon Code"
                            id="outlined-size-small"
                            size="small"
                            sx={{ ".MuiOutlinedInput-root": { borderRadius: "25px" }, width: "100%", mb: 2 }}
                        />
                        <Button variant="contained" sx={{ width: " 100%", borderRadius: "25px", fontWeight: "bolder", mb: 3 }}>Apply</Button>
                        <Box sx={{ borderRadius: "15px", boxShadow: 1, bgcolor: theme.palette.footerBgColor.accent, p: 2 }}>
                            <Typography variant="h1" fontSize={"20px"} sx={{ mb: 2, fontWeight: "bolder" }}>Total Cart Price</Typography>
                            <Stack sx={{ fontWeight: "bolder" }}>
                                <Typography variant="h6" fontSize={"14px"} sx={{ mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "inherit" }}>
                                    Cart Subtotal
                                    <span style={{ fontSize: "15px" }}>$132.99</span>
                                </Typography>
                                <Typography variant="h6" fontSize={"14px"} sx={{ mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "inherit" }}>
                                    Shipping
                                    <span style={{ fontSize: "15px" }}>Free</span>
                                </Typography>
                                <Typography variant="h6" fontSize={"14px"} sx={{ mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "inherit" }}>
                                    Discount
                                    <span style={{ fontSize: "15px" }}>- $12.99</span>
                                </Typography>
                                <Typography variant="h6" fontSize={"14px"} sx={{ mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "inherit" }}>
                                    Cart Total price
                                    <span style={{ color: "#ff4450", fontSize: "20px" }}>$120.00</span>
                                </Typography>
                            </Stack>
                        </Box>
                    </Box>
                </Stack>
            </Container>
        </Fragment >
    );
};
export default CartPage;