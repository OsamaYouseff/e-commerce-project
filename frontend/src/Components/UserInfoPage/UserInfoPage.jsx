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
import { GetUserInfo, GoHome, IsUserLoggedIn } from "../../General/GeneralFunctions";
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
                    marginTop: ".625rem",
                    bgcolor: theme.palette.categoryColor.main,
                    borderRadius: ".375rem",
                    px: ".125rem !important",
                    py: ".5rem",
                    mb: 2,
                    alignItems: "space-between",
                }}
            >
                <Stack
                    className="flex-between "
                    sx={{
                        display: "flex",
                        gap: "1.25rem",
                        flexDirection: { xs: "column", md: "row" },
                        width: "100%",
                        height: "100%",
                        p: { xs: 0, md: 1 },
                        alignItems: { xs: "center", md: "flex-start" },
                    }}
                >
                    <Stack
                        sx={{
                            width: "15%",
                            minWidth: {
                                xs: "100%",
                                md: "12.5rem",
                                lg: "15.625rem",
                            },
                            height: "100%",
                            p: 3,
                            borderRadius: ".375rem",
                            px: 1,
                            display: { xs: "none", md: "block" },
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: "1.125rem",
                                px: 2,
                                fontWeight: "bolder",
                            }}
                            variant="body"
                        >
                            Hello <span> {customerData.username} ✋</span>
                        </Typography>
                        <Typography
                            sx={{ fontSize: "1rem", px: 2 }}
                            variant="body"
                        >
                            {customerData.email}
                        </Typography>
                        <Divider sx={{ m: ".625rem", width: "90%" }} />
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
                                                xs: "23.75rem",
                                                sm: "100%",
                                            },
                                            py: 1.2,
                                            border: `.0625rem solid ${item.title.toLowerCase() ==
                                                section
                                                ? theme.palette.text.primary
                                                : "inherit"
                                                }`,
                                            borderRadius: ".375rem",
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

                    <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />

                    {/* Variable Page */}
                    <Box
                        sx={{
                            minWidth: { xl: "68.75rem" },
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
