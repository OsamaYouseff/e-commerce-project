/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import { Stack, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useTheme, styled } from "@mui/material/styles";
import { ColorModeContext } from "../../../Theme/theme.jsx";
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

import Badge from "@mui/material/Badge";
import { Link } from "react-router-dom";

//// hooks
import { useEffect, useState } from "react";

// Custom components
import LoaderComponent from "../../GenericComponents/LoaderComponent/LoaderComponent.jsx";
import toast from 'react-hot-toast';
import DashboardNavBar from "../DashboardNavBar/DashboardNavBar.jsx";

/// General Vars & Functions
import { IsUserLoggedIn } from "../../../General/GeneralFunctions.js";

//// redux
import { useSelector, useDispatch } from "react-redux";
import { getCustomerCartReducer } from "../../../redux/CartSlice/ApiCartSlice.js";


export default function DashboardNavBarDrawer() {
    const [state, setState] = useState({ left: false });
    const theme = useTheme(ColorModeContext);

    const { section } = useTheme();

    //// redux
    const dispatch = useDispatch();
    const customerCart = useSelector((state) => state.CartApiRequest.response);
    const isLoading = useSelector((state) => state.CartApiRequest.isLoading);
    const error = useSelector((state) => state.CartApiRequest.error);
    const message = useSelector((state) => state.CartApiRequest.message);

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [PreviewedProduct, setPreviewedProduct] = useState({ id: 2, attributes: {}, });

    const handleSetPreviewedProduct = (newValue) => {
        setPreviewedProduct(newValue);
    };

    const productsCount = customerCart?.products?.length || "0";
    const totalPrice = customerCart?.totalPrice || 0;

    /// styles
    const transitionDuration = "350ms";
    const StyledBadge = styled(Badge)(({ theme }) => ({
        "& .MuiBadge-badge": {
            right: -3,
            top: 13,
            border: `.125rem solid ${theme.palette.background.paper}`,
            padding: "0 .25rem",
        },
    }));

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


    useEffect(() => {
        if (IsUserLoggedIn() && !isLoading) dispatch(getCustomerCartReducer());
        // else toast.error("Please log in or sign up with new account🙂");
    }, []);

    const list = (anchor) => (
        <Box
            className="flex-between-column"
            sx={{
                width: { xs: "300px", sm: "260px" },
                p: { xs: 1, sm: 2 },
                // pr: { xs: 0, sm: 2 },
                bgcolor: theme.palette.categoryColor.main,
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
                    position: "absolute", right: 0, top: -10, color: theme.palette.text.primary, marginTop: ".9375rem", zIndex: 1, "&:hover": { bgcolor: "transparent" },
                }}
                onClick={toggleDrawer("left", false)}
            >
                <CloseRoundedIcon
                    sx={{
                        fontSize: "2.8125rem", width: "2.1875rem", height: "2.1875rem", cursor: "pointer",
                        borderRadius: "50%", p: 0.2, color: theme.palette.text.primary,
                        border: `.125rem solid ${theme.palette.text.primary}`,
                        "&:hover": { rotate: "180deg", color: "#ff6e6e", borderColor: "#ff6e6e", },
                        transition: "0.35s",
                    }}
                    onClick={toggleDrawer("left", false)}
                />
            </Button>
            {/*== Close Button ==*/}

            <DashboardNavBar section={section} />
            {/* <DashboardNavBar UserData={UserData} section={section} /> */}


        </Box>
    );

    return (
        <Box
            style={{
                width: "36px",
                height: "36px",
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
