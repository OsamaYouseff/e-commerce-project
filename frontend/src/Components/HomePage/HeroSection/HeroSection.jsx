import { Box, Button, Container, Stack, Typography } from "@mui/material";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useTheme } from "@emotion/react";
import "./Swiper.css";
import { ColorModeContext } from "../../../Theme/theme";
import SwiperComponent from "./SwiperComponent";

/// icons
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import Features from "./Features";

const HeroSection = () => {
    const theme = useTheme(ColorModeContext);
    return (
        <Box
            sx={{
                mt: "15px",
                bgcolor: theme.palette.sectionBgColor.main,
                py: 2,
            }}
        >
            <Container maxWidth="xl">
                <Stack
                    direction={"row"}
                    gap={1}
                    sx={{
                        borderRadius: "10px",
                        overflow: "hidden",
                        boxShadow: 4,
                    }}
                >
                    <SwiperComponent />
                    <Box
                        className="parent-box"
                        minWidth="26.8%"
                        sx={{
                            [theme.breakpoints.up("md")]: {
                                display: "flex",
                                justifyContent: "space-between",
                                flexDirection: "column",
                            },
                            [theme.breakpoints.down("md")]: {
                                display: "none",
                            },
                        }}
                    >
                        <Box
                            className="img-container "
                            style={{ display: "flex", position: "relative" }}
                        >
                            <img
                                style={{ minWidth: "100%", maxWidth: "100%" }}
                                src="./images/banner-17.jpg"
                                alt="banner-img"
                            />
                            <Typography
                                className="sub-banner-text "
                                sx={{
                                    position: "absolute",
                                    top: "25%",
                                    left: "9%",
                                    color: "#222",
                                    textAlign: "left",
                                    textTransform: "capitalize",
                                }}
                            >
                                <Typography
                                    sx={{
                                        textTransform: "uppercase",
                                        fontSize: "18px",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {" "}
                                    new arrivals
                                </Typography>
                                <Typography
                                    sx={{
                                        textTransform: "uppercase",
                                        fontSize: "18px",
                                    }}
                                >
                                    {" "}
                                    summer
                                </Typography>
                                <Typography
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        textTransform: "uppercase",
                                        fontSize: "18px",
                                        fontWeight: "bold",
                                    }}
                                >
                                    sale up to
                                    <Typography
                                        sx={{
                                            textTransform: "uppercase",
                                            fontSize: "20px",
                                            marginLeft: "10px",
                                            fontWeight: "bold",
                                            color: "#ff4450",
                                        }}
                                    >
                                        20% off
                                    </Typography>
                                </Typography>
                                <Button
                                    sx={{
                                        border: "none",
                                        p: 0,
                                        fontSize: "14px",
                                        "&:hover": { color: "red" },
                                    }}
                                    color="inherit"
                                >
                                    Shop now <ArrowRightAltIcon />{" "}
                                </Button>
                            </Typography>
                        </Box>
                        <Box
                            className="img-container "
                            style={{ display: "flex", position: "relative" }}
                        >
                            <img
                                style={{ minWidth: "100%", maxWidth: "100%" }}
                                src="./images/banner-16.jpg"
                                alt="banner-img"
                            />
                            <Typography
                                className="sub-banner-text "
                                sx={{
                                    position: "absolute",
                                    top: "25%",
                                    left: "9%",
                                    color: "#222",
                                    textAlign: "left",
                                    textTransform: "capitalize",
                                }}
                            >
                                <Typography
                                    sx={{
                                        textTransform: "uppercase",
                                        fontSize: "22px",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {" "}
                                    Gaming 4k
                                </Typography>
                                <Typography
                                    sx={{
                                        textTransform: "uppercase",
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                        my: 0.5,
                                    }}
                                >
                                    {" "}
                                    Desktops &{" "}
                                </Typography>
                                <Typography
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        textTransform: "uppercase",
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Laptops
                                </Typography>
                                <Button
                                    sx={{
                                        border: "none",
                                        p: 0,
                                        fontSize: "14px",
                                        "&:hover": { color: "purple" },
                                    }}
                                    color="inherit"
                                >
                                    Shop now <ArrowRightAltIcon />{" "}
                                </Button>
                            </Typography>
                        </Box>
                    </Box>
                </Stack>
                <Features />
            </Container>
        </Box>
    );
};

export default HeroSection;
