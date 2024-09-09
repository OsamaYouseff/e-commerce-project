/* eslint-disable react/prop-types */
import { Container, Stack, Typography, Box } from "@mui/material";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";

/// context
import { ColorModeContext } from "../../../../../shared_files/Theme/theme.jsx";

import { useTheme } from "@emotion/react";


//// General Vars & Functions
import { DashboardMenuVar, UserMenuItems } from "../../../General/GeneralVariables.jsx";
import { useParams } from "react-router-dom";
import { GetUserInfo } from "../../../General/GeneralFunctions.js";

const getActiveSection = (section) => {

    switch (section) {
        case "home":
            return "dashboard";
        case "product":
        case "products":
        case "edit-product":
        case "add-product":
            return "products";
        case "orders":
            return "orders";
        case "customers":
            return "customers";
        case "profile":
            return "profile";
        case "settings":
            return "settings";
        default:
            return "dashboard";
    }
};


const DashboardNavBar = () => {
    const theme = useTheme(ColorModeContext);
    const { section } = useParams();
    const userData = GetUserInfo();

    return (
        <Stack
            sx={{
                width: {
                    xs: "100%",
                    md: "12.5rem",
                },
                maxWidth: {
                    xs: "100%",
                    md: "100%",
                },
                height: "100vh",
                p: 2,
                borderRadius: ".375rem",
                px: 1,
                // display: { xs: "none", md: "block" },
                position: "relative",
            }}
        >
            <Box sx={{
                position: "fixed",
                maxWidth: { xs: "12.5rem", md: "11.25rem" }
            }}>
                <Typography
                    sx={{
                        fontSize: "1rem",
                        px: 2,
                        fontWeight: "bolder",
                    }}
                    variant="body"
                >
                    Hello <span> {userData.username} ✋</span>
                </Typography>
                <Typography
                    sx={{ fontSize: "1rem", px: 2 }}
                    variant="body"
                >
                    {userData.email}
                </Typography>
                <Divider sx={{ m: ".625rem", width: "95%" }} />
                <Box sx={{ width: "100%" }}>

                    {DashboardMenuVar.map((item, index) => (
                        <a
                            key={index}
                            href={item.url}
                            style={{
                                textDecoration: "none",
                                color: theme.palette.text.primary,
                            }}
                            onClick={item.action}
                        >
                            <MenuItem
                                sx={{
                                    minWidth: "100%",
                                    py: .75,
                                    borderLeft: `.125rem solid transparent`,
                                    borderColor: `${item.title.toLowerCase() == getActiveSection(section) ? "text.primary" : "transparent"}`,
                                    fontWeight: "bold",
                                    mb: 0.6,
                                }}
                            >
                                <ListItemIcon sx={{ color: "inherit" }}>
                                    {item.icon}
                                </ListItemIcon>
                                {item.title}
                            </MenuItem>
                        </a>
                    ))}

                    <Divider sx={{ my: 2 }} />

                    {UserMenuItems.map((item, index) => (
                        <a
                            key={index}
                            href={item.url}
                            style={{
                                textDecoration: "none",
                                color: theme.palette.text.primary,
                            }}
                            onClick={item.action}
                        >
                            <MenuItem
                                sx={{
                                    minWidth: "100%",
                                    py: .75,
                                    borderLeft: `.125rem solid ${item.title.toLowerCase() ==
                                        section
                                        ? theme.palette.text.primary
                                        : "inherit"
                                        }`,
                                    fontWeight: "bold",
                                    mb: 0.6,
                                }}
                            >
                                <ListItemIcon sx={{ color: "inherit" }}>
                                    {item.icon}
                                </ListItemIcon>
                                {item.title}
                            </MenuItem>
                        </a>
                    ))}
                </Box>
            </Box>
        </Stack >
    )
}

export default DashboardNavBar;
