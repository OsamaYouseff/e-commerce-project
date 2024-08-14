/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import { Stack, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useTheme, styled } from "@mui/material/styles";
import { ColorModeContext } from "../../Theme/theme";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Badge from "@mui/material/Badge";
import { Link } from "react-router-dom";

//// hooks
import { useEffect, useState } from "react";

// Custom components
import LoaderComponent from "../GenericComponents/LoaderComponent/LoaderComponent";
import ItemComponent from "./ItemComponent/ItemComponent";
import { SomeThingWrong } from "../GenericComponents/SomeThingWrong/SomeThingWrong";
import ProductDetails from "../CardComponent/ProductDetails/ProductDetails";
import toast from 'react-hot-toast';

/// General Vars & Functions
import { IsUserLoggedIn } from "../../General/GeneralFunctions";

//// redux
import { useSelector, useDispatch } from "react-redux";
import { getCustomerCartReducer } from "../../redux/CartSlice/ApiCartSlice";
import NoItemsComponent from "../GenericComponents/NoItemsComponent/NoItemsComponent";


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
            border: `2px solid ${theme.palette.background.paper}`,
            padding: "0 4px",
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
        // else toast.error("Please log in or sign up with new account");
    }, []);

    const list = (anchor) => (
        <Box
            className="flex-between-column"
            sx={{
                width: { xs: "100vw", sm: "390px" },
                p: { xs: 2, sm: 2 },
                pr: 1,
                bgcolor: theme.palette.categoryColor.main,
                height: "100vh",
                overflow: "auto",
            }}
            role="presentation"
        // onClick={toggleDrawer(anchor, false)}
        // onKeyDown={toggleDrawer(anchor, false)}
        >
            {/* Close Button */}
            <Button
                size="small"
                sx={{
                    position: "absolute", right: 0, top: -10, color: theme.palette.text.primary, marginTop: "15px", zIndex: 1, "&:hover": { bgcolor: "transparent" },
                }}
                onClick={toggleDrawer("right", false)}
            >
                <CloseRoundedIcon
                    sx={{
                        fontSize: "45px", width: "35px", height: "35px", cursor: "pointer",
                        borderRadius: "50%", p: 0.2, color: theme.palette.text.primary,
                        border: `2px solid ${theme.palette.text.primary}`,
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
                    marginBottom: "10px",
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
                    // transform: {
                    //     xs: "translateX(10px)",
                    //     sm: "translateX(0px)",
                    // },
                }}
            >
                <div
                    style={{
                        width: "100%",
                        minHeight: "390px",
                        maxHeight: "90vh",
                        bgcolor: "red",
                    }}
                >
                    {isLoading ? <LoaderComponent /> : handelShowCartProduct()}
                </div>
            </Box>
            {/*== Cart Items ==*/}

            <Stack sx={{ width: "100%" }}>
                {/* Apply Coupon */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        my: 2,
                        fontSize: "17px",
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: "bolder" }}>Got a coupon?</Typography>
                    <Stack direction="row" gap={1}>
                        <input
                            type="text"
                            placeholder="Enter your coupon code"
                            style={{
                                width: "70%",
                                height: "40px",
                                borderRadius: "5px",
                                border: `1px solid ${theme.palette.text.primary}`,
                                padding: "10px",
                                fontWeight: "bolder",
                            }}
                        />
                        <Button
                            variant="contained"
                            sx={{
                                width: "30%",
                                height: "40px",
                                borderRadius: "5px",
                                border: `1px solid ${theme.palette.primary.main}`,
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
                        fontSize: "17px",
                    }}
                >
                    <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: "20px", fontWeight: "bolder" }}>
                            Subtotal
                        </Typography>
                        <Typography
                            sx={{
                                fontWeight: "bolder",
                                color: "#ff4450",
                                fontSize: "20px",
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
                width: "38px",
                height: "38px",
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
                        transform: "translate(2px, -10px)",
                    },
                }}
            >
                <ShoppingCartIcon
                    sx={{ transition: transitionDuration, height: "30px" }}
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
