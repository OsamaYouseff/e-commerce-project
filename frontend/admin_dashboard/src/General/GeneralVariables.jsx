/* eslint-disable react/prop-types */
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

export const DashboardMenuVar = [
    {
        title: "Dashboard",
        icon: <HomeRoundedIcon fontSize="small" />,
        url: `/dashboard`,
        action: null,
    },
    {
        title: "Orders",
        icon: <LocalShippingIcon fontSize="small" />,
        url: `/orders`,
        action: null,
    },
    {
        title: "Products",
        icon: <PersonIcon fontSize="small" />,
        url: `/products`,
        action: null,
    },
    {
        title: "Customers",
        icon: <Groups2RoundedIcon fontSize="small" />,
        url: `/customers`,
        action: null,
    },

];

export const UserMenuItems = [
    {
        title: "Profile",
        icon: <PersonIcon fontSize="small" />,
        url: `/profile`,
        action: null,
    },

    {
        title: "Settings",
        icon: <Settings fontSize="small" />,
        url: `/settings`,
        action: null,
    },
    {
        title: "Logout",
        icon: <Logout fontSize="small" />,
        url: `/login`,
        action: null,
    },
];

// // // // // // //  warning don't change the order of these Statuses  // // // // // // //
export const orderStatuses = ["pending", "processing", "delivered", "canceled"];



