// create react function
import { IconButton, Stack, Typography, useTheme } from "@mui/material";
import { DarkModeOutlined, LightModeOutlined } from "@mui/icons-material";
import { useContext } from "react";
import { ColorModeContext } from "../../../../../shared_files/Theme/theme";
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
    fontSize: "1.25rem",
    color: "white",
    cursor: "pointer",
};

const TopHeader = function () {
    const colorMode = useContext(ColorModeContext);
    const theme = useTheme();
    const fontSizeClamp =
        "clamp(.625rem,calc(.75rem + (16 - 12) * (100vw - 62.5rem) / (1920 - 1000)),1rem) !important";

    return (
        <Box
            sx={{
                bgcolor: "#1d273b",
                py: 0.3,
                borderRadius: "0rem 0rem .4375rem .4375rem",
            }}
        >
            <Container direction={"row"} maxWidth="xl">
                <Stack
                    className="top-header"
                    direction={"row"}
                    gap={1}
                    sx={{
                        paddingY: "0rem",
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
                            padding: ".1875rem .9375rem",
                            borderRadius: ".625rem",
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
                                        theme.palette.mode === "dark" ? "light" : "dark"
                                    );
                                    colorMode.toggleColorMode();
                                }}
                                color="inherit"
                                aria-label="Switch to dark mode"
                            >
                                <DarkModeOutlined sx={{ fontSize: "1.25rem" }} />
                            </IconButton>
                        ) : (
                            <IconButton
                                onClick={() => {
                                    localStorage.setItem(
                                        "mode",
                                        theme.palette.mode === "dark" ? "light" : "dark"
                                    );
                                    colorMode.toggleColorMode();
                                }}
                                color="inherit"
                                aria-label="Switch to light mode"
                            >
                                <LightModeOutlined sx={{ fontSize: "1.25rem" }} />
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
                    aria-controls="change-language-menu"
                    aria-label="Select language"
                    aria-expanded={open ? "true" : "false"}
                    onClick={handleClickListItem}
                    sx={{
                        padding: "0rem .3125rem",
                        color: "white !important",
                    }}
                >
                    <ListItemText
                        sx={{
                            ".css-mbfek": {
                                color: "white !important",
                                height: "1.125rem",
                            },
                            ".css-1ijlrmj-MuiTypography-root": {
                                color: "white !important",
                                height: "1.125rem",
                            },
                            ".css-83ijpv-MuiTypography-root": {
                                color: "white !important",
                                height: "1.125rem",
                            },
                        }}
                        secondary={options[selectedIndex]}
                    />
                    <ExpandMoreIcon sx={{ color: "white", fontSize: "1.5rem" }} />
                </ListItemButton>
            </List>
            <Menu
                id="change-language-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    "aria-labelledby": "change-language-menu",
                    role: "listbox",
                }}
            >
                {options.map((option, index) => (
                    <MenuItem
                        sx={{ fontSize: "1rem", padding: ".1875rem 1.125rem" }}
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
