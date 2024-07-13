/* eslint-disable react-refresh/only-export-components */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './redux/store.js'
import { RouterProvider, createBrowserRouter } from "react-router-dom";

///// Components
import Footer from './Components/GenericComponents/Footer/Footer.jsx'
import ScrollToTop from './Components/GenericComponents/ScrollToTop/ScrollToTop.jsx'
import CartPage from './Components/CartPage/CartPage.jsx'
import TopHeader from './Components/GenericComponents/Header/TopHeader.jsx'
import ErrorPage from './Components/ErrorPage/ErrorPage.jsx'

/// Theme
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./Theme/theme";


const routeElement = (currentComponent) => {
    return (
        <>
            <TopHeader />
            {currentComponent}
            <Footer />
            <ScrollToTop />
        </>
    )
}

const router = createBrowserRouter([
    {
        path: "/",
        element: routeElement(<App />),
    },
    {
        path: "/home",
        element: routeElement(<App />),
    }
    ,
    {
        path: "/cart",
        element: routeElement(<CartPage />),
    }
    , {
        path: "/*",
        element: routeElement(<ErrorPage />),
    }
]);


function MainComponent() {
    const [theme, colorMode] = useMode();

    return (
        <ColorModeContext.Provider value={colorMode} >
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Provider store={store}>
                    <RouterProvider router={router}>
                        <>
                            <App />
                        </>
                    </RouterProvider>
                </Provider>
            </ThemeProvider>
        </ColorModeContext.Provider >
    )
}



ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <MainComponent />
    </React.StrictMode>,
)
