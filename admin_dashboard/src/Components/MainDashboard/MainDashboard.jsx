/* eslint-disable react/prop-types */
import { Container, Stack, Typography, Box } from "@mui/material";
import Divider from "@mui/material/Divider";

/// context
import { ColorModeContext } from "../../Theme/theme.jsx";

///// hooks
import { useParams } from "react-router-dom";
import { useTheme } from "@emotion/react";

/// redux
import { GetUserInfo, GoHome, IsUserLoggedIn, } from "../../General/GeneralFunctions.js";
import { logoutCustomerAccountReducer } from "../../redux/CustomerSlice/ApiCustomerSlice.js";
import { useDispatch } from "react-redux";

//// General Vars & Functions
import { DashboardMenuVar, UserMenuItems } from "../../General/GeneralVariables.jsx";

//// custom component
import toast from 'react-hot-toast';
import ProfileComponent from "../DashboardSections/ProfileComponent/ProfileComponent.jsx";
import SettingsComponent from "../DashboardSections/SettingsComponent/SettingsComponent.jsx";
import ProductsPage from "../DashboardSections/ProductsPage/ProductsPage.jsx";
import OrdersComponent from "../DashboardSections/OrdersComponent/OrdersComponent.jsx";
import DashboardNavBar from "./DashboardNavBar/DashboardNavBar.jsx";
import OrderSummary from "../DashboardSections/OrdersComponent/OrderSummary.jsx";
import HomePage from "../DashboardSections/HomePage/HomePage.jsx";
import CustomersPage from "../DashboardSections/CustomersPage/CustomersPage.jsx";





const MainDashboard = () => {
    const { section } = useParams();
    const dispatch = useDispatch();
    const theme = useTheme(ColorModeContext);
    // let UserData = GetUserInfo();
    let UserData = {
        "_id": "66a4ecdc15e14384d8786e7c",
        "username": "sama",
        "email": "sama@gmail.com",
        "isAdmin": false,
        "gender": "female",
        "phone": "+201022863287",
        "firstname": "sama",
        "lastname": "abdallah"
    };

    const handleLogout = () => {
        if (IsUserLoggedIn()) dispatch(logoutCustomerAccountReducer());
        else toast.error("You are already logged out");
    };
    //// adding logout function
    UserMenuItems.at(-1).action = handleLogout;


    const getTargetSection = (section) => {
        switch (section) {
            case "dashboard":
                return <HomePage />;
            case "orders":
                return <OrdersComponent />;
            case "products":
                return <ProductsPage />;
            case "customers":
                return <CustomersPage />;
            case "profile":
                return <ProfileComponent customerData={UserData} />;
            case "settings":
                return <SettingsComponent />;
            case `order-summary`:
                return <OrderSummary />;
            default:
                return <HomePage />;
        }
    };

    // if (!IsUserLoggedIn()) {
    //     GoHome();
    // } else {
    // }
    return (
        <Container
            sx={{
                minWidth: "99vw",
                width: { xs: "95%", md: "100%" },
                marginTop: ".625rem",
                bgcolor: theme.palette.categoryColor.main,
                borderRadius: ".375rem",
                px: ".125rem !important",
                py: ".5rem",
                boxShadow: 3,
                mb: 2,
                alignItems: "space-between",
                mt: { xs: 0, md: 10 },
            }}
        >
            <Stack
                className="flex-between "
                sx={{
                    minHeight: "70vh",
                    display: "flex",
                    gap: "1.25rem",
                    flexDirection: { xs: "column", md: "row" },
                    width: "100%",
                    p: { xs: 0, md: 1 },
                    alignItems: { xs: "center", md: "flex-start" },
                }}
            >
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                    <DashboardNavBar UserData={UserData} />
                </Box>

                <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />

                {/* Variable Page */}
                <Box
                    sx={{
                        minWidth: { xl: "68.75rem" },
                        // minHeight: { xs: "auto" },
                        flexGrow: 1,
                        overflowX: "auto",
                        minHeight: "inherit",

                    }}
                >
                    {getTargetSection(section)}
                </Box>
                {/* == Variable Page == */}
            </Stack>
        </Container >
    );
};


export default MainDashboard;
