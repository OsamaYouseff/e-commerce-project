/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Stack, Typography, Button, Divider } from "@mui/material";

import { useEffect } from "react";
import { ColorModeContext } from "../../../Theme/theme";
import { useTheme } from "@emotion/react";
import { Link, useParams } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

/// custom component
import LoaderComponent from "../../GenericComponents/LoaderComponent/LoaderComponent";
import toast from 'react-hot-toast';


// redux
import { useSelector, useDispatch } from "react-redux";
import { getSpecificOrderForCustomerDetailedReducer } from "../../../redux/OrdersSlice/ApiOrdersSlice";
import { convertCentsToDollars, FormatDate, GetOrderMessage, GetStateColor, IsUserLoggedIn, } from "../../../General/GeneralFunctions";
import { SomeThingWrong } from "../../GenericComponents/SomeThingWrong/SomeThingWrong";

const orderChildrenStyle = {
    fontSize: {
        xs: "1rem",
        sm: "1.25rem",
    },
    width: { xs: "100%" },
    maxWidth: {
        xs: "100%",
        md: "18.75rem",
    },
    flexGrow: {
        xs: 1,
        md: 0,
    },
};

const OrderSummary = () => {
    const theme = useTheme(ColorModeContext);

    const { elementId } = useParams();
    const dispatch = useDispatch();


    const customerOrder = useSelector((state) => state.OrdersApiRequest.response);
    const isLoading = useSelector((state) => state.OrdersApiRequest.isLoading);
    const error = useSelector((state) => state.OrdersApiRequest.error);
    const shippingAddress = customerOrder?.shippingAddress;
    const currency = customerOrder?.financials?.currency === "USD" ? "$" : currency;


    useEffect(() => {
        if (IsUserLoggedIn())
            dispatch(getSpecificOrderForCustomerDetailedReducer(elementId));
        else toast.error("Please log in or sign up with new account🙂");
    }, []);


    const { orderStatus, message } = GetOrderMessage(
        customerOrder.status,
        FormatDate(customerOrder?.shippingInfo.estimatedDeliveryDate)
    );

    if (isLoading) return <LoaderComponent />;
    else if (error || !customerOrder) {
        return (
            <SomeThingWrong
                minHeight={"50vh"}
                errorMsg={
                    "Something went wrong 😢 We can not get your order summary information."
                }
            />
        );
    }

    return (
        <Box>
            {/* header */}

            <Box>
                <Link to="/userInfo/orders">
                    <Button
                        size="small"
                        sx={{ fontWeight: "bolder", mb: 2 }}
                        variant="outlined"
                    >
                        <ArrowBackIosIcon />
                        Back to orders
                    </Button>
                </Link>

                <Box sx={{ mb: 2, px: { xs: 0.5, md: 1 } }}>
                    <Typography
                        variant="h4"
                        sx={{
                            my: 0.5,
                            fontSize: {
                                xs: "1.375rem",
                                md: "1.625rem",
                                fontWeight: "bolder",
                            },
                        }}
                    >
                        Order summary
                    </Typography>
                    <Typography variant="body" sx={{ my: 1, fontSize: ".9375rem" }}>
                        Find order invoice, payment and shipping details here
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
                        xs: "column-reverse !important",
                        md: "row !important",
                    },
                    alignItems: {
                        xs: "center !important",
                        md: "flex-start !important",
                    },
                }}
            >
                {/* Order Details */}
                <Box
                    sx={{
                        minWidth: { xs: "100%", md: "60%" },
                        flexGrow: 1,
                        p: 2,
                        borderRadius: ".375rem",
                        bgcolor: theme.palette.sectionBgColor.main,
                    }}
                >
                    {/* order id & place date */}
                    <Box className="flex-column-center">
                        <Typography variant="h6">
                            Order ID : {customerOrder?._id.toUpperCase()}
                        </Typography>
                        <Typography variant="body">
                            Placed on {FormatDate(customerOrder?.createdAt)}
                        </Typography>
                    </Box>
                    {/*== order id & place date ==*/}

                    <Divider sx={{ my: 1 }} />

                    <Box>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Delivery Details
                        </Typography>
                        <Box
                            sx={{ fontSize: { xs: ".9375rem", sm: "1rem" } }}
                            mb={2}
                        >
                            <span
                                style={{
                                    fontWeight: "bold",
                                    color: GetStateColor(
                                        orderStatus.toLowerCase()
                                    ),
                                }}
                            >
                                {orderStatus}{" "}
                            </span>
                            <span>{message}</span>
                        </Box>

                        {customerOrder.items.map((item) => {
                            return (
                                <Stack
                                    key={item._id}
                                    className="flex-start-row"
                                    sx={{
                                        flexDirection: {
                                            xs: "column !important",
                                            md: "row !important",
                                        },
                                        mb: { xs: 2, sm: 2 },
                                    }}
                                    gap={4}
                                >
                                    <Box
                                        className="flex-row-start"
                                        // onClick
                                        sx={{
                                            gap: 2,
                                            flexGrow: 1,
                                            minWidth: {
                                                xs: "100%",
                                                md: "7.5rem",
                                            },
                                            transition: "all 0.35s ease",
                                            cursor: "pointer",
                                            border: ".0625rem solid transparent",
                                            "&:hover": {
                                                border: `.0625rem solid ${theme.palette.primary.main} `,
                                            },
                                            borderRadius: ".375rem",
                                            p: 1,
                                            justifyContent: "flex-start",
                                        }}
                                    >
                                        <Box
                                            className="flex-start"
                                            sx={{
                                                width: "6.875rem",
                                                // height: "6.875rem",
                                            }}
                                        >
                                            <img
                                                src={item.img}
                                                alt="product-img"
                                                style={{
                                                    maxWidth: "100%",
                                                    height: "100%",
                                                }}
                                            />
                                        </Box>
                                        <Box className="flex-column-center">
                                            <Typography sx={orderChildrenStyle}>
                                                {item.title + " "}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    ...orderChildrenStyle,
                                                    color: "#E91E63",
                                                }}
                                            >
                                                {
                                                    customerOrder?.financials
                                                        ?.currency
                                                }{" "}
                                                {(
                                                    item.priceAtOrderInCents /
                                                    100
                                                ).toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Stack>
                            );
                        })}
                    </Box>
                </Box>
                {/*== Order Details ==*/}

                {/* order invoice & payment & address */}
                <Stack
                    sx={{
                        width: {
                            xs: "100%",
                            md: "33%",
                        },
                        borderRadius: ".375rem",
                        overflow: "hidden",
                    }}
                >
                    {/* order invoice */}

                    <Box
                        sx={{
                            bgcolor: theme.palette.sectionBgColor.main,
                            p: 2,
                            mb: 1,
                        }}
                    >
                        <Typography variant="h6" mb={1}>
                            Order invoice
                        </Typography>
                        <Stack gap={0.5}>
                            <Typography className="flex-between" fontSize={14}>
                                <span>Subtotal</span>
                                <span>
                                    {currency}{" "}
                                    {convertCentsToDollars(
                                        customerOrder?.financials
                                            ?.subtotalInCents
                                    )}
                                </span>
                            </Typography>
                            <Typography className="flex-between" fontSize={14}>
                                <span>Shipping Cost</span>
                                <span>
                                    {currency}
                                    {convertCentsToDollars(
                                        customerOrder?.financials
                                            ?.shippingCostInCents
                                    )}
                                </span>
                            </Typography>
                            <Typography className="flex-between" fontSize={14}>
                                <span>Discount</span>
                                <span>
                                    - {currency}{" "}
                                    {convertCentsToDollars(
                                        customerOrder?.financials?.discount
                                    )}
                                </span>
                            </Typography>
                            <Divider />
                            <Typography className="flex-between" fontSize={16}>
                                <span>Order total</span>
                                <span>
                                    {currency}{" "}
                                    {convertCentsToDollars(
                                        customerOrder?.financials
                                            ?.totalAmountInCents
                                    )}
                                </span>
                            </Typography>
                        </Stack>
                    </Box>
                    {/*== order invoice ==*/}

                    {/* order payment */}
                    <Box
                        sx={{
                            bgcolor: theme.palette.sectionBgColor.main,
                            p: 2,
                            mb: 1,
                        }}
                    >
                        <Typography variant="h6" mb={1}>
                            Payment
                        </Typography>
                        <Stack gap={0.5}>
                            <Typography className="flex-between" fontSize={14}>
                                <span>Payment Method</span>
                                <span>{customerOrder.paymentMethod}</span>
                            </Typography>
                            <Typography className="flex-between" fontSize={14}>
                                <span>Payment Status</span>
                                <span>
                                    {customerOrder.status === "delivered"
                                        ? "✅Paid"
                                        : "⏱︎Unpaid"}
                                </span>
                            </Typography>
                        </Stack>
                    </Box>
                    {/*== order payment ==*/}

                    {/* Address info */}
                    <Box
                        sx={{
                            bgcolor: theme.palette.sectionBgColor.main,
                            p: 2,
                        }}
                    >
                        <Typography variant="h6">Delivery address</Typography>
                        <Typography sx={{ fontSize: "1.25rem" }}>
                            ({shippingAddress?.label})
                        </Typography>
                        <Stack sx={{ gap: 0.5, fontSize: 15 }}>
                            <span>
                                {shippingAddress?.firstName +
                                    " " +
                                    shippingAddress?.lastName}{" "}
                            </span>
                            <span>{shippingAddress?.fullAddress}</span>
                            <span>{shippingAddress?.phoneNumber}</span>
                        </Stack>
                    </Box>
                    {/*== Address info ==*/}
                </Stack>
                {/*== order invoice & payment & address ==*/}
            </Stack>
            {/*== order summary ==*/}
        </Box>
    );
};

export default OrderSummary;
