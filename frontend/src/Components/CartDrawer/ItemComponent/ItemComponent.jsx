/* eslint-disable react/prop-types */
import { Stack, Box, Typography } from "@mui/material";

//// hooks
import { useState } from "react";

//// custom components
import ControlProductAmount from "./ControlProductAmount.jsx";
import DeleteBtn from "./DeleteBtn.jsx";
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";


//// general functions
import { IsUserLoggedIn } from "../../../General/GeneralFunctions.js";

///// redux
import { useDispatch, useSelector } from "react-redux";
import { addUpdateProductInCartReducer, removeProductFromCartReducer } from "../../../redux/CartSlice/ApiCartSlice.js";

const ItemComponent = ({ item, quantity, withDetails = false, handelOpenModal, handleSetPreviewedProduct, }) => {
    //// state
    const [fieldQuantity, setFieldQuantity] = useState(quantity);

    //// redux
    const dispatch = useDispatch();
    const isLoading = useSelector((state) => state.CartApiRequest.isLoading);

    //// handlers
    function handleClickIncreaseDecrease(type, targetQuantity = quantity) {
        /// prevent request if the quantity doesn't changed
        if (fieldQuantity === +targetQuantity && type === "CHANGE_QUANTITY")
            return;

        if (!IsUserLoggedIn()) {
            toast.error("Please log in or sign up with new account to do this action🙂");
            return;
        }

        if (isLoading) return; //// prevent user form doing many requests at the same time

        let targetProduct = {
            productId: item._id,
            quantity: targetQuantity,
            price: item.price,
        };
        if (type === "INCREASE_QUANTITY") {
            targetProduct.quantity += 1;
            dispatch(addUpdateProductInCartReducer(targetProduct));
        } else if (type === "CHANGE_QUANTITY") {
            targetProduct.quantity = targetQuantity;
            dispatch(addUpdateProductInCartReducer(targetProduct));
        } else {
            if (targetQuantity === 1) return;
            targetProduct.quantity -= 1;
            dispatch(addUpdateProductInCartReducer(targetProduct));
        }
    }

    function handleDeleteProduct() {
        if (!IsUserLoggedIn()) {
            toast.error("Please log in or sign up with new account to do this action🙂");
            return;
        } else {
            if (isLoading) return; //// prevent user form doing many requests at the same time
            dispatch(
                removeProductFromCartReducer({
                    productId: item._id,
                    price: item.price,
                })
            );
        }
    }

    if (!item) {
        return <></>;
    } else {
        if (withDetails) {
            return (
                <Stack
                    key={item._id}
                    direction="row"
                    justifyContent={"space-between"}
                    alignItems={"center"}
                    sx={{
                        px: { xs: 0, sm: 2 },
                        py: { xs: 1, sm: 2 },
                        mb: 1,
                        borderRadius: ".3125rem",
                        boxShadow: 1,
                        gap: { xs: 2, sm: 1 },
                        transition: "all 0.3s ease",
                        border: ".0625rem solid transparent",
                        "&:hover": {
                            bgcolor: "sectionBgColor.main",
                            borderColor: "primary.main",
                        },
                        overflowX: "hidden",
                    }}
                >
                    <Box
                        onClick={() => {
                            handleSetPreviewedProduct(item);
                            handelOpenModal();
                        }}
                        className="flex-between"
                        sx={{
                            width: { xs: "50%", sm: "34%" },
                            cursor: "pointer",
                            gap: { xs: 1, sm: 1 },
                            flexDirection: {
                                xs: "column !important",
                                md: "row !important"
                            },
                            alignItems: "center ",
                            justifyContent: { xs: "space-between", sm: "flex-start" },
                        }}
                    >
                        <Box className="flex-center" sx={{ maxWidth: "7.5rem", minWidth: { xs: "4.375rem", sm: "7.5rem" } }}>
                            <img
                                style={{
                                    minWidth: "4.375rem",
                                    maxWidth: "100%",
                                    maxHeight: "6.25rem",
                                    borderRadius: ".3125rem",
                                }}
                                src={item.img}
                                alt="cart-item"
                            />
                        </Box>
                        <Typography
                            sx={{
                                fontSize: { xs: ".9375rem", sm: "1.125rem" },
                                textAlign: { xs: "center", sm: "left" },
                            }}
                        >
                            {item.title}
                        </Typography>
                    </Box>

                    <Stack
                        gap={1}
                        sx={{
                            flexGrow: 1,
                            minHeight: "100%",
                            flexWrap: "wrap",
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: { xs: "flex-start", sm: "center" },
                            justifyContent: "space-between",
                        }}
                    >

                        <Typography
                            sx={{
                                width: { xs: "auto%", sm: "20%" },
                                fontWeight: "bold",
                                textAlign: "center",
                                fontSize: { xs: "1.25rem", sm: "1.125rem" },

                            }}
                        >
                            ${item.price}
                        </Typography>


                        <Box
                            sx={{ width: { xs: "auto%", sm: "43%" } }}
                        >
                            <ControlProductAmount
                                fieldQuantity={fieldQuantity}
                                setFieldQuantity={setFieldQuantity}
                                handleClickIncreaseDecrease={handleClickIncreaseDecrease}
                                quantity={quantity}
                            />

                        </Box>

                        <Box
                            className="flex-center"
                            sx={{

                                fontSize: "1.1875rem",
                                fontWeight: "bolder",
                                width: {
                                    xs: "auto", sm: "22%",
                                },
                                color: "specialText2.main",
                                gap: ".1875rem",
                            }}
                        >
                            <Typography
                                sx={{
                                    display: { xs: "block", sm: "none" },
                                    fontWeight: "bolder",
                                    fontSize: "inherit",
                                    color: "primary.main",
                                }}
                            >
                                Total {" "}
                            </Typography>
                            ${(quantity * item.price).toFixed(2)}
                        </Box>

                        <DeleteBtn handleDeleteProduct={handleDeleteProduct} />
                    </Stack>
                </Stack >
            );
        } else {
            return (
                <AnimatePresence>
                    <Stack
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
                        key={item._id}
                        direction="row"
                        gap={1}
                        justifyContent={"space-between"}
                        sx={{
                            p: 1.2,
                            mb: 1,
                            borderRadius: ".3125rem",
                            bgcolor: "sectionBgColor.main",
                            border: ".0625rem solid transparent",
                            boxShadow: 1,
                            transition: "all 0.3s ease",
                            "&:hover": {
                                bgcolor: "sectionBgColor.main",
                                borderColor: "primary.main",
                            }
                        }}
                    >
                        <Box
                            onClick={() => {
                                handleSetPreviewedProduct(item);
                                handelOpenModal();
                            }}
                            className="flex-center"
                            sx={{
                                width: "5.625rem",
                                maxHeight: "100%",
                                cursor: "pointer",
                            }}
                        >
                            <Box className="flex-center" sx={{ maxWidth: "6.875rem", minWidth: { xs: "3.75rem", sm: "4.375rem" } }}>
                                <img
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: "5.625rem",
                                        borderRadius: ".3125rem",
                                    }}
                                    src={item.img}
                                    alt="cart-item"
                                />
                            </Box>

                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                flex: 1,
                                flexDirection: "column",
                                gap: 1,
                                maxWidth: "75%"
                            }}
                            justifyContent={"space-between"}
                        >
                            <Stack direction="row" justifyContent={"space-between"}>
                                <Typography
                                    sx={{ fontSize: "1.0625rem", maxWidth: "9.6875rem" }}
                                >
                                    {item.title.slice(0, 20)}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontWeight: "bolder",
                                        color: "#ff4450",
                                    }}
                                >
                                    ${item.price}
                                </Typography>
                            </Stack>
                            <Stack
                                direction="row"
                                gap={2}
                                justifyContent={"space-between"}
                                sx={{
                                    maxWidth: "80%"
                                }}
                            >

                                <ControlProductAmount
                                    fieldQuantity={fieldQuantity}
                                    setFieldQuantity={setFieldQuantity}
                                    handleClickIncreaseDecrease={handleClickIncreaseDecrease}
                                    quantity={quantity}
                                />

                                <DeleteBtn sx={{ flex: 1 }} handleDeleteProduct={handleDeleteProduct} />
                            </Stack>
                        </Box>
                    </Stack>
                </AnimatePresence>
            );
        }
    }
};


export default ItemComponent;
