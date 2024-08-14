/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Container, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../../Theme/theme";
import { useEffect, useState } from "react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

//// custom components
import LoaderComponent from "../../GenericComponents/LoaderComponent/LoaderComponent";
import ProductDetails from "../../CardComponent/ProductDetails/ProductDetails";
import toast from 'react-hot-toast';


// //// redux
import { useDispatch, useSelector } from "react-redux";
import { getCustomerWishlistReducer } from "../../../redux/WishlistSlice/ApiWishlistSlice";
import { IsUserLoggedIn } from "../../../General/GeneralFunctions";
import { Link } from "react-router-dom";
import ProductCardComponentInWishlist from "./ProductCardComponentInWishlist";
import { SomeThingWrong } from "../../GenericComponents/SomeThingWrong/SomeThingWrong";
import NoItemsComponent from "../../GenericComponents/NoItemsComponent/NoItemsComponent";

const WishlistComponent = () => {
    const theme = useTheme(ColorModeContext);

    //// redux
    const dispatch = useDispatch();
    const customerWishlist = useSelector(
        (state) => state.WishlistApiRequest.response
    );
    const error = useSelector((state) => state.WishlistApiRequest.error);
    const isLoading = useSelector(
        (state) => state.WishlistApiRequest.isLoading
    );

    const productsCount = customerWishlist?.products.length || 0;

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

    const handelShowWishlistProducts = () => {
        if (error) {
            return <SomeThingWrong minHeight={"50vh"} errorMsg={" There is something wrong 😢."} />

        } else if (customerWishlist.products.length === 0) {
            return <NoItemsComponent message={"No products in your wishlist add some 😅"} fontSize={"1.3rem"} minHeight={"40vh"} />
        }
        return customerWishlist.products.map((item) => {
            return (
                <ProductCardComponentInWishlist
                    key={item._id}
                    productData={item.productDetails}
                    handelOpenModal={handleOpen}
                    handleSetPreviewedProduct={handleSetPreviewedProduct}
                />
            );
        });
    };

    useEffect(() => {
        if (IsUserLoggedIn() && !isLoading)
            dispatch(getCustomerWishlistReducer());
        else toast.error("Please log in or sign up with new account");
    }, []);

    return (
        <Container
            maxWidth="xl"
            sx={{
                bgcolor: theme.palette.sectionBgColor.main,
                py: 2,
                minHeight: "70vh",
                minWidth: "67vw",
                borderRadius: "8px",
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
                        letterSpacing: "1px",
                    }}
                >
                    Wishlist
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
                            fontSize: "24px",
                            background: theme.palette.bgColor.main,
                            borderRadius: "6px",
                        }}
                    >
                        {productsCount}
                    </span>
                    Items in your Wishlist
                </Typography>
            </Stack>

            <Stack
                className="products"
                sx={{ mt: "5px", py: "15px", gap: "25px 10px" }}
                direction={"row"}
                flexWrap={"wrap"}
                justifyContent={"flex-start"}
            >
                {isLoading ? <LoaderComponent /> : handelShowWishlistProducts()}
            </Stack>

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
        </Container>
    );
};

export default WishlistComponent;
