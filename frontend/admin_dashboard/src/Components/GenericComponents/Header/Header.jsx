// create react function
import { IconButton, Stack, Typography, useTheme } from "@mui/material";
import { DarkModeOutlined, LightModeOutlined } from "@mui/icons-material";
import { useContext } from "react";
import { ColorModeContext } from "../../../../../shared_files/Theme/theme.jsx";
import { Box } from "@mui/material";

import DashboardNavBarDrawer from "../../MainDashboard/DashboardNavBarDrawer/DashboardNavBarDrawer"


import { styled, alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import { Button } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import UserMenu from "./UserMenu";
import { GetUserInfo } from "../../../General/GeneralFunctions.js";

const transitionDuration = "350ms";

const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
        marginLeft: theme.spacing(3),
        width: "auto",
    },
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: ".0625rem solid #777",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: "inherit",
    "& .MuiInputBase-input": {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create("width"),
        width: "100%",
        [theme.breakpoints.up("md")]: {
            width: "20ch",
        },
    },
}));


function ToggleCustomerAvatar(userData) {
    return userData._id !== null ? (
        <IconButton

            aria-label="cart"
            sx={{
                transition: transitionDuration,
                "& :hover": { cursor: "pointer" },
            }}
        >
            <UserMenu />
        </IconButton>
    ) : (
        <Stack
            className="flex-between"
            sx={{
                flexDirection: "row", gap: ".3125rem", alignItems: "center",
                minHeight: { xs: "1rem", md: "2.5rem" },
                color: "#f9f9f9"
            }}
        >
            <Link to="/login">
                <Button sx={{
                    fontWeight: "bold", color: "#f9f9f9"
                }}
                >Login</Button>
            </Link>
            <span style={{ fontSize: "1rem" }}>/</span>
            <Link to="/register">
                <Button sx={{
                    fontWeight: "bold", color: "#f9f9f9"
                }}
                >Register</Button>
            </Link>
        </Stack>
    );
}


const Header = function () {
    const colorMode = useContext(ColorModeContext);
    const theme = useTheme();
    const fontSizeClamp = "clamp(1.1rem,calc(1.5rem + (30 - 12) * (100vw - 62.5rem) / (1920 - 1000)),1.4rem) !important";
    const userData = GetUserInfo();

    const currentPath = location.pathname;

    return (
        <Box
            sx={{
                width: "100vw",
                position: "relative",
            }}
        >
            <Box
                sx={{
                    bgcolor: "#1d273b",
                    borderRadius: "0rem 0rem .4375rem .4375rem",
                    width: "100vw !important",
                    position: { xs: "relative", md: "fixed" },
                    zIndex: "200",
                    px: { xs: 2, sm: 3, md: 4 },
                    py: 1,
                    pb: { xs: 0, md: 1 }

                }}
            >
                <Stack
                    className="flex-between"
                    gap={1}
                    sx={{
                        alignItems: "center",
                        bgcolor: "#1d273b",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: { xs: "center", sm: "space-between" },
                    }}
                >
                    <Box className="flex-center" sx={{ flexGrow: { xs: 0, sm: 0 }, textAlign: "center" }}>
                        <Link to={"/dashboard"} style={{ textDecoration: "none", flexGrow: 0 }}>
                            <Typography
                                variant="body"
                                sx={{
                                    fontSize: fontSizeClamp,
                                    fontWeight: "bolder",
                                    width: "fit-content",
                                    color: "white",
                                }}
                            >
                                EVO MARKET DASHBOARD
                            </Typography>
                        </Link>
                    </Box>

                    <Box className="flex-center" sx={{
                        order: { xs: 0, md: 2 }, flexGrow: { xs: 0, sm: 0 },
                    }}>
                        {/* User Icon */}
                        <Stack
                            alignItems={"center"}
                            direction={"row"}
                            spacing={1}
                        >
                            {ToggleCustomerAvatar(userData)}

                        </Stack>
                        {/*== User Icon ==*/}


                        {/*  Theme Icon */}
                        <Box sx={{ color: "white",/*border: ".0625rem solid #ffff",*/  borderRadius: ".5rem", ml: 1 }}>
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
                                    sx={{ p: 0.4 }}
                                >
                                    <DarkModeOutlined sx={{ fontSize: "1.75rem" }} />
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
                                    sx={{ p: 0.4 }}
                                >
                                    <LightModeOutlined sx={{ fontSize: "1.75rem" }} />
                                </IconButton>
                            )}
                        </Box>
                        {/*== Theme Icon==*/}
                    </Box>

                    {/* Search */}
                    <Box
                        className="flex-center"
                        flexGrow={0.6}
                        sx={{
                            p: 0,
                            minWidth: { xs: "100%", md: "9.375rem" },
                            mb: 2
                        }}
                    >
                        <Box sx={{
                            display: { xs: (currentPath === "/login" ? "none" : "block"), md: "none" },
                            maxWidth: "fit-content", mr: 1
                        }}>
                            <DashboardNavBarDrawer userData={userData} />
                        </Box>

                        <Search
                            sx={{
                                p: 0,
                                borderRadius: "1.5625rem",
                                bgcolor: theme.palette.bgColor.main,
                                maxHeight: "2.5rem !important",
                                flexGrow: 1,
                                margin: "0 !important",
                                display: (currentPath === "/login" ? "none" : "block"),
                            }}
                        >
                            <SearchIconWrapper>
                                <SearchIcon sx={{ color: "#777" }} />
                            </SearchIconWrapper>
                            <StyledInputBase
                                placeholder="Search…"
                                value={"Search…"}
                                // readOnly={true}
                                autoComplete="off"
                                inputProps={{ "aria-label": "search" }}
                                sx={{ flex: 1 }}
                            />
                        </Search>
                    </Box>
                    {/*== Search ==*/}
                </Stack>
            </Box >
        </Box >

    );
};



export default Header;
