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
import { GetUserInfo } from "../../General/GeneralFunctions";
import { logoutCustomerAccountReducer } from "../../redux/ApiCustomerSlice";
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

///// sub custom component
import AddAddressComponent from "./AddressComponent/AddAddressComponent.jsx";
import UpdateAddressComponent from "./AddressComponent/UpdateAddressComponent.jsx";

const UserInfoPage = () => {
    const { section, addressId } = useParams();

    const dispatch = useDispatch();
    const CustomerMenuItems = CustomerMenuItemsVar;
    const theme = useTheme(ColorModeContext);
    let customerData = GetUserInfo();

    //// TODO : Fix login reducer to rerender component after login

    const handleLogout = () => {
        dispatch(logoutCustomerAccountReducer());
    };
    //// adding logout function
    CustomerMenuItems.at(-1).action = handleLogout;

    const getTargetSection = (section) => {
        switch (section) {
            case "orders":
                return <OrdersComponent />;
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

    return (
        <Box className="flex-center" sx={{ flexGrow: 1, pt: 1 }}>
            <Container
                maxWidth="xl"
                sx={{
                    width: { xs: "95%", md: "auto" },
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
                    className="flex-between"
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
                            minWidth: { xs: "100%", md: "200px", lg: "300px" },
                            height: "100%",
                            p: 3,
                            borderRadius: "6px",
                            // borderRight: `1px solid #bdbec7`,
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
                                        color: "inherit",
                                    }}
                                    onClick={item.action}
                                >
                                    <MenuItem
                                        // onClick={handleClose}
                                        sx={{
                                            minWidth: {
                                                xs: "380px",
                                                sm: "100%",
                                            },
                                            py: 1.2,
                                            border: `1px solid ${
                                                item.title == section
                                                    ? theme.palette.text.primary
                                                    : "inherit"
                                            }`,
                                            borderRadius: "6px",
                                        }}
                                    >
                                        <ListItemIcon>{item.icon}</ListItemIcon>
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
        </Box>
    );
};

export default UserInfoPage;
