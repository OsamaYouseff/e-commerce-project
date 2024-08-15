/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Stack, Typography, Button } from "@mui/material";
import OrderCard from "./OrderCard";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useEffect, useState } from "react";

/// custom component
import LoaderComponent from "../../GenericComponents/LoaderComponent/LoaderComponent";

// redux
import { useSelector, useDispatch } from "react-redux";
import { getCustomerOrdersMinimizedReducer } from "../../../redux/OrdersSlice/ApiOrdersSlice";
import NoItemsComponent from "../../GenericComponents/NoItemsComponent/NoItemsComponent";

const OrdersComponent = () => {
    const [historyDate, setHistoryDate] = useState("Last 3 months");
    const dispatch = useDispatch();
    const customerOrders = useSelector((state) => state.OrdersApiRequest.minOrdersResponse);
    const error = useSelector((state) => state.OrdersApiRequest.error);
    const isLoading = useSelector((state) => state.OrdersApiRequest.isLoading);

    // console.log(customerOrders);

    //// Modal vars
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [PreviewedProduct, setPreviewedProduct] = useState({ id: 2, attributes: {} });

    const handleChange = (event) => setHistoryDate(event.target.value);
    const handleSetPreviewedProduct = (newValue) => setPreviewedProduct(newValue);



    const handelShowOrdersItems = () => {
        if (error) {
            return (
                <Box
                    className="flex-column-center"
                    sx={{ minHeight: "50vh", gap: "15px" }}
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
        } else if (customerOrders?.length === 0) {
            return (
                <NoItemsComponent message="You don't have any orders yet 😅" fontSize={"1.2rem"} minHeight="50vh" />
            );
        }
        return customerOrders.map((order) => (
            <OrderCard
                key={order.orderId}
                order={order}
                handelOpenModal={handleOpen}
                handleSetPreviewedProduct={handleSetPreviewedProduct}
            />
        ));
    };

    useEffect(() => {
        dispatch(getCustomerOrdersMinimizedReducer());
    }, []);

    return (
        <Stack sx={{ minWidth: "60vw" }}>
            <Box sx={{ mb: 2, px: { xs: 0.5, md: 1 } }}>
                <Typography
                    variant="h4"
                    sx={{
                        my: 1,
                        fontSize: {
                            xs: "22px",
                            md: "30px",
                            fontWeight: "bolder",
                        },
                    }}
                >
                    Orders
                </Typography>
                <Typography variant="body" sx={{ my: 1, fontSize: "15px" }}>
                    View the delivery status for items and your order history
                </Typography>
            </Box>

            <Stack
                mb={2}
                px={1}
                sx={{
                    flexDirection: { xs: "column-reverse", md: "row" },
                    gap: 1,
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                }}
            >
                <Typography
                    variant="body"
                    sx={{ my: 1, fontSize: "20px", fontWeight: "bolder" }}
                >
                    All Status
                </Typography>
                <Stack direction={"row"} alignItems={"center"} gap={2}>
                    <OutlinedInput placeholder="Find your order" size="small" />

                    <Select
                        labelId="select-date"
                        id="select-date"
                        value={historyDate}
                        label="History"
                        size="small"
                        sx={{
                            minWidth: 160,
                            "legend > span": {
                                display: "none",
                            },
                        }}
                        onChange={handleChange}
                    >
                        <MenuItem value={"Last 3 months"}>
                            Last 3 months
                        </MenuItem>
                        <MenuItem value={"Last 6 months"}>
                            Last 6 months
                        </MenuItem>
                        <MenuItem value={`${new Date().getFullYear() - 1}`}>
                            {`${new Date().getFullYear() - 1}`}
                        </MenuItem>
                    </Select>
                </Stack>
            </Stack>
            {/* Order List */}
            <Stack
                sx={{
                    px: { xs: 0.5, md: 1 },
                    gap: 2,
                    mb: 2,
                }}
            >
                {/* Order Card */}
                {/* <OrderCard /> */}
                {isLoading ? <LoaderComponent /> : handelShowOrdersItems()}
                {/*== Order Card ==*/}
            </Stack>
            {/*== Order List ==*/}
        </Stack>
    );
};

export default OrdersComponent;
