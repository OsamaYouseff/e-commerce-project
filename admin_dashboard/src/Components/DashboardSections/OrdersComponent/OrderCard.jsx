/* eslint-disable react/prop-types */
import { Box, Button, Stack, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import { ColorModeContext } from "../../../Theme/theme";
import { FormatDate, GetOrderMessage, GetStatusColor, IsUserLoggedIn } from "../../../General/GeneralFunctions";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

//// custom Components
import ConfirmComponent from "../../GenericComponents/ConfirmComponent/ConfirmComponent";


import { useDispatch } from "react-redux";
import { deleteOrderReducer, updateOrderStatusReducer } from "../../../redux/OrdersSlice/ApiOrdersSlice.js"


let operationType = "cancel";
let enableMessage = "Are you sure you want to enable this product again?"
let disableMessage = "Are you sure you want to disable this product? i won't appear in your store."

const OrderCard = ({ order }) => {
    const theme = useTheme(ColorModeContext);
    const { orderStatus, message } = GetOrderMessage(order.status, FormatDate(order.estimatedDeliveryDate));
    const ableToCancelOrder = order.status === "pending" || order.status === "processing"


    //// Confirm Component
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const handleClickOpenConfirmDialog = () => setOpenConfirmDialog(true);
    const handleCloseConfirmDialog = () => setOpenConfirmDialog(false);
    let [modelText, setModelText] = useState({
        actionName: "",
        message: ""
    });


    const dispatch = useDispatch();

    const handelOrderStatus = () => {

        switch (operationType) {
            case "update":
                dispatch((updateOrderStatusReducer(order.orderId)))
                break;
            case "cancel":
                dispatch((deleteOrderReducer(order.orderId)))
                break;
            default:
                break;
        }

        // if (IsUserLoggedIn() && ableToCancelOrder) {
        //     //// switch
        // }

    }
    return (
        <AnimatePresence>
            <Box
                component={motion.section}
                layout
                initial={{ transform: "scale(0)" }}
                animate={{ transform: "scale(1)" }}
                exit={{ transform: "scale(1)" }}
                transition={{
                    duration: 0.35,
                    type: "tween",
                    stiffness: 40,
                }}
                key={order.orderId}
                sx={{
                    bgcolor: theme.palette.natural.main,
                    px: { xs: 2, sm: 3 },
                    pt: 2,
                    pb: 2,
                    borderRadius: ".375rem",
                    boxShadow: 1,
                    transition: "all 0.45s ease",
                    border: `.0625rem solid transparent`,
                    "&:hover": {
                        border: `.0625rem solid ${theme.palette.primary.main}`,
                    },
                }}
            >
                <Box sx={{ fontSize: { xs: ".9375rem", sm: "1.0625rem" } }} mb={2}>
                    <span
                        style={{
                            fontWeight: "bold",
                            color: GetStatusColor(orderStatus.toLowerCase()),
                        }}
                    >
                        {" [ "}{orderStatus}{" ] - "}
                    </span>
                    <span>{message}</span>
                </Box>

                {/* item boxes */}
                {order.items.map((item) => {
                    return (
                        <Stack
                            key={item._id}
                            className="flex-start-row"
                            sx={{
                                flexDirection: {
                                    xs: "column !important",
                                    md: "row !important",
                                },
                                mb: { xs: 2, sm: 3 },
                            }}
                            gap={4}
                        >
                            <Box
                                className="flex-row-start"
                                // onClick
                                sx={{
                                    gap: 2,
                                    flexGrow: 1,
                                    minWidth: { xs: "100%", md: "7.5rem" },
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
                                <img
                                    src={item.img}
                                    alt="product-img"
                                    style={{ maxWidth: "6.25rem" }}
                                />
                                <Typography
                                    sx={{
                                        fontSize: { xs: ".9375rem", sm: "1.3125rem" },
                                        width: { xs: "100%" },
                                        maxWidth: { xs: "100%", md: "18.75rem" },
                                        flexGrow: 1,
                                    }}
                                >
                                    {(item.title + "")}
                                </Typography>
                            </Box>

                            {order.status === "delivered" ? (
                                <Box
                                    sx={{
                                        gap: 2,
                                        borderLeft: ".0625rem solid grey",
                                        pl: 1,
                                        width: "100%",
                                        maxWidth: {
                                            xs: "100%",
                                            md: "60%",
                                        },
                                    }}
                                >
                                    <Typography fontSize={".9375rem"}>
                                        Share your shopping experience
                                    </Typography>
                                    <Stack direction={"row"} gap={2} sx={{ mt: 1 }}>
                                        <Button sx={{ flexGrow: 1 }}>SELLER</Button>
                                        <Button sx={{ flexGrow: 1 }}>
                                            PRODUCT
                                        </Button>
                                        <Button sx={{ flexGrow: 1 }}>
                                            DELIVERY
                                        </Button>
                                    </Stack>
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        textAlign: "start",
                                        borderLeft: ".0625rem solid grey",
                                        p: 2,
                                        width: {
                                            xs: "100%",
                                            md: "60%",
                                        },
                                    }}
                                >
                                    You can share your shopping experience after
                                    delivering the order
                                </Box>
                            )}
                        </Stack>
                    );
                })}
                {/*== item boxes ==*/}

                <Stack
                    className="flex-between"
                    sx={{
                        fontSize: ".75rem",
                        textAlign: "right",
                        flexDirection: {
                            xs: "column-reverse !important",
                            sm: "row !important",
                        },
                        gap: 1,
                    }}
                >
                    <Box className="flex-between" gap={2}>
                        <Link to={`/userInfo/order-summary/${order.orderId}`}>
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{
                                    fontWeight: "bold",
                                    width: {
                                        xs: "100% !important",
                                        sm: "fit-content !important",
                                    },
                                }}
                            >
                                More details
                            </Button>
                        </Link>
                        <Button sx={{ display: ableToCancelOrder ? "block" : "none" }}
                            variant="outlined" size="small" color="error"
                            onClick={handleClickOpenConfirmDialog}
                        >Cancel order</Button>
                    </Box>
                    <Typography>
                        Order ID :{" "}
                        <span>{order.orderId?.slice(0, 20).toUpperCase()}</span>
                    </Typography>
                </Stack>
                {
                    openConfirmDialog && <ConfirmComponent
                        openConfirmDialog={openConfirmDialog}
                        confirmAction={handelOrderStatus}
                        handleCloseConfirmDialog={handleCloseConfirmDialog}
                        message="Are you sure you want to cancel this Order?"
                    />
                }
            </Box>
        </AnimatePresence>
    );
};

export default OrderCard;
