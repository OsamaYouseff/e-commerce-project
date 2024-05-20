/* eslint-disable react/prop-types */
import { Box, Container, Stack, Typography } from "@mui/material";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../Theme/theme";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import { useGetProductByNameQuery } from "../../redux/product";

/// Icons
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import ProductDetails from "./ProductDetails/ProductDetails";
import SkeletonFeedback from "../SkeletonFeedback/SkeletonFeedback";

const MainContent = () => {
    const allProducts = 'products?populate=*';
    const menProducts = 'products?populate=*&filters[productCategory][$eq]=men';
    const womenProducts = 'products?populate=*&filters[productCategory][$eq]=women';

    const [productCategory, setProductCategory] = useState(allProducts);

    const { data, error, isLoading } = useGetProductByNameQuery(productCategory);

    const theme = useTheme(ColorModeContext);
    const ToggleButtonStyles = {
        fontSize: "clamp(10px,calc(14px + (16 - 14) * (100vw - 1000px) / (1920 - 1000)),16px) !important",
        border: "1px solid #777 !important",
        borderRadius: "4px !important",
        padding: "5px 10px",
        color: theme.palette.text.primary,
        flexGrow: "1",
    }
    const handleAlignment = (event, newValue) => {
        if (newValue !== null) {
            setProductCategory(newValue);
        }
    };
    // const [value, setValue] = useState(2);

    //// Modal vars
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    if (data) {
        return (
            <Container maxWidth="xl" py={3} sx={{ marginTop: "15px" }} >
                <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"} flexWrap={"wrap"} gap={3} >
                    <Box>
                        <Typography fontSize={"20px"} fontWeight={"bold"}>Selected Products</Typography>
                        <Typography fontSize={"15px"} >All our new arrival in a exclusive brand collection</Typography>
                    </Box>
                    <Stack direction={"row"} alignItems={"center"} gap={3} sx={{ flexGrow: { xs: 1, sm: 0 } }}>
                        <ToggleButtonGroup
                            value={productCategory}
                            exclusive
                            onChange={handleAlignment}
                            aria-label="text alignment"
                            sx={{
                                gap: "10px !important",
                                ".Mui-selected": { background: `${theme.palette.sectionBgColor.main} !important` },
                                flexGrow: 1
                            }}
                        >
                            <ToggleButton sx={ToggleButtonStyles} value={allProducts} aria-label="left aligned">
                                All products
                            </ToggleButton>
                            <ToggleButton sx={ToggleButtonStyles} value={menProducts} aria-label="centered">
                                Men Category
                            </ToggleButton>
                            <ToggleButton sx={ToggleButtonStyles} value={womenProducts} aria-label="right aligned">
                                Women Category
                            </ToggleButton>

                        </ToggleButtonGroup>

                    </Stack>
                    <Box sx={{ flexGrow: .5, display: { xs: "none", sm: "block" } }}>
                    </Box>
                </Stack>
                <Stack className="products" sx={{ mt: "15px", py: "15px", gap: "25px 10px" }} direction={"row"} flexWrap={"wrap"} justifyContent={"space-between"}>
                    {
                        data.data.map((product, index) => (
                            <CardComponent key={index} productData={product} handelOpenModal={handleOpen} />
                        ))
                    }
                </Stack>
                <ProductDetails handleCloseModal={handleClose} open={open} />
                <ProductDetails handleCloseModal={handleClose} open={open} />
            </Container >
        );
    }
    else if (error) {
        return (
            <Typography sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                minHeight: "100px",
                fontSize: "clamp(16px,calc(18px + (30 - 14) * (100vw - 1000px) / (1920 - 1000)),35px) !important",
                fontWeight: "bold",
                WebkitTextStroke: ".1px purple",


            }} variant="h6"
                color={theme.palette.error.main}
            >
                {error.error} Data😔</Typography>
        )
    }
    else if (isLoading) {
        return (<>
            <Container maxWidth="xl" py={3} sx={{ marginTop: "15px" }}>
                <SkeletonFeedback />
            </Container>
        </>)
    }
    // eslint-disable-next-line react/prop-types
    function CardComponent({ productData, handelOpenModal }) {
        // const product = productData.attributes;
        // const baseURL = import.meta.env.VITE_BASE_URL;
        return (
            <Card sx={{
                flexGrow: 1,
                maxWidth: { xs: "100%", sm: "48%", md: "32%", lg: "24%", xl: 300 },
                cursor: "pointer",
                boxShadow: 3,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }}>
                <CardMedia
                    className="card-img"
                    component="img"
                    alt="green iguana"
                    height="245"

                    image={`${productData.attributes.productImages.data[0].attributes.url}`}
                    sx={{
                        boxShadow: 3, cursor: "pointer", flexGrow: 1, transition: "transform 0.35s ease-in-out",
                        "&:hover": {
                            transform: "scale(1.05) rotate(2deg)",
                        },
                        maxHeight: "245px"
                    }}
                />
                <CardContent sx={{
                    position: "relative", zIndex: "100 !important", bgcolor: "inherit", flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}>
                    <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
                        <Typography gutterBottom fontSize={"20px"} component="div">
                            {productData.attributes.productTitle}
                        </Typography>
                        <Typography gutterBottom fontSize={"16px"} component="div">
                            ${productData.attributes.productPrice}
                        </Typography>
                    </Stack>
                    <Typography fontSize={"16px"} color="text.secondary">
                        {productData.attributes.productDescription.slice(0, 120)}..
                    </Typography>
                </CardContent>
                <Stack sx={{ p: 1.4, bgcolor: "inherit" }} direction={"row"} justifyContent={"space-between"} alignItems={"center"} >
                    <Button size="small" sx={{ fontSize: "14px" }} onClick={handelOpenModal} >
                        <AddShoppingCartOutlinedIcon sx={{ marginRight: "5px", fontSize: "20px" }} />
                        Add To Cart
                    </Button>
                    <Rating name="read-only" value={productData.attributes.productRating} readOnly size="small" precision={0.5} />
                </Stack>
            </Card>
        );
    }
}

export default MainContent;

