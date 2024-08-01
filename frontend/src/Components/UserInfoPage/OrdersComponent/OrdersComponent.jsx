import { Box, Stack, Typography } from "@mui/material";
import OrderCard from "./OrderCard";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useState } from "react";

const OrdersComponent = () => {
    const [historyDate, setHistoryDate] = useState("Last 3 months");

    const handleChange = (event) => {
        setHistoryDate(event.target.value);
    };
    return (
        <Stack sx={{ minWidth: "60vw", height: "77vh" }}>
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
                <Typography variant="body" sx={{ my: 1, fontSize: "18px" }}>
                    Completed
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
            {/* Address List */}
            <Stack
                sx={{
                    px: { xs: 0.5, md: 1 },
                    gap: 2,
                    mb: 2,
                    overflowY: "auto",
                    maxHeight: { xs: "auto", md: "70vh", lg: "60vh" },
                }}
            >
                {/* Address Card */}
                <OrderCard />
                {/*== Address Card ==*/}
            </Stack>
            {/*== Address List ==*/}
        </Stack>
    );
};

export default OrdersComponent;
