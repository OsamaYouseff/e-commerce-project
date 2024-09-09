/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import { Stack, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useTheme, styled } from "@mui/material/styles";
import { ColorModeContext } from "../../../../shared_files/Theme/theme.jsx";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Badge from "@mui/material/Badge";
import { Link } from "react-router-dom";

//// hooks
import { useEffect, useState } from "react";

// Custom components
import LoaderComponent from "../../../../shared_files/LoaderComponent/LoaderComponent.jsx";
import ItemComponent from "./ItemComponent/ItemComponent";
import { SomeThingWrong } from "../../../../shared_files/SomeThingWrong/SomeThingWrong.jsx";
import ProductDetails from "../GenericComponents/ProductDetails/ProductDetails.jsx";

/// General Vars & Functions
import { IsUserLoggedIn } from "../../General/GeneralFunctions.js";

//// redux
import { useSelector, useDispatch } from "react-redux";
import { getCustomerCartReducer } from "../../redux/CartSlice/ApiCartSlice";
import NoItemsComponent from "../../../../shared_files/NoItemsComponent/NoItemsComponent.jsx";


export default function CartDrawer() {
    const [state, setState] = useState({ right: false });
    const theme = useTheme(ColorModeContext);

    //// redux
    const dispatch = useDispatch();
    const customerCart = useSelector((state) => state.CartApiRequest.response);
    const isLoading = useSelector((state) => state.CartApiRequest.isLoading);
    const error = useSelector((state) => state.CartApiRequest.error);
    const message = useSelector((state) => state.CartApiRequest.message);

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [PreviewedProduct, setPreviewedProduct] = useState({ id: 2, attributes: {}, });

    const handleSetPreviewedProduct = (newValue) => {
        setPreviewedProduct(newValue);
    };

    const productsCount = customerCart?.products?.length || "0";
    const totalPrice = customerCart?.totalPrice || 0;

    /// styles
    const transitionDuration = "350ms";
    const StyledBadge = styled(Badge)(({ theme }) => ({
        "& .MuiBadge-badge": {
            right: -3,
            top: 13,
            border: `.125rem solid ${theme.palette.background.paper}`,
            padding: "0 .25rem",
        },
    }));

    //// handlers
    const toggleDrawer = (anchor, open) => (event) => {
        if (
            event.type === "keydown" &&
            (event.key === "Tab" || event.key === "Shift")
        ) {
            return;
        }
        setState({ ...state, [anchor]: open });
    };

    const handelShowCartProduct = () => {
        if (error || !customerCart) {
            return <SomeThingWrong minHeight="50vh" errorMsg={"There is something wrong 😢"} />
        } else if (customerCart.products.length === 0) {
            return <NoItemsComponent message={"No products in your cart 😅"} fontSize={"1rem"} minHeight={"60vh"} />

        } else {
            return customerCart.products.map((item) => (
                <ItemComponent
                    key={item.productId}
                    quantity={item.quantity}
                    item={item.productDetails}
                    handelOpenModal={handleOpen}
                    handleSetPreviewedProduct={handleSetPreviewedProduct}
                />
            ));
        }
    };

    useEffect(() => {
        if (IsUserLoggedIn() && !isLoading) dispatch(getCustomerCartReducer());
        // else toast.error("Please log in or sign up with new account🙂");
    }, []);

    const list = (anchor) => (
        <Box
            className="flex-between-column"
            sx={{
                width: { xs: "100vw", sm: "24.375rem" },
                p: { xs: 1, sm: 2 },
                pr: { xs: 0, sm: 2 },
                bgcolor: "categoryColor.main",
                height: "100vh",
                overflow: "auto",
                overflowX: "hidden",

            }}
            role="presentation"
        >
            {/* Close Button */}
            <Button
                className="border"

                size="small"
                sx={{
                    position: "absolute", right: 0, top: -10, color: "text.primary", marginTop: ".9375rem", zIndex: 1, "&:hover": { bgcolor: "transparent" },
                }}
                onClick={toggleDrawer("right", false)}
            >
                <CloseRoundedIcon
                    sx={{
                        fontSize: "2.8125rem", width: "2.1875rem", height: "2.1875rem", cursor: "pointer",
                        borderRadius: "50%", p: 0.2, color: "text.primary",
                        border: `.125rem solid ${theme.palette.text.primary}`,
                        "&:hover": { rotate: "180deg", color: "#ff6e6e", borderColor: "#ff6e6e", },
                        transition: "0.35s",
                    }}
                    onClick={toggleDrawer("right", false)}
                />
            </Button>
            {/*== Close Button ==*/}

            <Typography
                variant="h5"
                style={{
                    marginBottom: ".625rem",
                    fontWeight: "bold",
                    width: "95%",
                    textAlign: "center",
                }}
            >
                View Your Cart
            </Typography>

            {/* Cart Items */}
            <Box
                sx={{
                    flexGrow: 1,
                    overflow: "auto",
                    height: { xs: "58vh", sm: "auto" },
                    minHeight: "58vh",
                    pr: 1,
                    width: "100%",

                }}
            >
                <div
                    style={{
                        width: "100%",
                        minHeight: "24.375rem",
                        maxHeight: "90vh",
                        bgcolor: "red",
                    }}
                >
                    {isLoading ? <LoaderComponent /> : handelShowCartProduct()}
                </div>
            </Box>
            {/*== Cart Items ==*/}

            <Stack sx={{ width: "100%", px: 0.8 }}>
                {/* Apply Coupon */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        my: 2,
                        fontSize: "1.0625rem",
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: "bolder" }}>Got a coupon?</Typography>
                    <Stack direction="row" gap={1}>
                        <input
                            type="text"
                            placeholder="Enter your coupon code"
                            style={{
                                width: "70%",
                                height: "2.5rem",
                                borderRadius: ".3125rem",
                                border: `.0625rem solid ${theme.palette.text.primary}`,
                                padding: ".625rem",
                                fontWeight: "bolder",
                            }}
                        />
                        <Button
                            variant="contained"
                            sx={{
                                width: "30%",
                                height: "2.5rem",
                                borderRadius: ".3125rem",
                                border: `.0625rem solid ${theme.palette.primary.main}`,
                                cursor: "pointer",
                                fontWeight: "bolder",
                            }}
                        >
                            Apply
                        </Button>
                    </Stack>
                </Box>
                {/*== Apply Coupon ==*/}

                {/* Checkout Button */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        fontSize: "1.0625rem",
                    }}
                >
                    <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: "1.25rem", fontWeight: "bolder" }}>
                            Subtotal
                        </Typography>
                        <Typography
                            sx={{
                                fontWeight: "bolder",
                                color: "#ff4450",
                                fontSize: "1.25rem",
                            }}
                        >
                            ${totalPrice.toFixed(2)}
                        </Typography>
                    </Stack>
                    <Link to="/cart" xs={{ width: "100%" }}>
                        <Button
                            onClick={toggleDrawer("right", false)}
                            variant="contained"
                            sx={{ fontWeight: "bolder", width: "100%" }}
                        >
                            Checkout
                        </Button>
                    </Link>
                </Box>
                {/*== Checkout Button ==*/}
            </Stack>
        </Box>
    );

    return (
        <Box
            style={{
                width: "2.375rem",
                height: "2.375rem",
                color: theme.palette.text.primary,

            }}
        >
            <StyledBadge
                className="flex-center "
                onClick={toggleDrawer("right", true)}
                badgeContent={productsCount}
                color="primary"
                sx={{
                    width: "100%",
                    height: "100%",
                    ".MuiBadge-badge.MuiBadge-standard": {
                        transform: "translate(.125rem, -0.625rem)",
                    },
                }}
            >
                <ShoppingCartIcon
                    sx={{ transition: transitionDuration, height: "2.8125rem", fontSize: "2.1875rem", }}
                />
            </StyledBadge>
            <Drawer
                anchor={"right"}
                open={state["right"]}
                onClose={toggleDrawer("right", false)}
            >
                {list("right")}
            </Drawer>
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
        </Box>
    );
}
