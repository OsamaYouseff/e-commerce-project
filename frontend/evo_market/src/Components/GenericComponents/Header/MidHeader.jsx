import { Box, Stack, Typography } from "@mui/material";
import Container from "@mui/material/Container";
import { styled, alpha, useTheme } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import { ColorModeContext } from "../../../../../shared_files/Theme/theme.jsx";
import CartDrawer from "../../CartDrawer/CartDrawer";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";


import IconButton from "@mui/material/IconButton";
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

////redux
import { useDispatch } from "react-redux";

///// custom components
import CustomerMenu from "./CustomerMenu";

//// general functions
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

function ToggleCustomerAvatar(customerData) {
    return customerData._id !== null ? (
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
            sx={{ flexDirection: "row", gap: ".3125rem", alignItems: "center" }}
        >
            <Link to="/login">
                <Button sx={{ fontWeight: "bold" }}>Login</Button>
            </Link>
            <span style={{ fontSize: "1rem" }}>/</span>
            <Link to="/register">
                <Button sx={{ fontWeight: "bold" }}>Register</Button>
            </Link>
        </Stack>
    );
}

const MidHeader = function () {
    const theme = useTheme(ColorModeContext.theme);
    const fontSizeClamp =
        "clamp(.6875rem,calc(.75rem + (14 - 12) * (100vw - 62.5rem) / (1920 - 1000)),.875rem) !important";

    let customerData = GetUserInfo();

    return (
        <Container maxWidth="xl" sx={{ marginTop: ".5rem" }}>
            <Stack
                className=""
                sx={{
                    display: "flex",
                    flexDirection: { xs: "row-reverse", md: "row" },
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: ".625rem",
                }}
            >
                {/* Logo */}
                <a href="/" style={{ textDecoration: "none" }}>
                    <Stack
                        alignItems={"center"}
                        sx={{
                            order: { md: -1 },
                            textDecoration: "none",
                            color: "text.primary",
                        }}
                    >

                        <img style={{ width: "2.375rem", height: "2.375rem" }} src="/images/shop-logo.png" alt="e-commerce website logo" />
                        <Typography
                            className="go-home"
                            variant="body"
                            sx={{
                                border: "none",
                                fontSize: fontSizeClamp,
                                fontWeight: "bolder",
                                textDecoration: "none",
                            }}
                        >
                            EVO MARKET
                        </Typography>
                    </Stack>
                </a>
                {/*== Logo ==*/}

                <SearchBar />

                {/* Icons */}
                <Stack
                    alignItems={"center"}
                    direction={"row"}
                    spacing={1}
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


import { useState } from "react"
import { searchForProductReducer, getFilteredProductsReducer } from "../../../../../admin_dashboard/src/redux/ProductSlice/ApiProductSlice.js";

const SearchBar = () => {
    const [searchValue, setSearchValue] = useState("");

    const dispatch = useDispatch();

    const handelFilterSearch = (searchValue) => {

        if (searchValue.trim() === "") return;

        dispatch(searchForProductReducer(searchValue.trim()));

        window.scroll({
            top: 850,
            behavior: "smooth",
        });
    }
    const resetSearch = () => {
        dispatch(getFilteredProductsReducer(""));
    }

    const handelResetSearch = async () => {
        if (`${searchValue}`.trim() === "") return;
        setSearchValue("");
        resetSearch();
    }

    return (<Box Box
        flexGrow={0.6}
        sx={{ p: 0, minWidth: { xs: "100%", md: "9.375rem" } }
        }
    >
        <Search
            sx={{
                p: 0,
                borderRadius: "1.5625rem",
                bgcolor: "bgColor.main",
                maxHeight: "2.5rem !important",
                minWidth: "100%",
                margin: "0 !important",
                overflow: "hidden",
                borderRight: "none"
            }}
        >
            <SearchIconWrapper>
                <SearchIcon sx={{ color: "#777" }} />
            </SearchIconWrapper>
            <StyledInputBase
                placeholder="Search"
                value={searchValue}
                autoComplete="off"
                onChange={(e) => {
                    setSearchValue(e.target.value);
                }}
                inputProps={{ "aria-label": "search" }}
                sx={{ flex: 1 }}
            />

            <Button variant="outlined"
                onClick={() => handelFilterSearch(searchValue)}
                sx={{
                    minWidth: "1.875rem", height: "2.5rem",
                    borderRadius: ".3rem 1.5625rem 1.5625rem .3rem",
                    fontWeight: "bolder",
                    borderColor: "gray",
                    borderWidth: "2px",
                    px: { xs: 2, sm: 3, md: 4 },
                    color: "gray",
                    ":hover": {
                        color: "primary.main", borderColor: "primary.main", borderWidth: "2px"
                    },
                    textTransform: "none",
                    fontSize: "1rem",
                    zIndex: 99
                }}
            >
                Search
            </Button>

            <CloseIcon onClick={() => handelResetSearch()} sx={{
                display: (`${searchValue}`.trim() === "") ? "none" : "block",
                position: "absolute", top: "50%", left: { xs: "calc(100% - 120px)", sm: "calc(100% - 140px)", md: "calc(100% - 155px)" }, transform: "translateY(-50%)",
                color: "gray",
                cursor: "pointer",
                transition: "all .1s linear",
                border: " 1px solid transparent", borderRadius: ".3rem",
                ":hover": { color: "#E91E63", borderColor: "#E91E63" }
            }} />
        </Search>
    </Box>
    )

}


export default MidHeader;
