/* eslint-disable react-hooks/exhaustive-deps */
// redux
import { useSelector, useDispatch } from "react-redux";
import { getAllOrdersPaginatedReducer } from "../../../redux/OrdersSlice/ApiOrdersSlice";

import { Box, Container, Stack, Typography, Button, } from "@mui/material";
import { useEffect, useState } from "react";


//// custom components
import PaginationBar from "../../GenericComponents/PaginationBar/PaginationBar";
import OrdersTable from "./OrdersTable";
import FilterBar from "../../GenericComponents/FilterBar/FilterBar";
import toast from 'react-hot-toast';
import LoaderComponent from "../../GenericComponents/LoaderComponent/LoaderComponent";


/// Icons
import SkeletonFeedbackRow from "../../GenericComponents/SkeletonFeedbackRow/SkeletonFeedbackRow";

///// General functions
import { IsUserLoggedIn } from "../../../General/GeneralFunctions";



const categoryOptions = ["All Category", "Clothes", "Electronics", "Furniture"];
const sortingOptions = ["Asc", "Desc"];


const OrdersComponent = () => {
    const dispatch = useDispatch();
    const orders = useSelector((state) => state.OrdersApiRequest.minOrdersResponse);
    const totalPagesNum = useSelector((state) => state.OrdersApiRequest.meta.totalPages)
    const error = useSelector((state) => state.OrdersApiRequest.error);
    const isLoading = useSelector((state) => state.OrdersApiRequest.isLoading);

    /// pagination logic

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [UiLimit, setUiLimit] = useState(limit);
    const totalPages = totalPagesNum || 1;


    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All Category");
    const [sorting, setSorting] = useState("Asc");


    useEffect(() => {
        (async function fetchData() {
            await dispatch(getAllOrdersPaginatedReducer({ page, limit, sorting }));

            if (IsUserLoggedIn()) ShowGreetingsMessage();
        })();

    }, [limit, page, sorting]);


    const handelShowContent = () => {
        if (isLoading) {
            return (<Container maxWidth="xl" sx={{ p: "0 !important" }}>
                <SkeletonFeedbackRow numOfSkeletons={limit} />
            </Container>)
        }
        else if (error || !orders) {
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
            )
        }
        else {
            return (
                <Box sx={{ minHeight: "inherit" }}>
                    <Stack gap={3} mt={2} sx={{ minHeight: "inherit" }}>
                        {orders && <OrdersTable orders={orders} />}
                    </Stack>

                    <PaginationBar page={page} setPage={setPage} totalPages={totalPages} />
                </Box>
            )
        }
    }

    return (
        <Container
            maxWidth="xl" py={3}
            sx={{
                px: { xs: 1, sm: 1, md: 2, lg: 3 },
                flexGrow: 1,
                minHeight: "inherit",
            }}
        >
            <FilterBar
                title={"Orders"}
                sorting={sorting}
                setSorting={setSorting}
                sortingOptions={sortingOptions}
                UiLimit={UiLimit}
                setLimit={setLimit}
                setUiLimit={setUiLimit}
            />

            {handelShowContent()}

        </Container >
    );
};

export default OrdersComponent;
