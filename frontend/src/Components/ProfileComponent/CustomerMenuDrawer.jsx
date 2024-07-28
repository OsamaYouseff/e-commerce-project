import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../Theme/theme";
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
                width: { xs: "100vw", sm: "390px" },
                p: { xs: 2, sm: 2 },
                pr: 1,
                bgcolor: theme.palette.categoryColor.main,
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
                    color: theme.palette.text.primary,
                    marginTop: "15px",
                    zIndex: 1,
                    "&:hover": { bgcolor: "transparent" },
                }}
                onClick={toggleDrawer("left", false)}
            >
                <CloseRoundedIcon
                    sx={{
                        fontSize: "45px",
                        width: "35px",
                        height: "35px",
                        cursor: "pointer",
                        borderRadius: "50%",
                        p: 0.2,
                        color: theme.palette.text.primary,
                        border: `2px solid ${theme.palette.text.primary}`,
                        "&:hover": {
                            rotate: "180deg",
                            color: "#ff6e6e",
                            borderColor: "#ff6e6e",
                        },
                        transition: "0.35s",
                    }}
                    onClick={toggleDrawer("left", false)}
                />
            </Button>
            {/*== Close Button ==*/}
        </Box>
    );

    return (
        <div
            style={{
                width: "48px",
                height: "38px",
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
        </div>
    );
}
