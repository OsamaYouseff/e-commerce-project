/* eslint-disable react/prop-types */
import { useState } from "react";
import TextField from "@mui/material/TextField";
import { useTheme } from "@emotion/react";
import { ColorModeContext } from "../../Theme/theme";
import { Box, Stack } from "@mui/system";
import { Button, Typography } from "@mui/material";
import { CalcTotalCartPrice, IsDiscountValid } from "../../General/GeneralFunctions";
import toast from 'react-hot-toast';


const CheckoutPanel = ({ totalPrice, handelCheckout }) => {
    const theme = useTheme(ColorModeContext);

    const [discountCode, setDiscountCode] = useState("");
    let { finalPrice, shippingCost, discount, shippingCalc } = CalcTotalCartPrice(totalPrice, discountCode);
    const [isCouponFieldDisabled, setIsCouponFieldDisabled] = useState(false);


    const handelChangeCouponCode = () => {
        if (IsDiscountValid(discountCode)) setIsCouponFieldDisabled(true);
        else {
            toast.error("Invalid Coupon Code");
        }
    };

    const handleCheckoutCart = () => {
        handelCheckout({
            subtotalInCents: Math.round(totalPrice * 100),
            discount: Math.round(discount * 100),
            shippingCostInCents: Math.round(shippingCalc * 100),
            totalAmountInCents: Math.round(finalPrice * 100),
            currency: "USD",
        });
    };


    return (
        <Box
            sx={{
                height: "100%",
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
                Order Summary
            </Typography>

            <Typography
                variant="h4"
                fontSize={"16px"}
                sx={{ mb: 2, fontWeight: "bolder" }}
            >
                Coupon Code
            </Typography>
            <Stack
                className="flex-between"
                mb={2}
                sx={{ position: "relative" }}
            >
                <TextField
                    defaultValue={discountCode}
                    value={discountCode}
                    disabled={isCouponFieldDisabled}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    label="Enter coupon"
                    id="outlined-size-small"
                    size="small"
                    sx={{
                        ".MuiOutlinedInput-root": {
                            borderRadius: "25px",
                        },
                        width: "100%",
                    }}
                />
                <Button
                    variant="contained"
                    onClick={() => {
                        setDiscountCode("");
                        setIsCouponFieldDisabled(false);
                    }}
                    sx={{
                        right: 2,
                        top: 1.75,
                        width: " 30%",
                        borderRadius: "25px",
                        fontWeight: "bolder",
                        position: "absolute",
                    }}
                >
                    Remove
                </Button>
            </Stack>
            <Button
                onClick={handelChangeCouponCode}
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
                            ${finalPrice}
                        </span>
                    </Typography>
                </Stack>
            </Box>
            <Button
                onClick={handleCheckoutCart}
                aria-label="checkout"
                variant="contained"
                sx={{
                    width: " 100%",
                    borderRadius: "25px",
                    fontWeight: "bolder",
                    mb: 1,
                    bgcolor: "#1d273b",
                    color: "white",
                    border: `1px solid ${theme.palette.primary.main} `,
                }}
            >
                Checkout
            </Button>
        </Box>
    );
};

export default CheckoutPanel;
