import { Box, Button, Stack, Typography } from "@mui/material";
import AddressCard from "./AddressCard";

const AddressPage = () => {
    return (
        <Stack sx={{ minWidth: "67vw", height: "77vh" }}>
            <Box sx={{ mb: 2, px: { xs: 0.5, md: 1 } }}>
                <Typography
                    variant="h4"
                    sx={{
                        my: 1,
                        fontSize: { xs: "22px", md: "30px" },
                        fontWeight: "bolder",
                    }}
                >
                    Addresses
                </Typography>
                <Typography variant="body" sx={{ my: 1, fontSize: "15px" }}>
                    Manage your saved addresses for fast and easy checkout
                    across our marketplaces
                </Typography>
            </Box>

            <Button
                variant="contained"
                sx={{
                    maxWidth: "200px",
                    fontWeight: "bolder",
                    mb: 2,
                    mx: { xs: 0.5, md: 1 },
                }}
            >
                Add new address
            </Button>
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
                <AddressCard />
                {/*== Address Card ==*/}
            </Stack>
            {/*== Address List ==*/}
        </Stack>
    );
};

export default AddressPage;
