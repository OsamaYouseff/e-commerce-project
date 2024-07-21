import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import { Stack, Typography } from "@mui/material";
import ItemComponent from "./ItemComponent";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useTheme, styled } from "@mui/material/styles";
import { ColorModeContext } from "../../Theme/theme";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Badge from "@mui/material/Badge";
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { CartContext } from "../../Contexts/CustomerContext";

export default function AnchorTemporaryDrawer() {
    const [state, setState] = useState({ right: false });
    const theme = useTheme(ColorModeContext);
    const { cartData, cartDataDispatch } = useContext(CartContext);

    const toggleDrawer = (anchor, open) => (event) => {
        if (
            event.type === "keydown" &&
            (event.key === "Tab" || event.key === "Shift")
        ) {
            return;
        }
        setState({ ...state, [anchor]: open });
    };

    /// styles
    const transitionDuration = "350ms";
    const StyledBadge = styled(Badge)(({ theme }) => ({
        "& .MuiBadge-badge": {
            right: -3,
            top: 13,
            border: `2px solid ${theme.palette.background.paper}`,
            padding: "0 4px",
        },
    }));

    const list = (anchor) => (
        <Box
            className="flex-between-column"
            sx={{
                width: anchor === "top" || anchor === "bottom" ? "auto" : 390,
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
                    right: 8,
                    top: -10,
                    color: theme.palette.text.primary,
                    marginTop: "15px",
                    zIndex: 1,
                    "&:hover": { bgcolor: "transparent" },
                }}
                onClick={toggleDrawer("right", false)}
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
                    onClick={toggleDrawer("right", false)}
                />
            </Button>
            {/*== Close Button ==*/}

            <Typography
                variant="h5"
                style={{
                    marginBottom: "10px",
                    fontWeight: "bold",
                    width: "95%",
                    textAlign: "center",
                }}
            >
                View Your Cart
            </Typography>

            {/* Cart Items */}
            <Box
                sx={{
                    overflow: "auto",
                    height: { xs: "58vh", sm: "auto" },
                    minHeight: "58vh",
                    px: 1,
                    width: "100%",
                    transform: {
                        xs: "translateX(10px)",
                        sm: "translateX(0px)",
                    },
                }}
            >
                {cartData.cartItems.map((item) => (
                    <ItemComponent
                        key={item.id}
                        item={item}
                        cartDataDispatch={cartDataDispatch}
                    />
                ))}
            </Box>
            {/*== Cart Items ==*/}

            {/* Apply Coupon */}
            <Stack sx={{ width: "100%" }}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        my: 2,
                        marginLeft: "10px",
                        fontSize: "17px",
                    }}
                >
                    <Typography variant="h6">Got a coupon?</Typography>
                    <Stack direction="row" gap={1}>
                        <input
                            type="text"
                            placeholder="Enter your coupon code"
                            style={{
                                width: "70%",
                                height: "40px",
                                borderRadius: "5px",
                                border: `1px solid ${theme.palette.text.primary}`,
                                padding: "10px",
                                fontWeight: "bolder",
                            }}
                        />
                        <Button
                            variant="contained"
                            sx={{
                                width: "30%",
                                height: "40px",
                                borderRadius: "5px",
                                border: `1px solid ${theme.palette.primary.main}`,
                                cursor: "pointer",
                                fontWeight: "bolder",
                            }}
                        >
                            Apply
                        </Button>
                    </Stack>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        marginLeft: "10px",
                        fontSize: "17px",
                    }}
                >
                    <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: "20px" }}>
                            Subtotal
                        </Typography>
                        <Typography
                            sx={{
                                fontWeight: "bolder",
                                color: "#ff4450",
                                fontSize: "20px",
                            }}
                        >
                            ${cartData.totalCartPrice}
                        </Typography>
                    </Stack>
                    <Link to="/cart" xs={{ width: "100%" }}>
                        <Button
                            onClick={toggleDrawer("right", false)}
                            variant="contained"
                            sx={{ fontWeight: "bolder", width: "100%" }}
                        >
                            Checkout
                        </Button>
                    </Link>
                </Box>
            </Stack>
            {/*== Apply Coupon ==*/}
        </Box>
    );

    return (
        <div style={{ width: "40px" }}>
            <StyledBadge
                onClick={toggleDrawer("right", true)}
                badgeContent={cartData.cartItems.length}
                color="primary"
            >
                <ShoppingCartIcon
                    sx={{ transition: transitionDuration, height: "30px" }}
                />
            </StyledBadge>
            <Drawer
                anchor={"right"}
                open={state["right"]}
                onClose={toggleDrawer("right", false)}
            >
                {list("right")}
            </Drawer>
        </div>
    );
}
