/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import Modal from "@mui/material/Modal";
import { Box, Stack, Typography, Button, Divider, Container } from "@mui/material";
import { useEffect, useState } from "react";
import { ColorModeContext } from "../../../../../shared_files/Theme/theme.jsx";
import { useTheme } from "@emotion/react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";


/// custom component
import AddressCardMin from "./AddressCardMin";
import ProductPreviewInCheckout from "./ProductPreviewInCheckout";
import { SomeThingWrong } from "../../../../../shared_files/SomeThingWrong/SomeThingWrong.jsx";
import SelectAddressSection from "./SelectAddressSection";
import toast from 'react-hot-toast';

//// General Vars & Functions
import { convertCentsToDollars } from "../../../../../shared_files/General/GeneralFunctions.js";
import { GetTokenAndUserId, IsUserLoggedIn, GetEstimatedDeliveryDate, getCheckoutIdempotencyKey, rotateCheckoutIdempotencyKey } from "../../../General/GeneralFunctions.js";
import { isOrderInfoValid, getErrorsMessage } from "./orderRelatedFunctions"

import { Link } from "react-router-dom";

// redux
import { useDispatch, useSelector } from "react-redux";
import { getCustomerDefaultAddressReducer } from "../../../redux/AddressSlice/ApiAddressSlice";
import { createCustomerOrderReducer } from "../../../redux/OrdersSlice/ApiOrdersSlice";
import LoaderComponent from "../../../../../shared_files/LoaderComponent/LoaderComponent.jsx";


export default function CompleteCheckoutModal({ openCheckoutModal, handleCloseCheckoutModal, checkoutInfo, clearCartAtEnd }) {
    const theme = useTheme(ColorModeContext);
    const productsCount = checkoutInfo?.products?.length || 0;
    const estimatedDeliveryDate = GetEstimatedDeliveryDate();

    /**
     * The API accepts only `cash_on_delivery`: offering a card option produced a
     * 400 from the server on the only supported path. Card payments are not
     * implemented end to end yet, so the storefront must not offer them.
     */
    const paymentMethod = "cash_on_delivery";

    /**
     * One key per checkout attempt, kept in sessionStorage rather than in a
     * component ref. A ref is destroyed when this modal unmounts, and it is
     * unmounted as soon as the request is sent, so a retry after a timeout or a
     * page reload used to arrive with a fresh key and could create a second
     * order. The stored key survives unmounts and reloads and is rotated only
     * once an order is confirmed to exist.
     */
    const { customerId } = GetTokenAndUserId();
    const idempotencyKey = getCheckoutIdempotencyKey(customerId);

    /**
     * Set when the API refused the order because its authoritative total differs
     * from the preview shown here. No order was created, so the customer is
     * asked to confirm the real total and the attempt is retried with the same
     * key.
     */
    const [pendingPricingChange, setPendingPricingChange] = useState(null);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const currency = checkoutInfo?.financials?.currency === "USD" ? "$" : checkoutInfo?.financials?.currency;
    const shippingCostInCents = Number(checkoutInfo?.financials?.shippingCostInCents ?? 0);
    const shippingCost = shippingCostInCents === 0
        ? "Free"
        : `${currency}${convertCentsToDollars(shippingCostInCents)}`;

    const dispatch = useDispatch();
    const selectedAddress = useSelector((state) => state.AddressesApiRequest.singleAddressResponse);
    const error = useSelector((state) => state.AddressesApiRequest.error);
    const message = useSelector((state) => state.AddressesApiRequest.message);
    const isLoading = useSelector((state) => state.AddressesApiRequest.isLoading);

    // console.log(checkoutInfo)

    /**
     * @param {boolean} acceptPricingChange set only when the customer has just
     * confirmed a total the API computed after the cart moved. It is what lets
     * the retry past the pricing check; the totals still come from the server.
     */
    const handelPlaceOrder = async (acceptPricingChange = false, confirmedFinancials = null) => {
        const filteredProducts = checkoutInfo.products.map((product) => {
            return {
                productId: product.productId,
                quantity: product.quantity,
                priceAtOrderInCents: Number((product.productDetails.price * 100).toFixed(2)),
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
            idempotencyKey: idempotencyKey,
            items: filteredProducts,
            // Only the coupon travels; totals are recomputed by the API from
            // authoritative catalog prices, so this is a preview, not an order
            // amount the server trusts. A preview that no longer matches is
            // refused with the real totals rather than silently charged. Once the
            // customer confirms, the preview is the figure they agreed to.
            financials: confirmedFinancials || checkoutInfo.financials,
            ...(acceptPricingChange ? { acceptPricingChange: true } : {}),
            couponCode: checkoutInfo?.couponCode || "",
            shippingAddress: filteredShippingAddress,
            paymentMethod: paymentMethod,
            shippingInfo: {
                estimatedDeliveryDate: estimatedDeliveryDate
            },
        };

        const orderValidationRes = isOrderInfoValid(orderData)

        if (orderValidationRes.length !== 0) {
            toast.error(getErrorsMessage(orderValidationRes));
            return;
        }

        if (!IsUserLoggedIn()) {
            toast.error("Please log in or sign up with new account🙂");
            return;
        }

        setIsPlacingOrder(true);

        // The modal stays open until the outcome is known: closing it here used
        // to unmount this component while the request was in flight.
        const result = await dispatch(createCustomerOrderReducer({ orderData, clearCartAtEnd }));

        setIsPlacingOrder(false);

        if (createCustomerOrderReducer.fulfilled.match(result)) {
            const response = result.payload;

            if (response.needsConfirmation) {
                // No order was created. Ask before spending the attempt, and
                // keep the key so the retry is the same order.
                setPendingPricingChange({
                    financials: response.financials,
                    previewedTotalInCents: Number(checkoutInfo?.financials?.totalAmountInCents ?? 0),
                });
                return;
            }

            if (response.status) {
                // The order exists, so the next attempt is genuinely new.
                rotateCheckoutIdempotencyKey(customerId);
                handleCloseCheckoutModal();
                return;
            }
        }
    };

    /** Retry the same attempt with the confirmed, server-computed total. */
    const confirmPricingChange = async () => {
        const confirmed = pendingPricingChange.financials;
        setPendingPricingChange(null);
        await handelPlaceOrder(true, confirmed);
    };

    const cancelPricingChange = () => {
        setPendingPricingChange(null);
        toast("Order not placed. Nothing was charged.");
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
                bgcolor: "modalBgColor.main",
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
                            bgcolor: "sectionBgColor.main",
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
                                bgcolor: "sectionBgColor.main",
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
                            <Stack
                                className="flex-center"
                                sx={{
                                    fontSize: "13px",
                                    p: 1,
                                    borderRadius: "1.5625rem",
                                    border: `.0625rem solid ${theme.palette.primary.main}`,
                                    color: `${theme.palette.primary.main}`,
                                    gap: 1,
                                }}
                            >
                                <MonetizationOnRoundedIcon sx={{ fontSize: "30px" }} />
                                Cash on Delivery
                            </Stack>
                            <Typography fontSize={12} sx={{ mt: 1, opacity: 0.7 }}>
                                Card payment is not available yet, so only cash on delivery can be selected.
                            </Typography>
                        </Box>
                        {/*== payment ==*/}
                        <Button
                            onClick={handelPlaceOrder}
                            variant="contained"
                            disabled={isPlacingOrder}
                            sx={{ width: "100%", fontWeight: "bolder" }}
                        >
                            {isPlacingOrder ? "Placing your order..." : "place Order"}
                        </Button>
                    </Stack>
                    {/*== order invoice & payment ==*/}
                </Stack>
                {/*== order summary ==*/}

                {/*
                 The API refused this order because the authoritative total no
                 longer matches the preview above. Nothing was created, so this
                 states both figures before the attempt is spent, and the retry
                 reuses the same idempotency key.
                 */}
                {pendingPricingChange && (
                    <Box
                        role="alertdialog"
                        aria-label="Price changed"
                        sx={{
                            mt: 2,
                            p: 2,
                            borderRadius: "6px",
                            bgcolor: "sectionBgColor.main",
                            border: `.0625rem solid ${theme.palette.primary.main}`,
                        }}
                    >
                        <Typography sx={{ fontWeight: "bolder", mb: 1 }}>
                            The price changed before your order was placed
                        </Typography>
                        <Typography fontSize={13} sx={{ mb: 1 }}>
                            You reviewed a total of{" "}
                            <strong>
                                {currency}
                                {convertCentsToDollars(pendingPricingChange.previewedTotalInCents)}
                            </strong>
                            . The current price of this order is{" "}
                            <strong>
                                {pendingPricingChange.financials?.currency === "USD" ? "$" : pendingPricingChange.financials?.currency}
                                {convertCentsToDollars(pendingPricingChange.financials?.totalAmountInCents ?? 0)}
                            </strong>
                            , which is what the store will charge on delivery.
                        </Typography>
                        <Typography fontSize={13} sx={{ mb: 2, opacity: 0.75 }}>
                            Subtotal {convertCentsToDollars(pendingPricingChange.financials?.subtotalInCents ?? 0)}, discount{" "}
                            {convertCentsToDollars(pendingPricingChange.financials?.discount ?? 0)}, shipping{" "}
                            {Number(pendingPricingChange.financials?.shippingCostInCents ?? 0) === 0
                                ? "Free"
                                : convertCentsToDollars(pendingPricingChange.financials?.shippingCostInCents ?? 0)}
                            .
                        </Typography>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                            <Button
                                onClick={confirmPricingChange}
                                variant="contained"
                                disabled={isPlacingOrder}
                                sx={{ fontWeight: "bolder", flexGrow: 1 }}
                            >
                                Place order at the new total
                            </Button>
                            <Button onClick={cancelPricingChange} variant="outlined" sx={{ fontWeight: "bolder", flexGrow: 1 }}>
                                Cancel
                            </Button>
                        </Stack>
                    </Box>
                )}
            </Container>
        </Modal>
    );
}


