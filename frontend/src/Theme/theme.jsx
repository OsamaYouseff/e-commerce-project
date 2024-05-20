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
          text: '#333333',
          background: '#f5f5f5',
          primary: '#f9f6fc',
          accent: '#e0f7fa',
        },
        text: {
          primary: "#2B3445",
        },
        neutral: {
          main: "#64748B",
        },

        favColor: {
          main: grey[300],
        },
      }
      : {
        // palette values for dark mode
        categoryColor: {
          main: "#252b32",
        },
        bgColor: {
          main: "#000",
        },
        bgColor2: {
          main: "#fff",
        },
        sectionBgColor: {
          main: "#1D2021",
        },
        footerBgColor: {
          text: '#e0e0e0',
          background: '#1e1e1e',
          primary: '#80d8ff',
          accent: '#004d40',
        },
        neutral: {
          main: "#64748B",
        },

        favColor: {
          main: grey[300],
        },
        text: {
          primary: "#fff",
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
