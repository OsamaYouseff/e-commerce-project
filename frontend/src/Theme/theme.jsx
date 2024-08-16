/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";
import { grey } from "@mui/material/colors";

export const getDesignTokens = (mode) => ({
    palette: {
        mode,
        ...(mode === "light"
            ? {
                // palette values for light mode
                categoryColor: {
                    main: "#f9f6fc",
                },
                bgColor: {
                    main: "#fff",
                },
                bgColor2: {
                    main: "#000",
                },
                sectionBgColor: {
                    main: "#f6f6f6",
                },
                footerBgColor: {
                    text: "#333333",
                    background: "#f5f5f5",
                    primary: "#f9f6fc",
                    accent: "#e0f7fa",
                },
                text: {
                    primary: "#2B3445",
                },
                natural: {
                    main: "#fff",
                },

                favColor: {
                    main: grey[300],
                },
                modalBgColor: {
                    main: "#ebebeb",
                },
                specialText: {
                    main: "#479f00",
                },
                specialText2: {
                    main: "#E91E63",
                },
            }
            : {
                // palette values for dark mode
                categoryColor: {
                    main: "#252b32",
                    // main: "#a8d0ff",
                },
                bgColor: {
                    main: "#121212",
                },
                bgColor2: {
                    main: "#fff",
                },
                sectionBgColor: {
                    main: "#1D2021",
                },
                footerBgColor: {
                    text: "#e0e0e0",
                    background: "#1e1e1e",
                    primary: "#80d8ff",
                    accent: "#004d40",
                },
                natural: {
                    main: "#1515159c",
                },

                favColor: {
                    main: grey[300],
                },
                text: {
                    primary: "#fff",
                },
                modalBgColor: {
                    main: "#000",
                },
                specialText: {
                    main: "#abff67",
                },
                specialText2: {
                    main: "#cd0046",
                },

            }),
    },
});

// context for color mode
export const ColorModeContext = createContext({
    toggleColorMode: () => { },
});

export const useMode = () => {
    const [mode, setMode] = useState(
        localStorage.getItem("mode") ? localStorage.getItem("mode") : "light"
    );

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () =>
                setMode((prev) => (prev === "light" ? "dark" : "light")),
        }),
        []
    );

    const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
    return [theme, colorMode];
};
