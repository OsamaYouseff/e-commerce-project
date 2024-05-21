/// Components
import Header from "./Components/Header/Header.";
import HeroSection from "./Components/HeroSection/HeroSection";
import MainContent from "./Components/MainContent/MainContent";
import Footer from "./Components/Footer/Footer";
import ScrollToTop from "./Components/ScrollToTop/ScrollToTop";

/// Theme
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./Theme/theme";



function App() {
    const [theme, colorMode] = useMode();
    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <div className="App">
                    <Header />
                    <HeroSection />
                    <MainContent />
                    <Footer />
                    <ScrollToTop />
                </div>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}
export default App;
