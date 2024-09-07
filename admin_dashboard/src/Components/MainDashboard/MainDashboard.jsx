/* eslint-disable react/prop-types */
import { Container, Stack, Typography, Box } from "@mui/material";
import Divider from "@mui/material/Divider";

/// context
import { ColorModeContext } from "../../Theme/theme.jsx";

///// hooks
import { useParams } from "react-router-dom";
import { useTheme } from "@emotion/react";

/// redux
import { DoScrollToTop, GetUserInfo, GoLoginPage, IsUserLoggedIn, } from "../../General/GeneralFunctions.js";
import { logoutAdminReducer } from "../../redux/AdminSlice/ApiAdminSlice.js";
import { useDispatch } from "react-redux";

//// General Vars & Functions
import { UserMenuItems } from "../../General/GeneralVariables.jsx";

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
import AddProduct from "../DashboardSections/ProductsPage/AddProduct/AddProduct.jsx";
import EditProduct from "../DashboardSections/ProductsPage/EditProduct/EditProduct.jsx";
import ProductPage from "../ProductPage/ProductPage.jsx";
import { useEffect } from "react";



function ShowGreetingsMessage() {
    let prevPage = document.referrer.split("/").at(-1);
    if (prevPage === "login") {
        toast.success("Login successfully ,Welcome Back !😀");
    } else if (prevPage === "register") {
        toast.success("Registered successfully ,Welcome !😀");
    }
}

const MainDashboard = () => {
    const { section } = useParams();
    const dispatch = useDispatch();
    const theme = useTheme(ColorModeContext);
    let userData = GetUserInfo();

    const handleLogout = () => {
        if (IsUserLoggedIn()) dispatch(logoutAdminReducer());
        else toast.error("You are already logged out");
    };

    //// adding logout function
    UserMenuItems.at(-1).action = handleLogout;

    DoScrollToTop();

    const getTargetSection = (section) => {

        // console.log(section)

        switch (section) {
            case "dashboard":
                return <HomePage />;
            case "orders":
                return <OrdersComponent />;
            case "products":
                return <ProductsPage />;
            case "add-product":
                return <AddProduct />;
            case "edit-product":
                return <EditProduct />;
            case "product":
                return <ProductPage />;
            case "customers":
                return <CustomersPage />;
            case "profile":
                return <ProfileComponent userData={userData} />;
            case "settings":
                return <SettingsComponent />;
            case `order-summary`:
                return <OrderSummary />;
            default:
                return <HomePage />;
        }
    };

    useEffect(() => {
        if (IsUserLoggedIn()) ShowGreetingsMessage();
        else {
            toast.error("Your not authorized to do this action");
            setTimeout(() => {
                GoLoginPage();

            }, 1000);
        };
    }, []);

    if (!IsUserLoggedIn()) {
        GoLoginPage();
    } else {
        return (
            <Container
                sx={{
                    minWidth: "99vw",
                    width: { xs: "95%", md: "100%" },
                    marginTop: ".625rem",
                    bgcolor: "categoryColor.main",
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
                        <DashboardNavBar userData={userData} />
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
    }
};


export default MainDashboard;
