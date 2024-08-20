/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { Box, Container, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../Theme/theme";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { useParams } from "react-router-dom";

/// Icons
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import Rating from "@mui/material/Rating";


///// redux
import { useDispatch, useSelector } from "react-redux";
import { addUpdateProductInCartReducer } from "../../redux/CartSlice/ApiCartSlice.js";
import { getAProductReducer } from "../../redux/ProductSlice/ApiProductSlice.js"
import { addProductToWishlistReducer, removeProductFromWishlistReducer } from "../../redux/WishlistSlice/ApiWishlistSlice";
import { CalcTotalCartPrice, IsUserLoggedIn } from "../../General/GeneralFunctions.js";

//// custom components
import { isProductInWishlist } from "../../API/WishlistAPIFunctions.js";
import CompleteCheckoutModal from "../CartPage/CompleteCheckoutModal/CompleteCheckoutModal.jsx";
import ControlProductAmount from "../CartDrawer/ItemComponent/ControlProductAmount.jsx"
import LoaderComponent from "../GenericComponents/LoaderComponent/LoaderComponent.jsx";
import NoItemComponent from "../../Components/GenericComponents/NoItemsComponent/NoItemsComponent.jsx"

//// styles
const pageStyles = {
    display: "flex",
    minHeight: "60vh",
    width: "100%",
    bgcolor: "background.paper",
    p: { xs: 2, md: 4 },
    mt: 2,
    flexDirection: { xs: "column", md: "row" },
    gap: { xs: 1, md: 4 },
    justifyContent: { sx: "center", md: "space-between" },
    alignItems: { xs: "center", md: "flex-start" },
};
const favIconStyle = {
    px: 1,
    py: 0.5,
    border: "1px solid",
    borderRadius: "6px",
    width: "100%",
};
const buttonsStyle = {
    p: "5px 15px !important",
    fontWeight: "bold",
    minWidth: "300px",
    maxWidth: "100%",
    flex: 1,
};
const fontSizeClamp = "clamp(20px,calc(24px + (25 - 15) * (100vw - 1000px) / (1920 - 1000)),32px) !important";

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
                }}
            >
                {title}
            </Typography>
            {icons}
        </Box>
    );
};

const ColorCircle = ({ color }) => {
    const theme = useTheme(ColorModeContext);

    return <Box sx={{ width: "22px", height: "22px", borderRadius: "50%", bgcolor: color, border: `2px solid ${theme.palette.specialText.main}`, cursor: "pointer" }}></Box>
}


let checkoutInfo;

// eslint-disable-next-line react/prop-types
const ProductPage = () => {

    let PreviewedProduct = useSelector((state) => state.ProductsApiRequest.singleProduct);
    let isLoading = useSelector((state) => state.ProductsApiRequest.isLoading);
    let error2 = useSelector((state) => state.ProductsApiRequest.error);

    const { productId } = useParams();
    const theme = useTheme(ColorModeContext);
    const productImg = PreviewedProduct?.img;

    const dispatch = useDispatch();
    const [inWishlist, setInWishlist] = useState(false);
    const error = useSelector((state) => state.WishlistApiRequest.error);

    const [fieldQuantity, setFieldQuantity] = useState(1);


    ///// complete checkout modal
    const [openCheckoutModal, setOpenCheckoutModal] = useState(false);
    const handleOpenCheckoutModal = () => setOpenCheckoutModal(true);
    const handleCloseCheckoutModal = () => setOpenCheckoutModal(false);

    const handelBuyNow = () => {

        if (!IsUserLoggedIn()) {
            toast.error("Please log in or sign up with new account");
            return;
        }

        const productPrice = PreviewedProduct.price * fieldQuantity;
        let { finalPrice, shippingCalc } = CalcTotalCartPrice(productPrice);

        checkoutInfo = {
            products: [
                {
                    productId: PreviewedProduct._id,
                    quantity: fieldQuantity,
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

        console.log("############ : ", checkoutInfo);


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
            toast.error("Adding to local state soon");
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
            toast.error("Adding to local state soon");
        }
    };
    const handelRemoveFromWishlist = async () => {
        if (IsUserLoggedIn()) {
            await dispatch(removeProductFromWishlistReducer({ productId: PreviewedProduct._id }));
            if (!error)
                setInWishlist(false);

        } else {
            toast.error("Adding to local state soon");
        }
    };


    useEffect(() => {

        const checkWishlistStatus = async () => {
            const result = await isProductInWishlist(productId);
            setInWishlist(result);
        };

        const getProduct = async () => {
            await dispatch(getAProductReducer(productId));

            if (IsUserLoggedIn()) await checkWishlistStatus();

        };

        getProduct();

    }, []);


    if (isLoading) return <LoaderComponent />
    if (error2) return <NoItemComponent message={"There is something wrong can't show this product right now 😔 "} minHeight={"60vh"} fontSize={"1.5rem"} />

    return (
        <Container sx={pageStyles} maxWidth="xl">
            <Box
                sx={{
                    paddingTop: "40px",
                    maxWidth: { xs: 320, md: "500px" },
                    minWidth: { xs: 320, md: "400px" },
                    height: "100%",
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
                <Typography
                    variant="h1"
                    sx={{
                        fontWeight: "bold",
                        fontSize: fontSizeClamp,
                        width: "100%",
                    }}
                >
                    {PreviewedProduct.title}
                </Typography>
                <Typography
                    fontSize={"24px"}
                    color={"crimson"}
                    variant="h6"
                    fontWeight={"bold"}
                    width={"100%"}
                >
                    ${PreviewedProduct.price}
                </Typography>

                <Stack
                    alignItems={"center"}
                    direction={"row"}
                    sx={{
                        fontSize: { xs: "16px", lg: "18px" },
                        textAlign: { xs: "justify", md: "left" },
                        maxWidth: { xs: "100%", lg: "100%" },
                        width: "100%",
                        mb: 1,
                    }}
                >
                    <span style={{ fontWeight: "bold", minWidth: "110px" }}>Rating :</span> <Rating
                        name="read-only"
                        value={PreviewedProduct.rating}
                        readOnly
                        size="small"
                        precision={0.5}
                    />
                </Stack>



                <Stack
                    direction={"row"}
                    alignItems={"center"}
                    sx={{
                        fontSize: { xs: "16px", lg: "18px" },
                        textAlign: { xs: "justify", md: "left" },
                        minWidth: { xs: "100%", lg: "100%" },
                        mb: 1
                    }}
                >
                    <span style={{ fontWeight: "bold", minWidth: "110px" }}>Colors :</span>
                    <ColorCircle color={PreviewedProduct.color} />
                </Stack>
                <Typography
                    sx={{
                        fontSize: { xs: "16px", lg: "18px" },
                        textAlign: { xs: "justify", md: "left" },
                        maxWidth: { xs: "100%", lg: "100%" },
                        width: "100%", mb: 1
                    }}
                >
                    <span style={{ display: "inline-block", fontWeight: "bold", minWidth: "110px" }}>Size :</span>{PreviewedProduct.size}
                </Typography>

                <Stack className="flex-center" sx={{ mb: 2, width: "100%", justifyContent: "flex-start" }}>
                    <Typography sx={{ fontSize: { xs: "16px", lg: "18px" }, minWidth: "110px", fontWeight: "bold" }}> Quantity : </Typography>
                    <ControlProductAmount
                        fieldQuantity={fieldQuantity}
                        setFieldQuantity={setFieldQuantity}
                        quantity={fieldQuantity}
                        scale="1"
                    />
                </Stack>
                <Stack
                    sx={{
                        width: "100% !important",
                        flexDirection: { xs: "column" },
                        gap: { xs: 2, md: 2 },
                        flexWrap: "wrap",
                        mb: 1
                    }}
                >
                    <Box className="flex-between" sx={{ flexWrap: "wrap" }} gap={2} >
                        <Button
                            onClick={handelBuyNow}
                            sx={{ ...buttonsStyle, bgcolor: "#ff6e6e" }}
                            variant="contained"
                        >
                            Buy now
                        </Button>

                        <Button
                            onClick={() => { handleClickAddToCart() }}
                            sx={buttonsStyle}
                            color="secondary"
                            variant="contained"
                        >
                            <AddShoppingCartOutlinedIcon sx={{ mr: 1 }} fontSize="small" />
                            Add To Cart
                        </Button>

                    </Box>

                    <Box
                        className="flex-center"
                        sx={{
                            cursor: "pointer",
                            width: "100%",
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


                </Stack>

                <Typography
                    sx={{
                        fontSize: "16px",
                        textAlign: { xs: "justify", md: "left" },
                        maxWidth: { xs: "100%", lg: "100%" },
                        lineHeight: "1.5",
                        letterSpacing: ".5px",
                        mb: 2,
                    }}
                >
                    <span style={{ fontWeight: "bold", fontSize: "18px", }}>Description : </span>  <br /> {PreviewedProduct.desc}
                </Typography>
            </Box >
            {openCheckoutModal && (
                <CompleteCheckoutModal
                    openCheckoutModal={openCheckoutModal}
                    handleOpenCheckoutModal={handleOpenCheckoutModal}
                    handleCloseCheckoutModal={handleCloseCheckoutModal}
                    checkoutInfo={checkoutInfo}
                    clearCartAtEnd={false}
                />
            )}
        </Container >
    );
};

export default ProductPage;


