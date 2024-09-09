/* eslint-disable react/prop-types */
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PaymentIcon from "@mui/icons-material/Payment";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";

export const CustomerMenuItemsVar = [
    {
        title: "Cart",
        icon: <ShoppingCartRoundedIcon fontSize="small" />,
        url: `/cart`,
        action: null,
    },
    {
        title: "Orders",
        icon: <LocalShippingIcon fontSize="small" />,
        url: `/userInfo/orders`,
        action: null,
    },
    {
        title: "Profile",
        icon: <PersonIcon fontSize="small" />,
        url: `/userInfo/profile`,
        action: null,
    },
    {
        title: "Address",
        icon: <LocationOnIcon fontSize="small" />,
        url: `/userInfo/address`,
        action: null,
    },
    {
        title: "Wishlist",
        icon: <FavoriteIcon fontSize="small" />,
        url: `/userInfo/wishlist`,
        action: null,
    },
    {
        title: "Payments",
        icon: <PaymentIcon fontSize="small" />,
        url: `/userInfo/payments`,
        action: null,
    },
    {
        title: "Settings",
        icon: <Settings fontSize="small" />,
        url: `/userInfo/settings`,
        action: null,
    },
    {
        title: "Logout",
        icon: <Logout fontSize="small" />,
        url: `/home`,
        action: null,
    },
];

export const coupons = [
    "10OFF", "15OFF", "20OFF", "25OFF", "50OFF"
]