/* eslint-disable react/prop-types */
import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../../Theme/theme";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { useEffect, useState } from "react";
// import ToggleButton from "@mui/material/ToggleButton";
// import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

/// Icons
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import toast from 'react-hot-toast';

///// redux
import { useDispatch, useSelector } from "react-redux";
import { addUpdateProductInCartReducer } from "../../../redux/CartSlice/ApiCartSlice.js";
import {
    addProductToWishlistReducer,
    removeProductFromWishlistReducer,
} from "../../../redux/WishlistSlice/ApiWishlistSlice";
import { CalcTotalCartPrice, IsUserLoggedIn } from "../../../General/GeneralFunctions.js";

import { isProductInWishlist } from "../../../API/WishlistAPIFunctions.js";
import CompleteCheckoutModal from "../../CartPage/CompleteCheckoutModal/CompleteCheckoutModal.jsx";
import { Link } from "react-router-dom";

//// styles
const CloseBtnStyles = {
    position: "absolute",
    top: { xs: "5px", md: "15px" },
    right: { xs: "5px", md: "15px" },
    fontSize: "55px",
    width: "45px",
    height: "45px",
    cursor: "pointer",
    borderRadius: "50%",
    p: 1,
    "&:hover": {
        transform: "rotate(180deg)",
        color: "#ff6e6e",
        borderColor: "#ff6e6e",
    },
    transition: "0.35s",
};
const modalStyles = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    flexDirection: { xs: "column", md: "row" },
    gap: { xs: 1, md: 4 },
    justifyContent: { sx: "center", md: "space-between" },
};
const favIconStyle = {
    px: 0.6,
    py: 0.5,
    border: "1px solid",
    borderRadius: "6px",
    width: "100%",
};
const fontSizeClamp = "clamp(20px,calc(24px + (32 - 15) * (100vw - 1000px) / (1920 - 1000)),32px) !important";

//// custom component
const WishlistIcon = ({ title, color, favIconStyle, icons, handler }) => {
    return (
        <Box
            className="flex-center"
            sx={favIconStyle}
            color={color}
            onClick={() => handler()}
        >
            <Typography
                sx={{
                    fontWeight: "bold",
                    mr: 1,
                    display: {
                        sx: "block",
                        md: "none",
                    },
                }}
            >
                {title}
            </Typography>
            {icons}
        </Box>
    );
};


let checkoutInfo;

// eslint-disable-next-line react/prop-types
const ProductDetails = ({ PreviewedProduct, handleCloseModal, open }) => {
    const theme = useTheme(ColorModeContext);
    const productImg = PreviewedProduct?.img;

    const dispatch = useDispatch();
    const [inWishlist, setInWishlist] = useState(false);
    const error = useSelector((state) => state.WishlistApiRequest.error);

    // console.log(PreviewedProduct)


    ///// complete checkout modal
    const [openCheckoutModal, setOpenCheckoutModal] = useState(false);
    const handleOpenCheckoutModal = () => setOpenCheckoutModal(true);
    const handleCloseCheckoutModal = () => setOpenCheckoutModal(false);

    const handelBuyNow = () => {

        if (!IsUserLoggedIn()) {
            toast.error("Please log in or sign up with new account🙂");
            return;
        }

        const productPrice = PreviewedProduct.price;
        let { finalPrice, shippingCalc } = CalcTotalCartPrice(productPrice);

        checkoutInfo = {
            products: [
                {
                    productId: PreviewedProduct._id,
                    quantity: 1,
                    productDetails: PreviewedProduct,
                }
            ],
            financials: {
                subtotalInCents: Math.round(productPrice * 100),
                discount: 0,
                shippingCostInCents: Math.round(shippingCalc * 100),
                totalAmountInCents: Math.round(finalPrice * 100),
                currency: "USD",
            }
        }
        // console.log("############ : ", checkoutInfo);
        handleOpenCheckoutModal();

    }


    const handleClickAddToCart = () => {
        if (IsUserLoggedIn()) {
            dispatch(
                addUpdateProductInCartReducer({
                    productId: PreviewedProduct._id,
                    quantity: 1,
                    price: PreviewedProduct.price,
                })
            );
        } else {
            toast.error("Please log in or sign up with new account to do this action🙂");
        }
        //// else make state changing only
    };

    const handelAddToWishlist = async () => {
        if (IsUserLoggedIn()) {
            await dispatch(
                addProductToWishlistReducer({ productId: PreviewedProduct._id })
            );

            if (!error)
                setInWishlist(true);
        } else {
            toast.error("Please log in or sign up with new account to do this action🙂");
        }
    };
    const handelRemoveFromWishlist = async () => {
        if (IsUserLoggedIn()) {
            await dispatch(removeProductFromWishlistReducer({ productId: PreviewedProduct._id }));
            if (!error)
                setInWishlist(false);

        } else {
            toast.error("Please log in or sign up with new account to do this action🙂");
        }
    };

    useEffect(() => {
        const checkWishlistStatus = async () => {
            const result = await isProductInWishlist(PreviewedProduct._id);
            setInWishlist(result);
        };

        if (IsUserLoggedIn()) checkWishlistStatus();
        else toast.error("Please log in or sign up with new account🙂");
    }, [PreviewedProduct._id]);

    return (
        <Box>
            <Modal
                open={open}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                sx={{
                    ".MuiStack-root": {
                        width: { xs: "95%", md: "80%", lg: "70%", xl: "60%" },
                        maxHeight: { xs: "98%", md: "100%", lg: "1000px" },
                        // minHeight: "300px",
                        borderRadius: "10px",
                        border: "none",
                        bgcolor: theme.palette.categoryColor.main,
                        p: { xs: 1, sm: 2, md: 2 },
                    },
                }}
            >
                <Stack sx={modalStyles} direction={"row"} alignItems={"center"}>
                    <CloseRoundedIcon
                        color={theme.palette.text.primary}
                        sx={CloseBtnStyles}
                        onClick={handleCloseModal}
                    />
                    <Box
                        sx={{
                            padding: "0",
                            height: "300px",
                            maxWidth: { xs: 320, lg: "350px" },
                            minWidth: { xs: 300, lg: "320px" },
                            maxHeight: { xs: 200, lg: "100%" },
                            // minHeight: { xs: 200, lg: "320px" },
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <img
                            style={{
                                maxWidth: "100%",
                                maxHeight: "100%",
                                borderRadius: "10px",
                            }}
                            src={productImg}
                            alt="product-img"
                        />
                    </Box>
                    <Box
                        sx={{
                            minHeight: "400px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "start",
                            justifyContent: "center",
                            gap: { xs: 0, md: 4, lg: 2 },
                            [theme.breakpoints.down("md")]: {
                                alignItems: "center",
                            },
                        }}
                    >
                        <Stack
                            sx={{
                                fontSize: { xs: "18px", lg: "18px" },
                                flexDirection: { xs: "row", md: "column" },
                                alignItems: { xs: "center", md: "start" },
                                justifyContent: "center",
                                gap: { xs: 2, md: 0 },
                                mb: { xs: 1, md: 0 },
                                minWidth: "100%",
                                py: { xs: 1, sm: "0 !important" },
                                px: "8px !important",
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: "bold",
                                    fontSize: fontSizeClamp,
                                }}
                            >
                                {PreviewedProduct.title.slice(0, 20)}
                            </Typography>
                            <Typography
                                fontSize={"22px"}
                                color={"crimson"}
                                variant="h6"
                                fontWeight={"bold"}
                            >
                                ${PreviewedProduct.price}
                            </Typography>
                        </Stack>

                        <Typography
                            sx={{
                                fontSize: {
                                    xs: "16px",
                                    lg: "18px",
                                    textAlign: { xs: "justify", md: "left" },
                                },
                                maxWidth: { xs: "100%", lg: "100%" },
                                px: 1,
                            }}
                        >
                            {PreviewedProduct.desc.slice(0, 300)}
                            {/* {PreviewedProduct.desc} */}
                        </Typography>

                        <Stack
                            sx={{
                                width: "100% !important",
                                flexDirection: { xs: "column", md: "row" },
                                gap: { xs: 1, md: 2 },
                                px: "8px !important",
                                flexWrap: "wrap",
                            }}
                        >
                            <Box className="flex-between" gap={1} sx={{ maxHeight: "40px" }}  >
                                <Button
                                    onClick={handelBuyNow}
                                    sx={{
                                        textTransform: "capitalize",
                                        p: "5px 15px !important",
                                        bgcolor: "#ff6e6e",
                                        fontWeight: "bold",
                                        minWidth: { xs: "49%", md: "125px" },
                                        maxWidth: { xs: "49%", md: "125px" },

                                    }}
                                    variant="contained"
                                >
                                    <AddShoppingCartOutlinedIcon
                                        sx={{ mr: 1 }}
                                        fontSize="small"
                                    />
                                    Buy now
                                </Button>

                                <Button
                                    onClick={() => {
                                        handleClickAddToCart();
                                    }}
                                    sx={{
                                        // mb: { xs: 1, md: 0 },
                                        textTransform: "capitalize",
                                        p: "5px 15px !important",
                                        fontWeight: "bold",
                                        minWidth: { xs: "49%", md: "145px" },
                                        maxWidth: { xs: "50%", md: "185px" },

                                    }}
                                    color="secondary"
                                    variant="contained"
                                >
                                    <AddShoppingCartOutlinedIcon
                                        sx={{ mr: 1 }}
                                        fontSize="small"
                                    />
                                    Add To Cart
                                </Button>

                            </Box>

                            <Box
                                className="flex-center"
                                sx={{
                                    cursor: "pointer",
                                }}
                            >
                                {inWishlist ? (
                                    <WishlistIcon
                                        title={"REMOVE FROM WISHLIST"}
                                        icons={<FavoriteRoundedIcon />}
                                        favIconStyle={favIconStyle}
                                        color={"#E91E63"}
                                        handler={handelRemoveFromWishlist}
                                    />
                                ) : (
                                    <WishlistIcon
                                        title={"ADD TO WISHLIST"}
                                        icons={<FavoriteBorderRoundedIcon />}
                                        favIconStyle={favIconStyle}
                                        color={"primary.main"}
                                        handler={handelAddToWishlist}
                                    />
                                )}
                            </Box>
                            <Link to={`/product/${PreviewedProduct._id}`}>
                                <Button sx={{ fontWeight: "bold", width: { xs: "100%", md: "100%" } }} color="secondary" variant="outlined">More Details</Button>
                            </Link>
                        </Stack>
                    </Box>
                </Stack >
            </Modal >
            {openCheckoutModal && (
                <CompleteCheckoutModal
                    openCheckoutModal={openCheckoutModal}
                    handleOpenCheckoutModal={handleOpenCheckoutModal}
                    handleCloseCheckoutModal={handleCloseCheckoutModal}
                    checkoutInfo={checkoutInfo}
                    clearCartAtEnd={false}
                />
            )}
        </Box >
    );
};

export default ProductDetails;

