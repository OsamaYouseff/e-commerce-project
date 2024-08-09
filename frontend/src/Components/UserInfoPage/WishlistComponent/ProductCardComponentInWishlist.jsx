/* eslint-disable react/prop-types */
import { Box, Stack, Typography } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
// import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import { motion, AnimatePresence } from "framer-motion";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";

/// Icons
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import { useState } from "react";

/// redux
import { useDispatch } from "react-redux";
import { removeProductFromWishlistReducer } from "../../../redux/WishlistSlice/ApiWishlistSlice";

const favIconStyle = {
    px: 0.6,
    py: 0.5,
    border: "1px solid",
    borderRadius: "6px",
};
const ProductCardComponentInWishlist = ({
    productData,
    handelOpenModal,
    handleSetPreviewedProduct,
}) => {
    const dispatch = useDispatch();
    const handelAddToCart = () => {
        // dispatch(
        //     addUpdateProductInCartReducer({
        //         productId: productData._id,
        //         quantity: 1,
        //         price: productData.price,
        //     })
        // );
    };

    const [inWishlist, setInWishlist] = useState(true);

    const handelInWishlist = () => {
        setInWishlist(!inWishlist);
    };
    const handelRemoveFromWishlist = async () => {
        await dispatch(
            removeProductFromWishlistReducer({ productId: productData._id })
        );
    };

    if (!productData) {
        return null;
    } else {
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
                            xl: 250,
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
                            height: "175px",
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
                            px: 1.5,
                            pt: 1.5,
                            pb: 0.5,
                        }}
                    >
                        <Typography
                            gutterBottom
                            fontSize={"20px"}
                            component="div"
                        >
                            {productData.title.slice(0, 30)}
                        </Typography>

                        <Stack className="flex-between">
                            <Typography
                                fontSize={"18px"}
                                component="div"
                                color={"crimson"}
                                fontWeight={"bold"}
                            >
                                ${productData.price}
                            </Typography>
                            <Rating
                                name="read-only"
                                value={productData.rating}
                                readOnly
                                size="small"
                                precision={0.5}
                            />
                        </Stack>
                    </CardContent>
                    <Stack
                        sx={{ px: 1.4, py: 2, bgcolor: "inherit" }}
                        direction={"row"}
                        justifyContent={"space-between"}
                        alignItems={"center"}
                    >
                        <Button
                            size="small"
                            sx={{ fontSize: "14px", fontWeight: "bolder" }}
                            onClick={() => {
                                handelAddToCart();
                            }}
                            variant="outlined"
                        >
                            <AddShoppingCartOutlinedIcon
                                sx={{
                                    marginRight: "5px",
                                    fontSize: "20px",
                                }}
                            />
                            Add To Cart
                        </Button>
                        <Box
                            onClick={() => {
                                handelInWishlist();
                                handelRemoveFromWishlist();
                            }}
                            className="flex-center"
                            sx={{
                                cursor: "pointer",
                            }}
                        >
                            {inWishlist === false ? (
                                <Box
                                    className="flex-center"
                                    sx={favIconStyle}
                                    color={"primary.main"}
                                >
                                    <FavoriteBorderRoundedIcon />
                                </Box>
                            ) : (
                                <Box
                                    className="flex-center"
                                    sx={favIconStyle}
                                    color={"#E91E63"}
                                >
                                    <FavoriteRoundedIcon />
                                </Box>
                            )}
                        </Box>
                    </Stack>
                </Card>
            </AnimatePresence>
        );
    }
};

export default ProductCardComponentInWishlist;
