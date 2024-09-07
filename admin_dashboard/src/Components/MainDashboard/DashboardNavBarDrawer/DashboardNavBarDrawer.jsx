/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import { Stack, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../../Theme/theme.jsx";
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

import { Link } from "react-router-dom";

//// hooks
import { useState } from "react";

// Custom components
import LoaderComponent from "../../GenericComponents/LoaderComponent/LoaderComponent.jsx";
import toast from 'react-hot-toast';
import DashboardNavBar from "../DashboardNavBar/DashboardNavBar.jsx";



export default function DashboardNavBarDrawer() {
    const [state, setState] = useState({ left: false });
    const theme = useTheme(ColorModeContext);

    /// styles
    const transitionDuration = "350ms";


    //// handlers
    const toggleDrawer = (anchor, open) => (event) => {
        if (
            event.type === "keydown" &&
            (event.key === "Tab" || event.key === "Shift")
        ) {
            return;
        }
        setState({ ...state, [anchor]: open });
    };


    const list = (anchor) => (
        <Box
            className="flex-between-column"
            sx={{
                width: { xs: "18.75rem", sm: "16.25rem" },
                p: { xs: 1, sm: 2 },
                // pr: { xs: 0, sm: 2 },
                bgcolor: "categoryColor.main",
                height: "100vh",
                overflow: "auto",
                overflowX: "hidden",

            }}
            role="presentation"
        >
            {/* Close Button */}
            <Button
                className="border"

                size="small"
                sx={{
                    position: "absolute", right: 0, top: -10, color: "text.primary", marginTop: ".9375rem", zIndex: 1, "&:hover": { bgcolor: "transparent" },
                }}
                onClick={toggleDrawer("left", false)}
            >
                <CloseRoundedIcon
                    sx={{
                        fontSize: "2.8125rem", width: "2.1875rem", height: "2.1875rem", cursor: "pointer",
                        borderRadius: "50%", p: 0.2, color: "text.primary",
                        border: `.125rem solid ${theme.palette.text.primary}`,
                        "&:hover": { rotate: "180deg", color: "#ff6e6e", borderColor: "#ff6e6e", },
                        transition: "0.35s",
                    }}
                    onClick={toggleDrawer("left", false)}
                />
            </Button>
            {/*== Close Button ==*/}

            <DashboardNavBar />


        </Box>
    );

    return (
        <Box
            style={{
                width: "2.25rem",
                height: "2.25rem",
                color: theme.palette.text.primary,
            }}
        >
            <MenuRoundedIcon

                onClick={toggleDrawer("left", true)}
                sx={{ transition: transitionDuration, fontSize: "2.1875rem", cursor: "pointer", color: "#ffffff" }}
            />
            <Drawer
                anchor={"left"}
                open={state["left"]}
                onClose={toggleDrawer("left", false)}
            >
                {list("left")}
            </Drawer>
        </Box>
    );
}
