/* eslint-disable react/prop-types */
import { Container, Stack, Typography, Box } from "@mui/material";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";

/// context
import { ColorModeContext } from "../../../Theme/theme.jsx";

import { useTheme } from "@emotion/react";


//// General Vars & Functions
import { DashboardMenuVar, UserMenuItems } from "../../../General/GeneralVariables.jsx";
import { useParams } from "react-router-dom";


const DashboardNavBar = ({ /*UserData*/ }) => {
    const theme = useTheme(ColorModeContext);

    const { section } = useParams();

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

    return (
        <Stack
            sx={{
                width: {
                    xs: "100%",
                    md: "200px",
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
                maxWidth: { xs: "200px", md: "180px" }
            }}>
                <Typography
                    sx={{
                        fontSize: "1.125rem",
                        px: 2,
                        fontWeight: "bolder",
                    }}
                    variant="body"
                >
                    Hello <span> {UserData.username} ✋</span>
                </Typography>
                <Typography
                    sx={{ fontSize: "1rem", px: 2 }}
                    variant="body"
                >
                    {UserData.email}
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
                                    borderLeft: `2px solid transparent`,
                                    borderColor: `${item.title.toLowerCase() == section ? theme.palette.text.primary : "transparent"}`,
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
                                    borderLeft: `2px solid ${item.title.toLowerCase() ==
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
