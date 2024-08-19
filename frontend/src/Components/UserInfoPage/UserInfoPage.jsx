/* eslint-disable react/prop-types */
import { Container, Stack, Typography, Box } from "@mui/material";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";

/// context
import { ColorModeContext } from "../../Theme/theme";

///// hooks
import { useParams } from "react-router-dom";
import { useTheme } from "@emotion/react";

/// redux
import {
    GetUserInfo,
    GoHome,
    IsUserLoggedIn,
} from "../../General/GeneralFunctions";
import { logoutCustomerAccountReducer } from "../../redux/CustomerSlice/ApiCustomerSlice";
import { useDispatch } from "react-redux";

//// General Vars & Functions
import { CustomerMenuItemsVar } from "../../General/GeneralVariables";
import ProfileComponent from "./ProfileComponent/ProfileComponent.jsx";

//// custom component
import AddressComponent from "./AddressComponent/AddressComponent.jsx";
import OrdersComponent from "./OrdersComponent/OrdersComponent.jsx";
import PaymentsComponent from "./PaymentsComponent/PaymentsComponent.jsx";
import SettingsComponent from "./SettingsComponent/SettingsComponent.jsx";
import WishlistComponent from "./WishlistComponent/WishlistComponent.jsx";
import toast from 'react-hot-toast';

///// sub custom component
import AddAddressComponent from "./AddressComponent/AddAddressComponent.jsx";
import UpdateAddressComponent from "./AddressComponent/UpdateAddressComponent.jsx";
import OrderSummary from "./OrdersComponent/OrderSummary.jsx";

const UserInfoPage = () => {
    const { section } = useParams();

    const dispatch = useDispatch();
    const CustomerMenuItems = CustomerMenuItemsVar;
    const theme = useTheme(ColorModeContext);
    let customerData = GetUserInfo();

    const handleLogout = () => {
        if (IsUserLoggedIn()) dispatch(logoutCustomerAccountReducer());
        else toast.error("You are already logged out");
    };
    //// adding logout function
    CustomerMenuItems.at(-1).action = handleLogout;

    const getTargetSection = (section) => {
        switch (section) {
            case "orders":
                return <OrdersComponent />;
            case "order-summary":
                return <OrderSummary />;
            case "profile":
                return <ProfileComponent customerData={customerData} />;
            case "address":
                return <AddressComponent />;
            case "add-address":
                return <AddAddressComponent />;
            case "update-address":
                return <UpdateAddressComponent />;
            case "wishlist":
                return <WishlistComponent />;
            case "payments":
                return <PaymentsComponent />;
            case "settings":
                return <SettingsComponent />;
            default:
                return <ProfileComponent customerData={customerData} />;
        }
    };

    if (!IsUserLoggedIn()) {
        GoHome();
    } else {
        return (
            <Container
                maxWidth="xl"
                sx={{
                    width: { xs: "95%" },
                    marginTop: "10px",
                    bgcolor: theme.palette.categoryColor.main,
                    borderRadius: "6px",
                    px: "2px !important",
                    py: "8px",
                    boxShadow: 3,
                    mb: 2,
                    alignItems: "space-between",
                }}
            >
                <Stack
                    className="flex-between "
                    sx={{
                        display: "flex",
                        gap: "20px",
                        flexDirection: { xs: "column", md: "row" },
                        width: "100%",
                        height: "100%",
                        p: 1,
                        alignItems: { xs: "center", md: "flex-start" },
                    }}
                >
                    <Stack
                        sx={{
                            width: "20%",
                            minWidth: {
                                xs: "100%",
                                md: "200px",
                                lg: "250px",
                            },
                            height: "100%",
                            p: 3,
                            borderRadius: "6px",
                            px: 1,
                            display: { xs: "none", md: "block" },
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: "18px",
                                px: 2,
                                fontWeight: "bolder",
                            }}
                            variant="body"
                        >
                            Hello <span> {customerData.username} ✋</span>
                        </Typography>
                        <Typography
                            sx={{ fontSize: "16px", px: 2 }}
                            variant="body"
                        >
                            {customerData.email}
                        </Typography>
                        <Divider sx={{ m: "10px", width: "90%" }} />
                        <Box>
                            {CustomerMenuItems.map((item, index) => (
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
                                            minWidth: {
                                                xs: "380px",
                                                sm: "100%",
                                            },
                                            py: 1.2,
                                            border: `1px solid ${item.title.toLowerCase() ==
                                                section
                                                ? theme.palette.text.primary
                                                : "inherit"
                                                }`,
                                            borderRadius: "6px",
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
                    </Stack>

                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ display: { xs: "none", md: "block" } }}
                    />

                    {/* Variable Page */}
                    <Box
                        sx={{
                            minWidth: { xl: "1100px" },
                            minHeight: { xs: "auto" },
                            height: "100%",
                            flexGrow: 1,
                        }}
                    >
                        {getTargetSection(section)}
                    </Box>
                    {/* == Variable Page == */}
                </Stack>
            </Container>
        );
    }
};

export default UserInfoPage;
