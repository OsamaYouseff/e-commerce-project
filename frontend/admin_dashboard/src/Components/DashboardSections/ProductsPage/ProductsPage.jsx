/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { Box, Container, Stack, Typography, Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";


//// custom component
import ProductCardComponent from "../../CardComponent/ProductCardComponent.jsx";

/// Icons
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SkeletonFeedbackCard from "../../GenericComponents/SkeletonFeedbackCard/SkeletonFeedbackCard";

///// Redux Actions
import { getAllProductsPaginatedReducer, searchForProductReducer } from "../../../redux/ProductSlice/ApiProductSlice";
import { useDispatch, useSelector } from "react-redux";
import { DoScrollToTop } from "../../../../../shared_files/General/GeneralFunctions.js";
import { IsUserLoggedIn } from "../../../General/GeneralFunctions.js";
import { Link } from "react-router-dom";
import FilterBar from "../../GenericComponents/FilterBar/FilterBar";
import PaginationBar from "../../GenericComponents/PaginationBar/PaginationBar";


const categoryOptions = ["All Category", "Clothes", "Electronics", "Furniture"];
const sortingOptions = ["Asc", "Desc"];


const ProductsPage = () => {

    DoScrollToTop();

    const dispatch = useDispatch();
    const products = useSelector((state) => state.ProductsApiRequest.response);
    const error = useSelector((state) => state.ProductsApiRequest.error);
    const isLoading = useSelector((state) => state.ProductsApiRequest.isLoading);
    const totalPagesNum = useSelector((state) => state.ProductsApiRequest.meta.totalPages)

    /// pagination logic
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [UiLimit, setUiLimit] = useState(limit);
    const totalPages = totalPagesNum || 1;


    // const [category, setCategory] = useState("All Category");
    const [sorting, setSorting] = useState("Asc");

    async function fetchData() {
        await dispatch(getAllProductsPaginatedReducer({ page, limit, sorting }));
    }
    useEffect(() => {
        if (IsUserLoggedIn()) {
            fetchData();
        } else {
            toast.error("Your not authorized to do this action🙂");
            setTimeout(() => {
                GoLoginPage();

            }, 1000);
        };

    }, [limit, page, sorting]);

    const handelShowContent = () => {

        if (error || !products) {
            return (<Container maxWidth="xl" py={3} sx={{ marginTop: ".9375rem" }}>
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
            </Container>)
        }
        else if (isLoading) {
            return (<Container maxWidth="xl" ><SkeletonFeedbackCard numOfSkeletons={limit} minWidth="225px" /> </Container>)
        }
        else if (products.length === 0) {
            return (
                <Container maxWidth="xl" py={3} sx={{ marginTop: ".9375rem" }}>
                    <Box

                        className="flex-column-center"
                        sx={{ minHeight: "50vh", gap: ".9375rem" }}
                    >
                        <Typography variant="h5">
                            No Products Found 😢
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
        else {
            return (<>
                <Stack
                    sx={{ mt: ".9375rem", py: ".9375rem", gap: ".9375rem .625rem" }}
                    direction={"row"}
                    flexWrap={"wrap"}
                    justifyContent={"space-between"}
                >
                    {products?.map((product) => (
                        <ProductCardComponent
                            key={product._id}
                            productData={product}
                        />
                    ))}
                </Stack>
                <PaginationBar page={page} setPage={setPage} totalPages={totalPages} />
            </>)
        }
    }

    const handelFilterSearch = (searchValue) => {
        dispatch(searchForProductReducer(searchValue.trim()));
    }

    return (
        <Container maxWidth="xl" py={3} sx={{ mb: 3 }}>
            <Link to="/add-product"
                style={{ position: "fixed", left: 30, bottom: 30, zIndex: 120 }}
            >
                <Button className="flex-center" variant="contained" color="success"
                    sx={{
                        maxWidth: { xs: "40px", md: "fit-content" },
                        minWidth: { xs: "40px", md: "fit-content" },
                        height: { xs: "40px", md: "35px" },
                        fontWeight: "bolder", gap: .7,
                        borderRadius: { xs: "50%", md: "6px" },
                    }}
                    size="small">
                    <AddCircleIcon sx={{ fontSize: { xs: "2rem", md: "1.5rem" } }} />
                    <Typography variant="h6" sx={{ fontSize: ".9rem", display: { xs: "none", md: "block" }, fontWeight: "bold" }}>Add Product</Typography>
                </Button>
            </Link>
            <FilterBar
                title={"Products"}
                sorting={sorting}
                setSorting={setSorting}
                sortingOptions={sortingOptions}
                UiLimit={UiLimit}
                setLimit={setLimit}
                setUiLimit={setUiLimit}
                handelFilterSearch={handelFilterSearch}
                searchName="Enter Product Name"
                resetSearch={fetchData}
            />
            {handelShowContent()}

        </Container >
    );

};






export default ProductsPage;
