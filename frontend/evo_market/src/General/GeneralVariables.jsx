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

/**
 * Coupon discount rates. Kept in one place with the API's table so the preview
 * and the charged order agree; the API validates the code and recomputes the
 * discount from catalog prices.
 */
export const couponRates = {
    "10OFF": 0.1,
    "15OFF": 0.15,
    "20OFF": 0.2,
    "25OFF": 0.25,
    "50OFF": 0.5,
};

export const coupons = Object.keys(couponRates);

/** Order of $50 or more ships free, otherwise flat $20. */
export const FREE_SHIPPING_THRESHOLD = 5000;
export const FLAT_SHIPPING_COST = 2000;

/** The API only accepts cash on delivery today; card payment is not implemented. */
export const PAYMENT_METHODS = ["cash_on_delivery"];