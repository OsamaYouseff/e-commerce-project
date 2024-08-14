/* eslint-disable react/prop-types */
import { Stack, Box, Typography } from "@mui/material";
import { ColorModeContext } from "../../../Theme/theme.jsx";

//// hooks
import { useTheme } from "@mui/material/styles";
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
    const theme = useTheme(ColorModeContext);

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
            toast.error("Adding to local state soon");
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
            toast.error("Adding to local state soon");
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
                        borderRadius: "5px",
                        boxShadow: 1,
                        gap: { xs: 2, sm: 1 },
                        transition: "all 0.3s ease",
                        border: "1px solid transparent",
                        "&:hover": {
                            bgcolor: theme.palette.sectionBgColor.main,
                            borderColor: theme.palette.primary.main,
                        }
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
                            // maxHeight: "100px",
                            cursor: "pointer",
                            gap: { xs: 1, sm: 2 },
                            flexDirection: {
                                xs: "column !important",
                                md: "row !important"
                            },
                            alignItems: "center ",
                        }}
                    >
                        <img
                            style={{
                                minWidth: "100px",
                                maxWidth: "100px",
                                maxHeight: "100px",
                                borderRadius: "5px",
                            }}
                            src={item.img}
                            alt="cart-item"
                        />
                        <Typography
                            sx={{
                                fontSize: { xs: "14px", sm: "18px" },
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
                                fontSize: { xs: "20px", sm: "18px" },

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

                                fontSize: "22px",
                                fontWeight: "bolder",
                                width: {
                                    xs: "auto", sm: "22%",
                                },
                                color: "#ff4450",
                                gap: "3px",
                            }}
                        >
                            <Typography
                                sx={{
                                    display: { xs: "block", sm: "none" },
                                    fontWeight: "bolder",
                                    fontSize: "inherit",
                                    color: theme.palette.primary.main,
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
                            borderRadius: "5px",
                            bgcolor: theme.palette.sectionBgColor.main,
                            border: "1px solid transparent",
                            // borderBottomColor: `${theme.palette.footerBgColor.primary} `,
                            boxShadow: 1,
                            transition: "all 0.3s ease",
                            "&:hover": {
                                bgcolor: theme.palette.sectionBgColor.main,
                                borderColor: theme.palette.primary.main,
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
                                width: "90px",
                                maxHeight: "100%",
                                cursor: "pointer",
                            }}
                        >
                            <img
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "90px",
                                    borderRadius: "5px",
                                }}
                                src={item.img}
                                alt="cart-item"
                            />
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                flex: 1,
                                flexDirection: "column",
                            }}
                            justifyContent={"space-between"}
                        >
                            <Stack direction="row" justifyContent={"space-between"}>
                                <Typography
                                    sx={{ fontSize: "16px", maxWidth: "155px" }}
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
                            >

                                <ControlProductAmount
                                    fieldQuantity={fieldQuantity}
                                    setFieldQuantity={setFieldQuantity}
                                    handleClickIncreaseDecrease={handleClickIncreaseDecrease}
                                    quantity={quantity}
                                />

                                <DeleteBtn handleDeleteProduct={handleDeleteProduct} />
                            </Stack>
                        </Box>
                    </Stack>
                </AnimatePresence>
            );
        }
    }
};


export default ItemComponent;
