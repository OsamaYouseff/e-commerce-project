/* eslint-disable react/prop-types */
import { Box, Stack, Typography } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
// import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import { motion, AnimatePresence } from "framer-motion";

/// Icons
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import { useDispatch } from "react-redux";
import { addUpdateProductInCartReducer } from "../../redux/CartSlice/ApiCartSlice";
import { IsUserLoggedIn } from "../../General/GeneralFunctions";

import toast from 'react-hot-toast';
import { useTheme } from "@emotion/react";
import { ColorModeContext } from "../../Theme/theme";


const ProductCardComponent = ({
    productData,
    handelOpenModal,
    handleSetPreviewedProduct,
}) => {
    const dispatch = useDispatch();
    const theme = useTheme(ColorModeContext);


    const handelAddToCart = () => {
        if (IsUserLoggedIn()) {
            dispatch(
                addUpdateProductInCartReducer({
                    productId: productData._id,
                    quantity: 1,
                    price: productData.price,
                })
            );
        } else {
            toast.error("Please log in or sign up with new account to do this action🙂");
        }
    };

    return (
        <AnimatePresence>
            <Card
                component={motion.section}
                layout
                initial={{ transform: "scale(0)" }}
                animate={{ transform: "scale(1)" }}
                exit={{ transform: "scale(0)" }}
                transition={{
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100,
                }}
                sx={{
                    flexGrow: 1,
                    maxWidth: {
                        xs: "100%",
                        sm: "48%",
                        md: "32%",
                        lg: "24%",
                        xl: 275,
                    },
                    boxShadow: 3,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
            >

                <Box
                    onClick={() => {
                        handleSetPreviewedProduct(productData);
                        handelOpenModal();
                    }}
                    sx={{
                        backgroundImage: `url(${productData.img})`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "contain",
                        height: "15.3125rem",
                        width: "100%",
                        cursor: "pointer",
                        transition: "transform 0.35s ease-in-out",
                        "&:hover": { transform: "scale(1.03) " },
                    }}
                ></Box>
                <CardContent
                    sx={{
                        position: "relative",
                        zIndex: "100 !important",
                        bgcolor: "inherit",
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    <Stack
                        direction={"row"}
                        justifyContent={"space-between"}
                        alignItems={"center"}
                    >
                        <Typography
                            gutterBottom
                            fontSize={"1.125rem"}
                            component="div"
                        >
                            {productData.title.slice(0, 20)}...
                        </Typography>
                        <Typography
                            gutterBottom
                            fontSize={"1rem"}
                            component="div"
                            sx={{ color: "specialText2.main" }}
                        >
                            ${productData.price}
                        </Typography>
                    </Stack>
                    <Typography fontSize={"1rem"} color="text.secondary">
                        {productData.desc.slice(0, 120)}..
                    </Typography>
                </CardContent>
                <Stack
                    sx={{ p: 1.4, bgcolor: "inherit" }}
                    direction={"row"}
                    justifyContent={"space-between"}
                    alignItems={"center"}
                >
                    <Button
                        size="small"
                        sx={{ fontSize: ".875rem", fontWeight: "bolder" }}
                        onClick={() => {
                            handelAddToCart();
                        }}
                        variant="outlined"
                    >
                        <AddShoppingCartOutlinedIcon
                            sx={{
                                marginRight: ".3125rem",
                                fontSize: "1.25rem",
                            }}
                        />
                        Add To Cart
                    </Button>
                    <Rating
                        name="read-only"
                        value={productData.rating}
                        readOnly
                        size="small"
                        precision={0.5}
                    />
                </Stack>
            </Card>
        </AnimatePresence>
    );
};

export default ProductCardComponent;
