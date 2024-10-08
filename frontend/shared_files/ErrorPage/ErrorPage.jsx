import { useParams, useRouteError } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";

const ErrorPage = () => {
    const error = useRouteError();
    // console.log(error);
    // console.log(useParams());

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: { xs: "87.2vh", xl: "90.4vh" },
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    background:
                        "linear-gradient(270deg, #ff6f61, #d066e2, #61a0ff, #61ffaf)",
                    backgroundSize: "800% 800%",
                    animation: "gradient 15s ease infinite",
                    zIndex: -1,
                    "@keyframes gradient": {
                        "0%": {
                            backgroundPosition: "0% 50%",
                        },
                        "50%": {
                            backgroundPosition: "100% 50%",
                        },
                        "100%": {
                            backgroundPosition: "0% 50%",
                        },
                    },
                }}
            />
            <Box
                sx={{
                    color: "#fff",
                    maxWidth: "31.25rem",
                    margin: "0 1.25rem",
                }}
            >
                <Typography variant="h1" sx={{ fontSize: "6rem", margin: 0 }}>
                    Oops!
                </Typography>
                <Typography
                    variant="h4"
                    sx={{ fontSize: "2rem", margin: ".625rem 0" }}
                >
                    Something went wrong
                </Typography>
                <Button
                    variant="contained"
                    sx={{
                        marginTop: "1.25rem",
                        padding: ".375rem 1.25rem",
                        fontSize: "1.2rem",
                        color: "#fff",
                        backgroundColor: "#ff6f61",
                        border: "none",
                        borderRadius: ".3125rem",
                        cursor: "pointer",
                        transition: "background-color 0.3s ease",
                        "&:hover": {
                            backgroundColor: "#e55a4f",
                        },
                    }}
                    onClick={() => (window.location.href = "/dashboard")}
                >
                    Go Back Home
                </Button>
            </Box>
        </Box>
    );
};

export default ErrorPage;
