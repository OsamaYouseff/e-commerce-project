import * as React from "react";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import { Box } from "@mui/material";

function GradientCircularProgress() {
    return (
        <React.Fragment>
            <svg width={0} height={0}>
                <defs>
                    <linearGradient
                        id="my_gradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                    >
                        <stop offset="0%" stopColor="#e01cd5" />
                        <stop offset="100%" stopColor="#1CB5E0" />
                    </linearGradient>
                </defs>
            </svg>
            <CircularProgress
                sx={{ "svg circle": { stroke: "url(#my_gradient)" } }}
            />
        </React.Fragment>
    );
}

export default function CircularLoaderComponent() {
    return (
        <Box
            className="flex-center "
            sx={{
                height: "100vh",
                width: "100vw",
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 9999,
                bgcolor: "rgba(0, 0, 0, 0.85)",
            }}
        >
            <GradientCircularProgress />
        </Box>
    );
}
