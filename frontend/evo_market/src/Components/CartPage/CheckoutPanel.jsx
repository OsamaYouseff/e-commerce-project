/* eslint-disable react/prop-types */
import { useState } from "react";
import TextField from "@mui/material/TextField";
import { useTheme } from "@emotion/react";
import { ColorModeContext } from "../../../../shared_files/Theme/theme.jsx";
import { Box, Stack } from "@mui/system";
import { Button, Typography } from "@mui/material";
import { CalcTotalCartPrice, IsDiscountValid } from "../../General/GeneralFunctions.js";
import toast from 'react-hot-toast';


const CheckoutPanel = ({ totalPrice, handelCheckout }) => {
    const theme = useTheme(ColorModeContext);

    const isThereCoupon = localStorage.getItem("discountCode");

    const [discountCode, setDiscountCode] = useState(localStorage.getItem("discountCode") || "");

    let { finalPrice, shippingCost, discount, shippingCalc } = CalcTotalCartPrice(totalPrice, discountCode);
    const [isCouponFieldDisabled, setIsCouponFieldDisabled] = useState(isThereCoupon);


    const handelChangeCouponCode = () => {
        if (IsDiscountValid(discountCode)) {
            setIsCouponFieldDisabled(true);
            localStorage.setItem("discountCode", discountCode);
            toast.success("Coupon code applied successfully");
        }
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
                borderRadius: ".9375rem",
                p: 2,
                boxShadow: 2,
                border: `.0625rem solid ${theme.palette.footerBgColor.background}`,
                bgcolor: "bgColor.main",
            }}
        >
            <Typography
                variant="h1"
                fontSize={"1.25rem"}
                sx={{ mb: 2, fontWeight: "bolder" }}
            >
                Order Summary
            </Typography>

            <Typography
                variant="h1"
                fontSize={"1rem"}
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
                            borderRadius: "1.5625rem",
                        },
                        width: "100%",
                    }}
                />
                <Button
                    variant="contained"
                    onClick={() => {
                        setDiscountCode("");
                        setIsCouponFieldDisabled(false);
                        localStorage.removeItem("discountCode");
                    }}
                    sx={{
                        right: 2,
                        top: 1.75,
                        width: " 30%",
                        borderRadius: "1.5625rem",
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
                    borderRadius: "1.5625rem",
                    fontWeight: "bolder",
                    mb: 3,
                }}
            >
                Apply
            </Button>
            <Box
                sx={{
                    borderRadius: ".9375rem",
                    boxShadow: 1,
                    bgcolor: "footerBgColor.accent",
                    p: 2,
                    mb: 3,
                }}
            >
                <Typography
                    variant="h1"
                    fontSize={"1.25rem"}
                    sx={{ mb: 2, fontWeight: "bolder" }}
                >
                    Total Cart Price
                </Typography>
                <Stack sx={{ fontWeight: "bolder" }}>
                    <Typography
                        variant="h2"
                        fontSize={".875rem"}
                        sx={{
                            mb: 1,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontWeight: "inherit",
                        }}
                    >
                        Cart Subtotal
                        <span style={{ fontSize: ".9375rem" }}>
                            ${totalPrice.toFixed(2)}
                        </span>
                    </Typography>
                    <Typography
                        variant="h2"
                        fontSize={".875rem"}
                        sx={{
                            mb: 1,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontWeight: "inherit",
                        }}
                    >
                        Shipping
                        <span style={{ fontSize: ".9375rem" }}>{shippingCost}</span>
                    </Typography>
                    <Typography
                        variant="h2"
                        fontSize={".875rem"}
                        sx={{
                            mb: 1,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontWeight: "inherit",
                        }}
                    >
                        Discount
                        <span style={{ fontSize: ".9375rem" }}>- ${discount}</span>
                    </Typography>
                    <Typography
                        variant="h2"
                        fontSize={".875rem"}
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
                                color: theme.palette.specialText.main,
                                fontSize: "1.25rem",
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
                    borderRadius: "1.5625rem",
                    fontWeight: "bolder",
                    mb: 1,
                    bgcolor: "#1d273b",
                    color: "white",
                    border: `.0625rem solid ${theme.palette.primary.main} `,
                }}
            >
                Checkout
            </Button>
        </Box>
    );
};

export default CheckoutPanel;
