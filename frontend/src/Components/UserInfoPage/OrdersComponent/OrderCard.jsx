import { Box, Button, Stack, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import { ColorModeContext } from "../../../Theme/theme";

const AddressCard = () => {
    const theme = useTheme(ColorModeContext);

    return (
        <Box
            sx={{
                bgcolor: theme.palette.natural.main,
                px: 2,
                pt: 2,
                pb: 2,
                borderRadius: "6px",
                boxShadow: 1,
            }}
        >
            <Box sx={{ fontSize: { xs: "13px", sm: "15px" } }} mb={2}>
                <span style={{ fontWeight: "bold", color: "#38ae04" }}>
                    Delivered{" "}
                </span>{" "}
                on Saturday, 9th Sep, 01:59 PM
            </Box>

            <Stack
                className="flex-start-row"
                sx={{
                    flexDirection: {
                        xs: "column !important",
                        md: "row !important",
                    },
                    mb: { xs: 1, sm: 4 },
                }}
                gap={4}
            >
                <Box className="flex-row-start" sx={{ gap: 2, flexGrow: 1 }}>
                    <img
                        src="https://m.media-amazon.com/images/I/51zhuXxYuRL._AC_SL1080_.jpg"
                        alt="product-img"
                        style={{ width: "65px", height: "70px" }}
                    />
                    <Typography
                        sx={{ fontSize: "15px", maxWidth: { xs: "100%" } }}
                    >
                        BX500 3D NAND SATA 2.5-inch SSD 240 GB crucial BX500 3D
                        NAND SATA 2.5-inch SSD 240 GB
                    </Typography>
                </Box>
                <Box
                    sx={{
                        gap: 2,
                        borderLeft: "1px solid grey",
                        pl: 1,
                        width: "100%",
                    }}
                >
                    <Typography fontSize={"15px"}>
                        Share your shopping experience
                    </Typography>
                    <Stack direction={"row"} gap={2} sx={{ mt: 1 }}>
                        <Button sx={{ flexGrow: 1 }}>SELLER</Button>
                        <Button sx={{ flexGrow: 1 }}>PRODUCT</Button>
                        <Button sx={{ flexGrow: 1 }}>DELIVERY</Button>
                    </Stack>
                </Box>
            </Stack>
            <Typography sx={{ fontSize: "12px", textAlign: "right" }}>
                Order ID <span>NEGF90071920411</span>
            </Typography>
        </Box>
    );
};

export default AddressCard;
