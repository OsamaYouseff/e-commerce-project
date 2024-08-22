/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import Modal from "@mui/material/Modal";
import { Box, Stack, Typography, Button, Divider, Container } from "@mui/material";
import { useEffect, useState } from "react";
import { ColorModeContext } from "../../../Theme/theme";
import { useTheme } from "@emotion/react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";
import AddCardRoundedIcon from "@mui/icons-material/AddCardRounded";


/// custom component
import AddressCardMin from "./AddressCardMin";
import ProductPreviewInCheckout from "./ProductPreviewInCheckout";
import { SomeThingWrong } from "../../GenericComponents/SomeThingWrong/SomeThingWrong";
import SelectAddressSection from "./SelectAddressSection";
import toast from 'react-hot-toast';

//// General Vars & Functions
import { convertCentsToDollars, GetEstimatedDeliveryDate, GetTokenAndUserId, IsUserLoggedIn } from "../../../General/GeneralFunctions";
import { isOrderInfoValid, getErrorsMessage } from "./orderRelatedFunctions"

import { Link } from "react-router-dom";

// redux
import { useDispatch, useSelector } from "react-redux";
import { getCustomerDefaultAddressReducer } from "../../../redux/AddressSlice/ApiAddressSlice";
import { createCustomerOrderReducer } from "../../../redux/OrdersSlice/ApiOrdersSlice";
import LoaderComponent from "../../GenericComponents/LoaderComponent/LoaderComponent";


export default function CompleteCheckoutModal({ openCheckoutModal, handleCloseCheckoutModal, checkoutInfo, clearCartAtEnd }) {
    const theme = useTheme(ColorModeContext);
    const productsCount = checkoutInfo?.products?.length || 0;
    const estimatedDeliveryDate = GetEstimatedDeliveryDate();
    const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");

    const currency = checkoutInfo?.financials?.currency === "USD" ? "$" : checkoutInfo?.financials?.currency;
    const shippingCost = checkoutInfo?.financials.shippingCostInCents === 0 ? "Free" : `${currency}${checkoutInfo?.financials.shippingCostInCents}`;

    const dispatch = useDispatch();
    const selectedAddress = useSelector((state) => state.AddressesApiRequest.singleAddressResponse);
    const error = useSelector((state) => state.AddressesApiRequest.error);
    const message = useSelector((state) => state.AddressesApiRequest.message);
    const isLoading = useSelector((state) => state.AddressesApiRequest.isLoading);

    // console.log(checkoutInfo)

    const handelPaymentMethod = (event, newValue) => {
        if (newValue === null) return;
        setPaymentMethod(newValue);
    };
    const handelPlaceOrder = () => {
        const { customerId } = GetTokenAndUserId();

        const filteredProducts = checkoutInfo.products.map((product) => {
            return {
                productId: product.productId,
                quantity: product.quantity,
                priceAtOrderInCents: product.productDetails.price * 100,
            };
        });

        if (selectedAddress._id === undefined) {
            toast.error("Please select an address if you don't have one create a new one");
            return;
        }

        const filteredShippingAddress = {
            fullAddress: selectedAddress.fullAddress,
            phoneNumber: selectedAddress.phoneNumber,
            firstName: selectedAddress.firstName,
            lastName: selectedAddress.lastName,
            label: selectedAddress.label,
        }

        const orderData = {
            userId: customerId,
            items: filteredProducts,
            financials: checkoutInfo.financials,
            shippingAddress: filteredShippingAddress,
            paymentMethod: paymentMethod,
            shippingInfo: {
                estimatedDeliveryDate: estimatedDeliveryDate
            },
        };

        // console.log(orderData)

        const orderValidationRes = isOrderInfoValid(orderData)

        if (orderValidationRes.length === 0) {
            IsUserLoggedIn()
                ? dispatch(createCustomerOrderReducer({ orderData, clearCartAtEnd }))
                : toast.error("Please log in or sign up with new account🙂");

        } else {
            toast.error(getErrorsMessage(orderValidationRes))
        }

        handleCloseCheckoutModal()
    };


    useEffect(() => {
        if (IsUserLoggedIn()) {
            dispatch(getCustomerDefaultAddressReducer())
        }
    }, []);


    return (
        <Modal
            // keepMounted
            open={openCheckoutModal}
            // onClose={handleCloseCheckoutModal}
            aria-labelledby="complete-checkout-modal"
            aria-describedby="complete-checkout-modal-description"
            sx={{
                bgcolor: theme.palette.modalBgColor.main,
                overflowY: "auto", minHeight: "100vh",
                ".MuiModal-backdrop": {
                    bgcolor: "rgba(0,0,0,00)"
                }
            }}
        >
            <Container sx={{ py: 2, px: { xs: 0.5, md: 2 } }}>
                {/* header */}

                <Box>
                    <Button
                        onClick={() => handleCloseCheckoutModal()}
                        size="small"
                        sx={{ fontWeight: "bolder", mb: 2 }}
                        variant="outlined"
                    >
                        <ArrowBackIosIcon />
                        Back to Cart
                    </Button>

                    <Box sx={{ mb: 2, px: { xs: 0.5, md: 1 } }}>
                        <Typography
                            variant="h4"
                            sx={{
                                my: 0.5,
                                fontSize: {
                                    xs: "22px",
                                    md: "26px",
                                    fontWeight: "bolder",
                                },
                            }}
                        >
                            Shipping Address
                        </Typography>
                    </Box>
                </Box>
                {/*== header ==*/}

                {/* order summary */}
                <Stack
                    className="flex-between"
                    sx={{
                        gap: 2,
                        flexDirection: {
                            xs: "column !important",
                            md: "row !important",
                        },
                        alignItems: {
                            xs: "center !important",
                            md: "flex-start !important",
                        },
                    }}
                >
                    {/* Order Summary & Address Details */}
                    <Box
                        sx={{
                            minWidth: { xs: "100%", md: "60%" },
                            flexGrow: 1,
                            p: { xs: 1, md: 2 },
                            borderRadius: "6px",
                            bgcolor: theme.palette.sectionBgColor.main,
                        }}
                    >
                        {/* Selecting Address Section */}

                        {/* Selected address */}
                        {
                            isLoading ? <LoaderComponent />
                                : error
                                    ? <>
                                        <SomeThingWrong minHeight={200} errorMsg={message}
                                            additionalElements={
                                                <Link to="/userInfo/address">
                                                    <Button variant="contained" sx={{ fontWeight: "bolder" }} color="secondary">
                                                        Show My Address
                                                    </Button>
                                                </Link>
                                            }
                                        />
                                    </>
                                    : <AddressCardMin address={selectedAddress} defaultAddress={true} />
                        }
                        {/* Selected address */}

                        <SelectAddressSection selectedAddressId={selectedAddress?._id} />

                        {/*== Selecting Address Section ==*/}

                        <Divider sx={{ my: 1 }} />
                        {/* products in cart */}

                        {checkoutInfo.products.map((product, index) => (
                            <ProductPreviewInCheckout key={product._id} index={index} productsCount={productsCount} product={product} estimatedDeliveryDate={estimatedDeliveryDate} />
                        ))}

                        {/*== products in cart==*/}
                    </Box>
                    {/*== Order Summary & Address Details == */}

                    {/* order invoice & payment */}
                    <Stack
                        sx={{
                            width: {
                                xs: "100%",
                                md: "33%",
                            },
                            borderRadius: "6px",
                            overflow: "hidden",
                        }}
                    >
                        {/* order invoice */}
                        <Box
                            sx={{
                                bgcolor: theme.palette.sectionBgColor.main,
                                p: 2,
                                mb: 2,
                            }}
                        >
                            <Typography variant="h6" mb={1}>
                                Order Summary
                            </Typography>
                            <Stack gap={0.5}>
                                <Typography variant="body" fontSize={18} sx={{ fontWeight: "bolder" }}>
                                    Order Details{" "}
                                </Typography>
                                <Typography
                                    className="flex-between"
                                    fontSize={15}
                                >
                                    <span>Subtotal</span>
                                    <span style={{ fontWeight: "bolder", color: theme.palette.specialText2.main }}>
                                        {currency}{" "}
                                        {convertCentsToDollars(
                                            checkoutInfo?.financials
                                                ?.subtotalInCents
                                        )}
                                    </span>
                                </Typography>
                                <Typography
                                    className="flex-between"
                                    fontSize={15}
                                >
                                    <span>Shipping Cost</span>
                                    <span style={{ fontWeight: "bolder" }}>{shippingCost}</span>
                                </Typography>
                                <Typography
                                    className="flex-between"
                                    fontSize={15}
                                >
                                    <span>Discount</span>
                                    <span style={{ fontWeight: "bolder" }}>
                                        - {currency}{" "}
                                        {convertCentsToDollars(
                                            checkoutInfo?.financials?.discount
                                        )}
                                    </span>
                                </Typography>
                                <Divider />
                                <Typography
                                    className="flex-between"
                                    fontSize={16}
                                >
                                    <span style={{ fontWeight: "bolder" }}>Order total</span>
                                    <span style={{ color: theme.palette.specialText.main, fontWeight: "bolder" }}>
                                        {currency}{" "}
                                        {convertCentsToDollars(
                                            checkoutInfo?.financials
                                                ?.totalAmountInCents
                                        )}
                                    </span>
                                </Typography>
                            </Stack>
                        </Box>
                        {/*== order invoice ==*/}

                        {/* payment */}
                        <Box
                            sx={{
                                bgcolor: theme.palette.sectionBgColor.main,
                                p: 2,
                                mb: 2,
                            }}
                        >
                            <Typography variant="h6" mb={1}>
                                Payment
                            </Typography>
                            <ToggleButtonGroup
                                className="flex-center"
                                value={paymentMethod}
                                exclusive
                                onChange={handelPaymentMethod}
                                aria-label="gender"
                                size="small"
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    ".MuiToggleButtonGroup-grouped.Mui-selected":
                                    {
                                        color: `${theme.palette.primary.main} !important`,
                                        borderColor: `${theme.palette.primary.main} !important`,
                                    },
                                }}
                            >
                                <ToggleButton
                                    value="cash_on_delivery"
                                    aria-label="male-gender"
                                >
                                    <Stack
                                        sx={{ fontSize: "13px" }}
                                        alignItems={"center"}
                                    >
                                        <MonetizationOnRoundedIcon
                                            sx={{ fontSize: "30px" }}
                                        />
                                        Cash on Delivery
                                    </Stack>
                                </ToggleButton>
                                <ToggleButton
                                    value="credit_card"
                                    aria-label="female-gender"
                                >
                                    <Stack
                                        sx={{ fontSize: "13px" }}
                                        alignItems={"center"}
                                    >
                                        <AddCardRoundedIcon
                                            sx={{ fontSize: "30px" }}
                                        />
                                        Credit/Debit Card
                                    </Stack>
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                        {/*== payment ==*/}
                        <Button
                            onClick={handelPlaceOrder}
                            variant="contained"
                            sx={{ width: "100%", fontWeight: "bolder" }}
                        >
                            place Order
                        </Button>
                    </Stack>
                    {/*== order invoice & payment ==*/}
                </Stack>
                {/*== order summary ==*/}
            </Container>
        </Modal>
    );
}


