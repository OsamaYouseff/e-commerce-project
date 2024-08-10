/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Container, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../Theme/theme";
import { Fragment, useEffect, useState } from "react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

//// custom components
import MidHeader from "../GenericComponents/Header/MidHeader";
import CheckoutPanel from "./CheckoutPanel";
import LoaderComponent from "../GenericComponents/LoaderComponent/LoaderComponent";
import ProductDetails from "../CardComponent/ProductDetails/ProductDetails";

//// redux
import { useDispatch, useSelector } from "react-redux";
import { getCustomerCartReducer } from "../../redux/CartSlice/ApiCartSlice";
import { IsUserLoggedIn } from "../../General/GeneralFunctions";
import ItemComponent from "../CartDrawer/ItemComponent";
import { Link } from "react-router-dom";
import { SomeThingWrong } from "../../General/GeneralComponents";

const CartPage = () => {
    const theme = useTheme(ColorModeContext);

    //// redux
    const dispatch = useDispatch();
    const customerCart = useSelector((state) => state.CartApiRequest.response);
    const isLoading = useSelector((state) => state.CartApiRequest.isLoading);
    const error = useSelector((state) => state.CartApiRequest.error);

    //// Modal vars
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [PreviewedProduct, setPreviewedProduct] = useState({
        id: 2,
        attributes: {},
    });

    const handleSetPreviewedProduct = (newValue) => {
        setPreviewedProduct(newValue);
    };

    const productsCount = customerCart?.products?.length || 0;
    const totalPrice = customerCart?.totalPrice || 0;

    const handelShowCartProducts = () => {
        if (error || !customerCart) {
            return (
                <SomeThingWrong
                    minHeight={"50vh"}
                    errorMsg={
                        "Something went wrong 😢 Can not get your cart items."
                    }
                />
            );
        } else if (customerCart.products.length === 0) {
            return (
                <Box
                    sx={{
                        p: 2,
                        bgcolor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        textAlign: "center",
                        borderRadius: "10px",
                        fontWeight: "bolder",
                        fontSize: "1.5rem",
                    }}
                >
                    No products in cart 😅
                </Box>
            );
        }
        return customerCart.products.map((item) => (
            <ItemComponent
                key={item._id}
                itemKey={item._id}
                item={item.productDetails}
                quantity={item.quantity}
                withDetails={true}
                handelOpenModal={handleOpen}
                handleSetPreviewedProduct={handleSetPreviewedProduct}
            />
        ));
    };

    useEffect(() => {
        if (IsUserLoggedIn() && !isLoading) dispatch(getCustomerCartReducer());
        else alert("Please log in or sign up with new account");
    }, []);

    return (
        <Fragment>
            <MidHeader />
            <Container
                maxWidth="xl"
                sx={{
                    bgcolor: theme.palette.sectionBgColor.main,
                    py: 2,
                    mt: 2,
                    minHeight: "88vh",
                    borderRadius: "8px",
                }}
            >
                <Stack
                    direction="row"
                    gap={2}
                    justifyContent={"space-between"}
                    sx={{
                        mb: 2,
                        [theme.breakpoints.down("md")]: {
                            flexDirection: "column",
                        },
                    }}
                >
                    <Box
                        sx={{
                            width: { xs: "100%", md: "70%" },
                            maxHeight: { xs: "auto", sm: "auto" },
                            overflow: "auto",
                        }}
                    >
                        <Link to="/home">
                            <Button
                                size="small"
                                sx={{ fontWeight: "bolder", mb: 2 }}
                                variant="outlined"
                            >
                                <ArrowBackIosIcon />
                                Back to shopping
                            </Button>
                        </Link>

                        <Stack
                            sx={{
                                flexDirection: {
                                    xs: "column",
                                    sm: "row",
                                },
                                gap: 2,

                                alignItems: "start",
                                justifyContent: "space-between",
                            }}
                        >
                            <Typography
                                variant="h1"
                                fontSize={"24px"}
                                sx={{
                                    width: { xs: "100%", sm: "auto" },
                                    pl: { sx: 0, sm: 1 },
                                    textAlign: { xs: "center", sm: "start" },
                                    fontWeight: "bolder",
                                }}
                            >
                                Shopping Cart
                            </Typography>

                            <Typography
                                variant="h2"
                                fontSize={"20px"}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    width: { xs: "100%", sm: "auto" },
                                    justifyContent: {
                                        xs: "center",
                                        sm: "start",
                                    },
                                }}
                            >
                                <span
                                    style={{
                                        width: "30px",
                                        textAlign: "center",
                                        color: theme.palette.primary.main,
                                        fontWeight: "bolder",
                                        fontSize: "30px",
                                        background: theme.palette.bgColor.main,
                                        borderRadius: "6px",
                                    }}
                                >
                                    {productsCount}
                                </span>
                                Items in your shopping Cart
                            </Typography>
                        </Stack>

                        <Box
                            sx={{
                                my: 2,
                                boxShadow: 1,
                                bgcolor: theme.palette.bgColor.main,
                                py: 1,
                                px: 2,
                                borderRadius: "6px",
                            }}
                        >
                            <Stack
                                direction="row"
                                p={1}
                                gap={2}
                                mb={2}
                                mt={1}
                                sx={{
                                    boxShadow: 1,
                                    borderRadius: "6px",
                                    display: { xs: "none", sm: "flex" },
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "19px",
                                        width: "33%",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Product
                                </span>
                                <span
                                    style={{
                                        fontSize: "19px",
                                        width: "9%",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Price
                                </span>
                                <span
                                    style={{
                                        fontSize: "19px",
                                        width: "20%",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                    }}
                                >
                                    Quantity
                                </span>
                                <span
                                    style={{
                                        fontSize: "19px",
                                        width: "32%",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                    }}
                                >
                                    Total Price
                                </span>
                            </Stack>

                            {isLoading ? (
                                <LoaderComponent />
                            ) : (
                                handelShowCartProducts()
                            )}
                        </Box>
                    </Box>

                    <CheckoutPanel totalPrice={totalPrice} />
                </Stack>
            </Container>
            {
                // toggle modal appearance
                open && (
                    <ProductDetails
                        PreviewedProduct={PreviewedProduct}
                        handleCloseModal={handleClose}
                        open={open}
                    />
                )
            }
        </Fragment>
    );
};

export default CartPage;
