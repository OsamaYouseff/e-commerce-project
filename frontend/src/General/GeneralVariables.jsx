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
        url: `\\cart`,
        action: null,
    },
    {
        title: "orders",
        icon: <LocalShippingIcon fontSize="small" />,
        url: `\\userInfo\\orders`,
        action: null,
    },
    {
        title: "profile",
        icon: <PersonIcon fontSize="small" />,
        url: `\\userInfo\\profile`,
        action: null,
    },
    {
        title: "address",
        icon: <LocationOnIcon fontSize="small" />,
        url: `\\userInfo\\address`,
        action: null,
    },
    {
        title: "wishlist",
        icon: <FavoriteIcon fontSize="small" />,
        url: `\\userInfo\\wishlist`,
        action: null,
    },
    {
        title: "payments",
        icon: <PaymentIcon fontSize="small" />,
        url: `\\userInfo\\payments`,
        action: null,
    },
    {
        title: "settings",
        icon: <Settings fontSize="small" />,
        url: `\\userInfo\\settings`,
        action: null,
    },
    {
        title: "Logout",
        icon: <Logout fontSize="small" />,
        url: `\\home`,
        action: null,
    },
];
