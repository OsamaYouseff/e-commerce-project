/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Stack, Typography, Button, Divider } from "@mui/material";
import { Link, useParams } from "react-router-dom";

//// Hooks
import { useEffect, useState } from "react";
import { ColorModeContext } from "../../../Theme/theme";
import { useTheme } from "@emotion/react";

/// icons
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

/// custom component
import LoaderComponent from "../../GenericComponents/LoaderComponent/LoaderComponent";
import { SomeThingWrong } from "../../GenericComponents/SomeThingWrong/SomeThingWrong";
import toast from 'react-hot-toast';
import ConfirmComponent from "../../GenericComponents/ConfirmComponent/ConfirmComponent";


// redux
import { getSpecificOrderForCustomerDetailedReducer, deleteOrderReducer, updateOrderStatusReducer } from "../../../redux/OrdersSlice/ApiOrdersSlice";
import { useSelector, useDispatch } from "react-redux";

///// GENERAL VARIABLES & FUNCTIONS
import { convertCentsToDollars, FormatDate, GetNextStatus, GetOrderMessage, GetStatusColor, IsUserLoggedIn, } from "../../../General/GeneralFunctions";
import { orderStatuses } from "../../../General/GeneralVariables";

const orderChildrenStyle = {
    fontSize: {
        xs: "1rem",
        sm: "16px",
    },
    maxWidth: "100%",
    flexGrow: 1
};


let operationType = "cancel";
let enableMessage = "Are you sure you want to enable this product again?"
let disableMessage = "Are you sure you want to disable this product? i won't appear in your store."
const OrderSummary = () => {
    const theme = useTheme(ColorModeContext);

    const { elementId } = useParams();
    const dispatch = useDispatch();

    const customerOrder = useSelector((state) => state.OrdersApiRequest.response);
    const isLoading = useSelector((state) => state.OrdersApiRequest.isLoading);
    const error = useSelector((state) => state.OrdersApiRequest.error);
    const shippingAddress = customerOrder?.shippingAddress;
    const currency = customerOrder?.financials?.currency === "USD" ? "$" : currency;

    const actionButtonsStyles = {
        display: (customerOrder.status === "delivered" || customerOrder.status === "canceled") ? "none" : "block",
        fontWeight: "bolder",
        color: "white"
    }
    const currentStatusIndex = orderStatuses.findIndex((status) => status === customerOrder.status);

    //// Confirm Component
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const handleClickOpenConfirmDialog = () => setOpenConfirmDialog(true);
    const handleCloseConfirmDialog = () => setOpenConfirmDialog(false);
    let [modelText, setModelText] = useState({
        actionName: "",
        message: ""
    });


    // console.log(currentStatusIndex)

    const handelOrderStatus = () => {

        switch (operationType) {
            case "update":
                if (currentStatusIndex === 3) {
                    toast.error("You can't update this order as it's status is already " + customerOrder.status)
                    return;
                }
                if (currentStatusIndex >= 0 && currentStatusIndex < 2) {
                    dispatch((updateOrderStatusReducer(
                        {
                            orderId: customerOrder._id,
                            orderStatus: GetNextStatus(customerOrder.status)
                        }
                    )))
                }
                break;
            case "cancel":
                if (currentStatusIndex === 3) {
                    toast.error("You can't cancel this order as it's status is already " + customerOrder.status)
                    return;
                }
                dispatch((deleteOrderReducer(customerOrder._id)))
                break;
            default:
                break;
        }

        // if (IsUserLoggedIn() && ableToCancelOrder) {
        //     //// switch
        // }

    }



    useEffect(() => {
        dispatch(getSpecificOrderForCustomerDetailedReducer(elementId));
        // if (IsUserLoggedIn())
        // dispatch(getSpecificOrderForCustomerDetailedReducer(elementId));
        // else toast.error("Please log in or sign up with new account🙂");
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
        <Box py={1}>
            {/* header */}
            <Box sx={{ px: 1 }}>
                <Link to="/orders">
                    <Button
                        size="small"
                        sx={{ fontWeight: "bolder", mb: 2 }}
                        variant="outlined"
                    >
                        <ArrowBackIosIcon />
                        Back to orders
                    </Button>
                </Link>
                <Box className="flex-between" sx={{ flexWrap: "wrap", gap: 2, mb: 1 }}>

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


                    <Box className="flex-between" sx={{ gap: { xs: 1, md: 2, lg: 3 } }}>

                        <Button variant="contained" size="small"
                            color="error"
                            sx={actionButtonsStyles}
                            onClick={() => {
                                operationType = "cancel"
                                setModelText({
                                    actionName: "Cancel Order",
                                    message: "Are you sure you want to cancel this order?"
                                })
                                handleClickOpenConfirmDialog()

                            }}
                        >
                            Cancel Order
                        </Button>

                        <Button variant="contained" size="small"
                            onClick={() => {
                                operationType = "update"
                                setModelText({
                                    actionName: "Update Order Status",
                                    message: "Are you sure you want to Update this order's status?"
                                })
                                handleClickOpenConfirmDialog()

                            }}
                            sx={{
                                ...actionButtonsStyles,
                                bgcolor: GetStatusColor(orderStatuses[currentStatusIndex + 1]),
                            }} >
                            {orderStatuses[currentStatusIndex + 1]} step
                        </Button>
                    </Box>
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
                    p: 1
                }}
            >
                {/* Order Details */}
                <Box
                    sx={{
                        minWidth: { xs: "100%", md: "60%" },
                        flexGrow: 1,
                        p: 2,
                        borderRadius: ".375rem",
                        bgcolor: theme.palette.bgColor.main,
                        boxShadow: 1,
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
                                    color: GetStatusColor(
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
                                    }}

                                >
                                    <Box
                                        className="flex-center"
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
                                            p: 0.5,
                                            justifyContent: "flex-start",
                                            mb: 1
                                        }}
                                    >
                                        <Box
                                            className="flex-center"
                                            sx={{
                                                width: "80px",
                                                // height: "6.875rem",
                                            }}
                                        >
                                            <img
                                                src={item.img}
                                                alt="product-img"
                                                style={{
                                                    maxWidth: "100%",
                                                    maxHeight: "50px",
                                                }}
                                            />
                                        </Box>
                                        <Box className="flex-between" sx={{ gap: 2, flexWrap: "wrap" }}>
                                            <Typography sx={{ orderChildrenStyle }}>
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
                            md: "50%",
                            lg: "33%",
                        },
                        borderRadius: ".375rem",
                        overflow: "hidden",
                        boxShadow: 1,

                    }}
                >
                    {/* order invoice */}

                    <Box
                        sx={{
                            bgcolor: theme.palette.bgColor.main,
                            p: 2,
                            mb: 1,
                            boxShadow: 1,

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
                            bgcolor: theme.palette.bgColor.main,
                            p: 2,
                            mb: 1,
                            boxShadow: 1,

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
                            bgcolor: theme.palette.bgColor.main,
                            p: 2,
                            boxShadow: 1,

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

            {
                openConfirmDialog && <ConfirmComponent
                    openConfirmDialog={openConfirmDialog}
                    confirmAction={handelOrderStatus}
                    handleCloseConfirmDialog={handleCloseConfirmDialog}
                    message={modelText?.message}
                    actionName={modelText?.actionName}
                />
            }
        </Box >
    );
};

export default OrderSummary;
