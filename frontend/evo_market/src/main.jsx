/* eslint-disable react-refresh/only-export-components */

//// Hooks
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Toaster } from 'react-hot-toast';



///// Components
import Footer from "./../../shared_files/Footer/Footer.jsx";
import ScrollToTop from "../../shared_files/ScrollToTop/ScrollToTop.jsx";
import CartPage from "./Components/CartPage/CartPage.jsx";
import TopHeader from "./Components/GenericComponents/Header/TopHeader.jsx";
import ErrorPage from "./../../shared_files/ErrorPage/ErrorPage.jsx";;

/// Theme
import { CssBaseline, Stack, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "../../shared_files/Theme/theme.jsx";

/// custom component
import LoginPage from "./Components/LoginRegisterPages/LoginPage.jsx";
import RegisterPage from "./Components/LoginRegisterPages/RegisterPage.jsx";
import MidHeader from "./Components/GenericComponents/Header/MidHeader.jsx";
import UserInfoPage from "./Components/UserInfoPage/UserInfoPage.jsx";
import ProductPage from "./Components/ProductPage/ProductPage.jsx";

const routeElement = (currentComponent, showMidHeader = false) => {
    return (
        <Stack justifyContent={"space-between"} sx={{ minHeight: "100vh", bgcolor: "natural.main" }}>
            <TopHeader />
            {showMidHeader && <MidHeader />}
            {currentComponent}
            <Footer />
            <ScrollToTop />

            <Toaster
                position="bottom-left"
                reverseOrder={false}
                gutter={8}
                containerClassName=""
                containerStyle={{}}
                toastOptions={{
                    // Define default options
                    className: '',
                    duration: 5000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                        padding: '.5rem 1rem',
                        fontSize: '1.125rem',
                        minWidth: "fit-content",
                        maxWidth: "100%",
                    },

                    // Default options for specific types
                    success: {
                        duration: 3000,
                        theme: {
                            primary: 'green',
                            secondary: 'black',
                        },
                    },
                }}
            />
        </Stack>
    );
};

const router = createBrowserRouter([
    {
        path: "/",
        element: routeElement(<App />),
    },
    {
        path: "/home",
        element: routeElement(<App />),
    },
    {
        path: "/cart",
        element: routeElement(<CartPage />),
    },
    {
        path: "/login",
        element: routeElement(<LoginPage />),
    },
    {
        path: "/register",
        element: routeElement(<RegisterPage />),
    },
    {
        path: "/userInfo/:section",
        element: routeElement(<UserInfoPage />, true),
    },
    {
        path: "/userInfo/:section/:elementId",
        element: routeElement(<UserInfoPage />, true),
    },
    {
        path: "/product/:productId",
        element: routeElement(<ProductPage />, true),
    },
    {
        path: "/*",
        element: routeElement(<ErrorPage />),
    },
]);

function MainComponent() {
    const [theme, colorMode] = useMode();
    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Provider store={store}>
                    <RouterProvider router={router}>
                        {/* <App /> */}
                    </RouterProvider>
                </Provider>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <MainComponent />
    </React.StrictMode>
);
