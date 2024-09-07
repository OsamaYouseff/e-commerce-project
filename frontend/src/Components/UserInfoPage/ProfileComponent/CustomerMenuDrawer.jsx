/* eslint-disable no-unused-vars */
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../../Theme/theme";
import { useState } from "react";

export default function CustomerMenuDrawer() {
    const [state, setState] = useState({ left: false });
    const theme = useTheme(ColorModeContext);

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
                width: { xs: "100vw", sm: "24.375rem" },
                p: { xs: 2, sm: 2 },
                pr: 1,
                bgcolor: "categoryColor.main",
                height: "100vh",
                overflow: "auto",
            }}
            role="presentation"
        // onClick={toggleDrawer(anchor, false)}
        // onKeyDown={toggleDrawer(anchor, false)}
        >
            {/* Close Button */}
            <Button
                sx={{
                    position: "absolute",
                    left: 8,
                    top: -10,
                    color: "text.primary",
                    marginTop: ".9375rem",
                    zIndex: 1,
                    "&:hover": { bgcolor: "transparent" },
                }}
                onClick={toggleDrawer("left", false)}
            >
                <CloseRoundedIcon
                    sx={{
                        fontSize: "2.8125rem", width: "2.1875rem", height: "2.1875rem", cursor: "pointer", borderRadius: "50%", p: 0.2, color: "text.primary", border: `.125rem solid ${theme.palette.text.primary}`, "&:hover": { rotate: "180deg", color: "#ff6e6e", borderColor: "#ff6e6e", }, transition: "0.35s",
                    }}
                    onClick={toggleDrawer("left", false)}
                />
            </Button>
            {/*== Close Button ==*/}
        </Box>
    );

    return (
        <Box
            style={{
                width: "3rem",
                height: "2.375rem",
                color: theme.palette.text.primary,
            }}
        >
            <Drawer
                anchor={"left"}
                open={state["left"]}
                onClose={toggleDrawer("left", false)}
            >
                {list("left")}
            </Drawer>

            <Button onClick={toggleDrawer("left", true)} color="primary">
                User
            </Button>
        </Box>
    );
}
