// create react function
import { IconButton, Stack, Typography, useTheme } from "@mui/material";
import { DarkModeOutlined, LightModeOutlined } from "@mui/icons-material";
import { useContext } from "react";
import { ColorModeContext } from "../../../Theme/theme";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Container from "@mui/material/Container";
import { Box } from "@mui/material";
import { useState } from "react";

import FacebookIcon from "@mui/icons-material/Facebook";
import XIcon from "@mui/icons-material/X";
import InstagramIcon from "@mui/icons-material/Instagram";

const options = ["AR", "EN"];

const IconsStyles = {
    fontSize: "20px",
    color: "white",
    cursor: "pointer",
};

const TopHeader = function () {
    const colorMode = useContext(ColorModeContext);
    const theme = useTheme();
    const fontSizeClamp =
        "clamp(10px,calc(12px + (16 - 12) * (100vw - 1000px) / (1920 - 1000)),16px) !important";

    return (
        <Box
            sx={{
                bgcolor: "#1d273b",
                py: 0.3,
                borderRadius: "0px 0px 7px 7px",
            }}
        >
            <Container direction={"row"} maxWidth="xl">
                <Stack
                    className="top-header"
                    direction={"row"}
                    gap={1}
                    sx={{
                        paddingY: "0px",
                        alignItems: "center",
                        bgcolor: "#1d273b",
                    }}
                >
                    <Typography
                        variant="body"
                        sx={{
                            fontSize: fontSizeClamp,
                            fontWeight: "bolder",
                            bgcolor: "#a80c41",
                            width: "fit-content",
                            color: "white",
                            padding: "3px 15px",
                            borderRadius: "10px",
                        }}
                    >
                        HOT
                    </Typography>

                    <Typography
                        variant="body"
                        fontSize={fontSizeClamp}
                        sx={{ fontWeight: "bold", color: "white" }}
                    >
                        Free Express shopping{" "}
                    </Typography>

                    <Box style={{ flexGrow: 1 }}> </Box>

                    <FacebookIcon sx={IconsStyles} />
                    <XIcon sx={IconsStyles} />
                    <InstagramIcon sx={IconsStyles} />

                    <SimpleListMenu />

                    {/* theme icon */}
                    <Box style={{ color: "white" }}>
                        {theme.palette.mode === "light" ? (
                            <IconButton
                                onClick={() => {
                                    localStorage.setItem(
                                        "mode",
                                        theme.palette.mode === "dark"
                                            ? "light"
                                            : "dark"
                                    );
                                    colorMode.toggleColorMode();
                                }}
                                color="inherit"
                            >
                                <LightModeOutlined sx={{ fontSize: "20px" }} />
                            </IconButton>
                        ) : (
                            <IconButton
                                onClick={() => {
                                    localStorage.setItem(
                                        "mode",
                                        theme.palette.mode === "dark"
                                            ? "light"
                                            : "dark"
                                    );
                                    colorMode.toggleColorMode();
                                }}
                                color="inherit"
                            >
                                <DarkModeOutlined sx={{ fontSize: "20px" }} />
                            </IconButton>
                        )}
                    </Box>
                    {/*==theme icon==*/}
                </Stack>
            </Container>
        </Box>
    );
};

function SimpleListMenu() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(1);
    const open = Boolean(anchorEl);
    const handleClickListItem = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuItemClick = (event, index) => {
        setSelectedIndex(index);
        setAnchorEl(null);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box>
            <List
                component="nav"
                aria-label="Device settings"
                sx={{
                    padding: 0,
                }}
            >
                <ListItemButton
                    id="lock-button"
                    aria-haspopup="listbox"
                    aria-controls="lock-menu"
                    aria-expanded={open ? "true" : undefined}
                    onClick={handleClickListItem}
                    sx={{
                        padding: "0px 5px",
                        color: "white !important",
                    }}
                >
                    <ListItemText
                        sx={{
                            ".css-mbfek": {
                                color: "white !important",
                                height: "18px",
                            },
                            ".css-1ijlrmj-MuiTypography-root": {
                                color: "white !important",
                                height: "18px",
                            },
                            ".css-83ijpv-MuiTypography-root": {
                                color: "white !important",
                                height: "18px",
                            },
                        }}
                        secondary={options[selectedIndex]}
                    />
                    <ExpandMoreIcon sx={{ color: "white", fontSize: "24px" }} />
                </ListItemButton>
            </List>
            <Menu
                id="lock-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    "aria-labelledby": "lock-button",
                    role: "listbox",
                }}
            >
                {options.map((option, index) => (
                    <MenuItem
                        sx={{ fontSize: "16px", padding: "3px 18px" }}
                        key={option}
                        // disabled={index === 0}
                        selected={index === selectedIndex}
                        onClick={(event) => handleMenuItemClick(event, index)}
                    >
                        {option}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}

export default TopHeader;
