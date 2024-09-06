/* eslint-disable react-hooks/exhaustive-deps */
// redux
import { useSelector, useDispatch } from "react-redux";

import { Box, Container, Stack, Typography, Button, } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


//// icons
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded';
import LocalAtmRoundedIcon from '@mui/icons-material/LocalAtmRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';


//// custom components
import PieActiveArcComponent from "./CartsComponents/PieActiveArcComponent";
import TickPlacementBars from "./CartsComponents/TickPlacementBars";
import { ResetLocalStorage } from "../../../General/GeneralFunctions";



const HomePage = () => {

    const iconStyles = {
        borderRadius: "50%",
        border: "1px solid transparent",
        fontSize: { xs: "4rem", sm: "3rem" },
        p: 1,
        color: "white",
    }
    const iconStyles2 = {
        borderRadius: "50%",
        border: "1px solid transparent",
        fontSize: "2.5rem",
        p: .5,
        color: "white",
    }

    return (
        <Container
            maxWidth="xl" py={3}
            sx={{
                px: { xs: 1, sm: 1, md: 0, lg: 0 },
                flexGrow: 1,
                minHeight: "inherit",
            }}
        >
            <Typography variant="h1" sx={{ fontWeight: "bold", my: 3, fontSize: "1.5rem" }}>Dashboard</Typography>
            <Box className="flex-between" sx={{ gap: 2, flexWrap: "wrap" }}>
                <StatisticsBoxComponent title="Total customers" value="765" icon={<Groups2RoundedIcon sx={{ ...iconStyles, bgcolor: "#ff5a1f" }} />} />
                <StatisticsBoxComponent title="Total income" value="$ 6,760.89" icon={<LocalAtmRoundedIcon sx={{ ...iconStyles, bgcolor: "#0e9f6e" }} />} />
                <StatisticsBoxComponent title="New Orders" value="150" icon={<ShoppingCartRoundedIcon sx={{ ...iconStyles, bgcolor: "#3f83f8" }} />} />
                <StatisticsBoxComponent title="Unread Chats" value="15" icon={<ChatRoundedIcon sx={{ ...iconStyles, bgcolor: "#0694a2" }} />} />
            </Box>


            <Typography variant="h3" sx={{ fontWeight: "bold", my: 3, fontSize: "1.5rem" }}>Statistics</Typography>
            <Box className="flex-between" sx={{ my: 4, flexWrap: { xs: "wrap", sm: "wrap", md: "nowrap", lg: "nowrap" }, gap: { xs: 4, sm: 2 } }}>
                <PieActiveArcComponent />
                <TickPlacementBars />
            </Box>

            <Box mb={4}>
                <Typography variant="h3" sx={{ fontWeight: "bold", my: 3, fontSize: "1.5rem" }}>Quick access</Typography>
                <Box className="flex-between" sx={{ gap: 2, flexWrap: "wrap" }}>
                    <ActionButton
                        title="Add Product"
                        icon={<AddCircleRoundedIcon
                            sx={{ ...iconStyles2, bgcolor: "#E91E63", }}
                        />}
                        linkUrl={"/add-product"}
                    />

                    <ActionButton
                        title="Orders"
                        icon={<LocalShippingRoundedIcon
                            sx={{ ...iconStyles2, bgcolor: "#673AB7", }}
                        />}
                        linkUrl={"/orders"}
                    />

                    <ActionButton
                        title="User Info"
                        icon={<PersonRoundedIcon
                            sx={{ ...iconStyles2, bgcolor: "darkgoldenrod", }}
                        />}
                        linkUrl={"/profile"}
                    />

                    <ActionButton
                        title="Settings"
                        icon={<SettingsRoundedIcon
                            sx={{ ...iconStyles2, bgcolor: "#9C27B0", }}
                        />}
                        linkUrl={"/settings"}
                    />

                    <ActionButton
                        title="Customers"
                        icon={<Groups2RoundedIcon
                            sx={{ ...iconStyles2, bgcolor: "#4CAF50", }}
                        />}
                        linkUrl={"/customers"}
                    />

                    <ActionButton
                        title="Logout"
                        icon={<LogoutRoundedIcon
                            sx={{ ...iconStyles2, bgcolor: "#009688", }}
                        />}
                        linkUrl={"/login"}
                        action={() => ResetLocalStorage()}
                    />
                </Box>
            </Box>


        </Container >
    )
}


const ActionButton = ({ title, icon, linkUrl, action }) => {

    return (<Link to={linkUrl} style={{
        textDecoration: "none", color: "inherit", flexGrow: 1,
    }}>

        <Box className="flex-center" sx={{
            border: "1px solid #9d9d9d",
            gap: { xs: 4, sm: 2 },
            bgcolor: "bgColor.main",
            py: 1.5,
            px: 2,
            borderRadius: 2,
            mx: { xs: 1, sm: 0 },
            transition: "all 0.3s ease-in-out",
            cursor: "pointer",
            ":hover": {
                borderColor: "specialText2.main",
            }
        }}
            onClick={action}
        >
            {icon}
            <Stack gap={1} sx={{ minWidth: { xs: "150px", sm: "105px" } }}>
                <Typography variant="h5" sx={{ fontSize: "1.2rem" }}>{title}</Typography>
            </Stack>
        </Box>
    </Link>
    )
}

const StatisticsBoxComponent = ({ title, value, icon }) => {
    return (
        <Box className="flex-center" sx={{
            flexGrow: 1,
            border: "1px solid #9d9d9d",
            gap: { xs: 4, sm: 2 },
            bgcolor: "bgColor.main",
            py: 2.5,
            px: 4,
            borderRadius: 2,
            mx: { xs: 1, sm: 0 },
        }}>
            {icon}
            <Stack gap={1} sx={{ minWidth: { xs: "150px", sm: "95px" } }}>
                <Typography variant="h5" sx={{ fontSize: { xs: "1.2rem", sm: "0.8rem" } }}>{title}</Typography>
                <Typography variant="h5" sx={{ fontSize: { xs: "2rem", sm: "1.2rem" } }}>{value}</Typography>
            </Stack>
        </Box>
    );
}

export default HomePage;