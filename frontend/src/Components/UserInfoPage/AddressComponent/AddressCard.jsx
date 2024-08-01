import { Box, Button, Stack } from "@mui/material";
import { useTheme } from "@emotion/react";
import { ColorModeContext } from "../../../Theme/theme";

const AddressCard = () => {
    const theme = useTheme(ColorModeContext);

    return (
        <Box
            sx={{
                bgcolor: theme.palette.natural.main,
                px: 2,
                pt: 1,
                pb: 2,
                borderRadius: "6px",
                boxShadow: 1,
            }}
        >
            <Stack
                direction={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
            >
                <p style={{ fontWeight: "bolder" }}>Home Address</p>
                <Box className="flex-between" sx={{ gap: 2 }}>
                    <Button sx={{ fontWeight: "bolder" }}>Edit</Button>
                    <Button color="error" sx={{ fontWeight: "bolder" }}>
                        Delete{" "}
                    </Button>
                </Box>
            </Stack>

            <Stack className="flex-start-row" gap={4}>
                <p style={{ fontWeight: "bolder", minWidth: "50px" }}>Name</p>
                <Box
                    className="flex-between"
                    sx={{ gap: 2, fontWeight: "bolder" }}
                >
                    Osama Yousef Abdallah
                </Box>
            </Stack>

            <Stack
                className="flex-start-row"
                gap={4}
                sx={{ maxWidth: { xs: "100%", md: "390px" } }}
            >
                <p
                    style={{
                        fontWeight: "bolder",
                        marginTop: 0,
                        minWidth: "50px",
                    }}
                >
                    Address
                </p>
                <Box className="flex-center" sx={{ gap: 2 }}>
                    المعهد الدينى للمرحلة الابتدائية, كفري بهيدة وإبراهيم شرف -
                    ميت غمر - الدقهلية Gharbia, Egypt
                </Box>
            </Stack>

            <Stack className="flex-start-row" gap={4}>
                <p style={{ fontWeight: "bolder", minWidth: "50px" }}>Phone</p>
                <Box
                    className="flex-between"
                    sx={{ gap: 2, fontWeight: "bolder" }}
                >
                    +20 1167890472
                </Box>
            </Stack>
        </Box>
    );
};

export default AddressCard;
