/* eslint-disable react/prop-types */
import { Box, Button, Typography } from "@mui/material";

export const SomeThingWrong = ({ minHeight, errorMsg }) => {
    return (
        <Box
            className="flex-column-center"
            sx={{ minHeight: minHeight, gap: "15px" }}
        >
            <Typography variant="h6">{errorMsg}</Typography>
            <Button
                variant="contained"
                onClick={() => window.location.reload()}
                sx={{ fontWeight: "bold" }}
            >
                Reload Page
            </Button>
        </Box>
    );
};
