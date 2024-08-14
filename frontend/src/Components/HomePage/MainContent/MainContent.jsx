/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { Box, Container, Stack, Typography, Button } from "@mui/material";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../../Theme/theme";

//// custom component
import ProductCardComponent from "../../CardComponent/ProductCardComponent";
import toast from 'react-hot-toast';

/// Icons
import ProductDetails from "../../CardComponent/ProductDetails/ProductDetails";
import SkeletonFeedback from "../../GenericComponents/SkeletonFeedback/SkeletonFeedback";

///// Redux Actions
import { getFilteredProductsReducer } from "../../../redux/ProductSlice/ApiProductSlice";
import { useDispatch, useSelector } from "react-redux";
import { IsUserLoggedIn } from "../../../General/GeneralFunctions";

const MainContent = () => {
    const allProducts = "";
    const menProducts = "men";
    const womenProducts = "women";

    const [productCategory, setProductCategory] = useState(allProducts);

    const dispatch = useDispatch();
    const products = useSelector((state) => state.ProductsApiRequest.response);
    const error = useSelector((state) => state.ProductsApiRequest.error);
    const isLoading = useSelector(
        (state) => state.ProductsApiRequest.isLoading
    );

    const theme = useTheme(ColorModeContext);
    const ToggleButtonStyles = {
        fontSize:
            "clamp(10px,calc(14px + (16 - 14) * (100vw - 1000px) / (1920 - 1000)),16px) !important",
        border: "1px solid #777 !important",
        borderRadius: "4px !important",
        padding: "5px 10px",
        color: theme.palette.text.primary,
        flexGrow: "1",
    };
    const handleProductCategory = (event, newValue) => {
        if (newValue) {
            setProductCategory(newValue);
            dispatch(getFilteredProductsReducer(`categories=${newValue}`));
        } else {
            dispatch(getFilteredProductsReducer(""));
            setProductCategory(allProducts);
        }
    };
    const handleSetPreviewedProduct = (newValue) => {
        setPreviewedProduct(newValue);
    };

    //// Modal vars
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [PreviewedProduct, setPreviewedProduct] = useState({
        id: 2,
        attributes: {},
    });

    useEffect(() => {
        (async function fetchData() {
            await dispatch(getFilteredProductsReducer());

            if (IsUserLoggedIn()) {
                toast.success("Login Successful ,Welcome Back !");
            }

        })();

    }, []);

    if (products) {
        return (
            <Container maxWidth="xl" py={3} sx={{ marginTop: "15px" }}>
                <Stack
                    direction={"row"}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                    flexWrap={"wrap"}
                    gap={3}
                >
                    <Box>
                        <Typography fontSize={"20px"} fontWeight={"bold"}>
                            Selected Products
                        </Typography>
                        <Typography fontSize={"15px"}>
                            All our new arrival in a exclusive brand collection
                        </Typography>
                    </Box>
                    <Stack
                        direction={"row"}
                        alignItems={"center"}
                        gap={3}
                        sx={{ flexGrow: { xs: 1, sm: 0 } }}
                    >
                        <ToggleButtonGroup
                            value={productCategory}
                            exclusive
                            onChange={handleProductCategory}
                            aria-label="text alignment"
                            sx={{
                                gap: "10px !important",
                                ".Mui-selected": {
                                    background: `${theme.palette.sectionBgColor.main} !important`,
                                },
                                flexGrow: 1,
                            }}
                        >
                            <ToggleButton
                                sx={ToggleButtonStyles}
                                value={allProducts}
                                aria-label="left aligned"
                            >
                                All products
                            </ToggleButton>
                            <ToggleButton
                                sx={ToggleButtonStyles}
                                value={menProducts}
                                aria-label="centered"
                            >
                                Men Category
                            </ToggleButton>
                            <ToggleButton
                                sx={ToggleButtonStyles}
                                value={womenProducts}
                                aria-label="right aligned"
                            >
                                Women Category
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>
                    <Box
                        sx={{
                            flexGrow: 0.5,
                            display: { xs: "none", sm: "block" },
                        }}
                    ></Box>
                </Stack>
                <Stack
                    className="products"
                    sx={{ mt: "15px", py: "15px", gap: "25px 10px" }}
                    direction={"row"}
                    flexWrap={"wrap"}
                    justifyContent={"space-between"}
                >
                    {products?.map((product) => (
                        <ProductCardComponent
                            key={product._id}
                            productData={product}
                            handelOpenModal={handleOpen}
                            handleSetPreviewedProduct={
                                handleSetPreviewedProduct
                            }
                        />
                    ))}
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
    } else if (isLoading) {
        return (
            <Container>
                <Box sx={{ marginY: "15px" }}>
                    <SkeletonFeedback />
                </Box>
            </Container>
        );
    } else if (error || !products) {
        return (
            <Container maxWidth="xl" py={3} sx={{ marginTop: "15px" }}>
                <Box
                    className="flex-column-center"
                    sx={{ minHeight: "50vh", gap: "15px" }}
                >
                    <Typography variant="h5">
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
            </Container>
        );
    }
};

export default MainContent;
