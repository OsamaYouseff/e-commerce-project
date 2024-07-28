import { Box, Stack, Typography } from "@mui/material";
import Container from "@mui/material/Container";
import LocalGroceryStoreOutlinedIcon from "@mui/icons-material/LocalGroceryStoreOutlined";
import { styled, alpha, useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import { ColorModeContext } from "../../../Theme/theme";
import CartDrawer from "../../CartDrawer/CartDrawer";
import SimpleListMenu from "./SimpleListMenu";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { useContext, useEffect } from "react";
import CustomerMenu from "./CustomerMenu";
import { CustomerContext } from "../../../Contexts/CustomerContext";

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
    border: "1px solid #777",
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

function ToggleCustomerAvatar(customerData) {
    return customerData.id !== null ? (
        <IconButton
            aria-label="cart"
            sx={{
                transition: transitionDuration,
                "& :hover": { cursor: "pointer" },
            }}
        >
            <CustomerMenu />
        </IconButton>
    ) : (
        <Stack
            className="flex-between"
            sx={{ flexDirection: "row", gap: "5px", alignItems: "center" }}
        >
            <Link to="/login">
                <Button sx={{ fontWeight: "bold" }}>Login</Button>
            </Link>
            <span style={{ fontSize: "16px" }}>/</span>
            <Link to="/register">
                <Button sx={{ fontWeight: "bold" }}>Register</Button>
            </Link>
        </Stack>
    );
}

const MidHeader = function () {
    const theme = useTheme(ColorModeContext.theme);
    const fontSizeClamp =
        "clamp(11px,calc(12px + (14 - 12) * (100vw - 1000px) / (1920 - 1000)),14px) !important";

    const { customerData } = useContext(CustomerContext);

    // const customerData = JSON.parse(localStorage.getItem("customerInfo"));

    // console.log(JSON.parse(localStorage.getItem("customerInfo")).id);

    useEffect(() => { }, [customerData]);

    return (
        <Container maxWidth="xl" sx={{ marginTop: "15px" }}>
            <Stack
                className=""
                sx={{
                    display: "flex",
                    flexDirection: { xs: "row-reverse", md: "row" },
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                }}
            >
                {/* Logo */}
                <a href="/" style={{ textDecoration: "none" }}>
                    <Stack
                        alignItems={"center"}
                        sx={{
                            order: { md: -1 },
                            textDecoration: "none",
                            color: theme.palette.text.primary,
                        }}
                    >
                        <LocalGroceryStoreOutlinedIcon
                            sx={{ fontSize: "28px" }}
                        />
                        <Typography
                            variant="body"
                            sx={{
                                border: "none",
                                fontSize: fontSizeClamp,
                                fontWeight: "bolder",
                                textDecoration: "none",
                            }}
                        >
                            E-Commerce
                        </Typography>
                    </Stack>
                </a>
                {/*== Logo ==*/}

                {/* Search */}
                <Box
                    flexGrow={0.6}
                    sx={{ p: 0, minWidth: { xs: "100%", md: "150px" } }}
                >
                    <Search
                        sx={{
                            p: 0,
                            borderRadius: "25px",
                            bgcolor: theme.palette.bgColor.main,
                            maxHeight: "40px !important",
                            minWidth: "100%",
                            margin: "0 !important",
                        }}
                    >
                        <SearchIconWrapper>
                            <SearchIcon sx={{ color: "#777" }} />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            inputProps={{ "aria-label": "search" }}
                            sx={{ flex: 1 }}
                        />
                        <SimpleListMenu />
                    </Search>
                </Box>
                {/*== Search ==*/}

                {/* Icons */}
                <Stack
                    alignItems={"center"}
                    direction={"row"}
                    sx={{ [theme.breakpoints.down("md")]: { order: -1 } }}
                >
                    {ToggleCustomerAvatar(customerData)}
                    <IconButton
                        aria-label="cart"
                        sx={{ p: 0.2, aspectRatio: "1" }}
                    >
                        <CartDrawer />
                    </IconButton>
                </Stack>
                {/*== Icons ==*/}
            </Stack>
        </Container>
    );
};

export default MidHeader;
