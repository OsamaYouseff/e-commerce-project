/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { Box, Container, Stack, Typography, Button } from "@mui/material";
import { useEffect, useState } from "react";

//// custom component
import ProductCardComponent from "../../CardComponent/ProductCardComponent";
import toast from 'react-hot-toast';

/// Icons
import ProductDetails from "../../CardComponent/ProductDetails/ProductDetails";
import SkeletonFeedback from "../../GenericComponents/SkeletonFeedback/SkeletonFeedback";

///// Redux Actions
import { getAllProductsPaginatedReducer } from "../../../redux/ProductSlice/ApiProductSlice";
import { useDispatch, useSelector } from "react-redux";
import { IsUserLoggedIn } from "../../../General/GeneralFunctions";


let storedContent = [];

function ShowGreetingsMessage() {
    let prevPage = document.referrer.split("/").at(-1);
    if (prevPage === "login") {
        toast.success("Login successfully ,Welcome Back !😀");
    } else if (prevPage === "register") {
        toast.success("Registered successfully ,Welcome !😀");
    }
}


const MainContent = () => {

    const dispatch = useDispatch();
    const products = useSelector((state) => state.ProductsApiRequest.response);
    const error = useSelector((state) => state.ProductsApiRequest.error);
    const isLoading = useSelector((state) => state.ProductsApiRequest.isLoading);
    const totalPagesNum = useSelector((state) => state.ProductsApiRequest.meta.totalPages)

    const handleSetPreviewedProduct = (newValue) => {
        setPreviewedProduct(newValue);
    };

    //// Modal vars
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [PreviewedProduct, setPreviewedProduct] = useState({ id: 2, attributes: {} });


    //// pagination logic
    const [page, setPage] = useState(1);
    const totalPages = totalPagesNum || 1;
    const limit = 8;


    useEffect(() => {
        if (products.length > 0) {
            storedContent.push(...products);
        }

        (async function fetchData() {
            await dispatch(getAllProductsPaginatedReducer({ page: page, limit: limit }));

            if (IsUserLoggedIn()) ShowGreetingsMessage();
        })();

    }, [page]);


    const handleNextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    const handleScroll = () => {

        if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
            document.querySelector(".more").click();
        }

    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (isLoading && storedContent.length === 0) {
        return (
            <Container maxWidth="xl" py={3} sx={{ marginTop: "4.6875rem" }}>
                <Box sx={{ marginY: ".9375rem" }}>
                    <SkeletonFeedback numOfSkeletons={20} />
                </Box>
            </Container>
        );
    }

    if (error || !products) {
        return (
            <Container maxWidth="xl" py={3} sx={{ marginTop: ".9375rem" }}>
                <Box
                    className="flex-column-center"
                    sx={{ minHeight: "50vh", gap: ".9375rem" }}
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

    return (
        <Container maxWidth="xl" py={3} sx={{ marginTop: ".9375rem" }}>
            <Stack
                direction={"row"}
                alignItems={"center"}
                justifyContent={"space-between"}
                flexWrap={"wrap"}
                gap={3}
            >
                <Box>
                    <Typography fontSize={"1.25rem"} fontWeight={"bold"}>
                        Selected Products
                    </Typography>
                    <Typography fontSize={".9375rem"}>
                        All our new arrival in a exclusive brand collection
                    </Typography>
                </Box>
                <Stack
                    direction={"row"}
                    alignItems={"center"}
                    gap={3}
                    sx={{ flexGrow: { xs: 1, sm: 0 } }}
                >
                </Stack>
                <Box
                    sx={{
                        flexGrow: 0.5,
                        display: { xs: "none", sm: "block" },
                    }}
                ></Box>
            </Stack>
            <Stack
                sx={{ mt: ".9375rem", py: ".9375rem", gap: ".9375rem .625rem" }}
                direction={"row"}
                flexWrap={"wrap"}
                justifyContent={"space-between"}
            >
                {
                    storedContent?.map((product) => (
                        <ProductCardComponent
                            key={product._id}
                            productData={product}
                            handelOpenModal={handleOpen}
                            handleSetPreviewedProduct={
                                handleSetPreviewedProduct
                            }
                        />
                    ))
                }

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
            <Button variant="outlined" className="more" size="small" sx={{ minWidth: "5rem", scale: "0" }} onClick={handleNextPage} disabled={page >= totalPages}>Next</Button>
        </Container>
    );

};

export default MainContent;
