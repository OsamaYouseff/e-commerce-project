/* eslint-disable react/prop-types */
import { Box, Button, Typography } from "@mui/material";

export const SomeThingWrong = ({ minHeight, errorMsg, additionalElements }) => {
    return (
        <Box
            className="flex-column-center"
            sx={{ minHeight: minHeight, gap: ".9375rem", width: "100%" }}
        >
            <Typography variant="h6" sx={{ color: "#ff0057", fontWeight: "bold" }}>{errorMsg}</Typography>
            <Button
                variant="contained"
                onClick={() => window.location.reload()}
                sx={{ fontWeight: "bold" }}
            >
                Reload Page
            </Button>

            {additionalElements}
        </Box>
    );
};
