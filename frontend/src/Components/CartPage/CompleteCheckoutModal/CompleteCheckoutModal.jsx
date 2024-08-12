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
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
/// custom component
import LoaderComponent from "../../GenericComponents/LoaderComponent/LoaderComponent";

// redux
import { useDispatch, useSelector } from "react-redux";
import { getCustomerDefaultAddressReducer, getCustomerAddressesReducer, getCustomerAddressReducer } from "../../../redux/AddressSlice/ApiAddressSlice";
import { createCustomerOrderReducer } from "../../../redux/OrdersSlice/ApiOrdersSlice";
import { convertCentsToDollars, FormatDate, GetTokenAndUserId, IsUserLoggedIn } from "../../../General/GeneralFunctions";
import { SomeThingWrong } from "../../../General/GeneralComponents";
import AddressCardMin from "./AddressCardMin";
import ProductPreviewInCheckout from "./ProductPreviewInCheckout";

export default function CompleteCheckoutModal({ openCheckoutModal, handleCloseCheckoutModal, checkoutInfo, }) {
    const theme = useTheme(ColorModeContext);
    const productsCount = checkoutInfo?.products?.length || 0;
    const estimatedDeliveryDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");

    const currency = checkoutInfo?.financials?.currency === "USD" ? "$" : checkoutInfo?.financials?.currency;
    const shippingCost = checkoutInfo?.financials.shippingCostInCents === 0 ? "Free" : `${currency}${checkoutInfo?.financials.shippingCostInCents}`;

    const dispatch = useDispatch();
    const selectedAddress = useSelector((state) => state.AddressesApiRequest.singleAddressResponse);

    // console.log(selectedAddress)

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


        const OrderData = {
            userId: customerId,
            items: filteredProducts,
            financials: checkoutInfo.financials,
            shippingAddressId: selectedAddress._id,
            paymentMethod: paymentMethod,
            shippingInfo: {
                estimatedDeliveryDate: estimatedDeliveryDate
            },
        };

        console.log(OrderData)

        dispatch(createCustomerOrderReducer(OrderData))

        // handleCloseCheckoutModal()
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
            sx={{ bgcolor: "#000", overflowY: "auto", minHeight: "100vh" }}
        >
            <Container sx={{ py: 2 }}>
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
                            p: 2,
                            borderRadius: "6px",
                            bgcolor: theme.palette.sectionBgColor.main,
                        }}
                    >
                        {/* Selecting Address Section */}

                        {/* Selected address */}
                        <AddressCardMin address={selectedAddress} defaultAddress={true} />
                        {/* Selected address */}

                        <AddressSection selectedAddressId={selectedAddress?._id} />


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
                                <Typography variant="body">
                                    Order Details{" "}
                                </Typography>
                                <Typography
                                    className="flex-between"
                                    fontSize={14}
                                >
                                    <span>Subtotal</span>
                                    <span>
                                        {currency}{" "}
                                        {convertCentsToDollars(
                                            checkoutInfo?.financials
                                                ?.subtotalInCents
                                        )}
                                    </span>
                                </Typography>
                                <Typography
                                    className="flex-between"
                                    fontSize={14}
                                >
                                    <span>Shipping Cost</span>
                                    <span>{shippingCost}</span>
                                </Typography>
                                <Typography
                                    className="flex-between"
                                    fontSize={14}
                                >
                                    <span>Discount</span>
                                    <span>
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
                                    <span>Order total</span>
                                    <span>
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


function AddressSection({ selectedAddressId }) {

    const dispatch = useDispatch();
    const customerAddresses = useSelector((state) => state.AddressesApiRequest.response);
    const isLoading = useSelector((state) => state.AddressesApiRequest.isLoading);

    // console.log(customerAddresses)

    const handelSelectedAddress = (newSelectedAddressId) => {
        // alert(newSelectedAddressId)

        if (IsUserLoggedIn() && newSelectedAddressId !== selectedAddressId) {
            dispatch(getCustomerAddressReducer(newSelectedAddressId))
        }
    }
    const showAddresses = () => {
        if (customerAddresses) {
            return customerAddresses.map((address) => {
                return (
                    <AddressCardMin
                        key={address._id}
                        address={address}
                        selectedAddressId={selectedAddressId}
                        handelSelectedAddress={handelSelectedAddress}
                    />
                );
            });
        } else {
            return <Box>You do not have any addresses</Box>;
        }
    };

    useEffect(() => {
        if (IsUserLoggedIn()) {
            dispatch(getCustomerAddressesReducer())
        }
    }, []);

    return (
        <div>
            <Accordion>
                <AccordionSummary
                    className="border"
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                    sx={{ ".MuiAccordionSummary-content": { display: "flex", justifyContent: "space-between ", alignItems: "center" }, fontWeight: "bolder" }}
                >


                    <Button
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: "bolder" }}
                    >
                        Change address
                    </Button>
                </AccordionSummary>
                <AccordionDetails className="flex-column-center" sx={{ gap: 2, p: 0 }}>
                    {isLoading ? <LoaderComponent /> : showAddresses()}
                </AccordionDetails>
            </Accordion>

        </div>
    );
}
