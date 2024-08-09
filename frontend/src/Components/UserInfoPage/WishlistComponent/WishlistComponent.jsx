import { Button, Container, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../../Theme/theme";
import { useEffect, useState } from "react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

//// custom components
import CircularLoaderComponent from "../../GenericComponents/CircularLoaderComponent/CircularLoaderComponent";
import ProductDetails from "../../CardComponent/ProductDetails/ProductDetails";

// //// redux
import { useDispatch, useSelector } from "react-redux";
import { getCustomerWishlistReducer } from "../../../redux/WishlistSlice/ApiWishlistSlice";
import { IsUserLoggedIn } from "../../../General/GeneralFunctions";
import { Link } from "react-router-dom";
import ProductCardComponentInWishlist from "./ProductCardComponentInWishlist";

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

    // const productData = {
    //     productId: "66a918deda78b9fa2e1366af",
    //     _id: "66b3d9d8434061dc95f93eb7",
    //     productDetails: {
    //         _id: "66a918deda78b9fa2e1366af",
    //         title: "Opna Women's Short S",
    //         desc: "100% Polyester, Machine wash, 100% cationic polyester interlock, Machine Wash & Pre Shrunk for a Great Fit, Lightweight, roomy and highly breathable with moisture wicking fabric which helps to keep moisture away, Soft Lightweight Fabric with comfortable V-neck collar and a slimmer fit, delivers a sleek, more feminine silhouette and Added Comfort",
    //         img: "http://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_.jpg",
    //         categories: ["women", "Opna", "t-shirt"],
    //         size: "m",
    //         color: "red",
    //         price: 44.99,
    //         rating: 3.5,
    //         createdAt: "2024-07-30T16:46:22.383Z",
    //         updatedAt: "2024-07-30T16:46:22.383Z",
    //         __v: 0,
    //     },
    // };

    const handelShowWishlistProducts = () => {
        if (error) {
            return (
                <Box
                    className="flex-column-center"
                    sx={{ minHeight: "50vh", gap: "15px", width: "100%" }}
                >
                    <Typography variant="h6">
                        There is something wrong 😢
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => window.location.reload()}
                        sx={{ fontWeight: "bold" }}
                    >
                        Reload Page
                    </Button>
                </Box>
            );
        } else if (customerWishlist.products.length === 0) {
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
                        width: "100%",
                    }}
                >
                    No products in wishlist 😅 Add some Now
                </Box>
            );
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
                {isLoading ? (
                    <CircularLoaderComponent />
                ) : (
                    handelShowWishlistProducts()
                )}
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
