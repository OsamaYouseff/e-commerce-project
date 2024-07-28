/* eslint-disable react/prop-types */
import { Fragment, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PaymentIcon from "@mui/icons-material/Payment";
import { useContext } from "react";
import { CustomerContext } from "../../../Contexts/CustomerContext";
import { Avatar } from "@mui/material";
import { ColorModeContext } from "../../../Theme/theme";
import { useTheme } from "@emotion/react";

const CustomerMenu = () => {
    const { customerData, customerDataDispatch } = useContext(CustomerContext);

    const userName = customerData.username || "";

    const theme = useTheme(ColorModeContext);

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        customerDataDispatch({ type: "LOGOUT" });
    };

    const CustomerMenuItems = [
        {
            title: "Orders",
            icon: <LocalShippingIcon fontSize="small" />,
            url: `\\cart`,
            action: null,
        },
        {
            title: "Profile",
            icon: <PersonIcon fontSize="small" />,
            url: `\\profile`,
            action: null,
        },
        {
            title: "Address",
            icon: <LocationOnIcon fontSize="small" />,
            url: `\\address`,
            action: null,
        },
        {
            title: "Wishlist",
            icon: <FavoriteIcon fontSize="small" />,
            url: `\\wishlist`,
            action: null,
        },
        {
            title: "Payments",
            icon: <PaymentIcon fontSize="small" />,
            url: `\\payments`,
            action: null,
        },
        {
            title: "Settings",
            icon: <Settings fontSize="small" />,
            url: `\\settings`,
            action: null,
        },
        {
            title: "Logout",
            icon: <Logout fontSize="small" />,
            url: `\\home`,
            action: handleLogout,
        },
    ];

    return (
        <Fragment>
            <Tooltip
                sx={{ textDecoration: "capitalize" }}
                title={
                    customerData.username !== ""
                        ? userName.toUpperCase()
                        : "User Account"
                }
            >
                <IconButton
                    onClick={handleClick}
                    size="small"
                    aria-controls={open ? "account-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                >
                    <Avatar sx={{
                        width: 28, height: 28,
                        color: theme.palette.sectionBgColor.main,
                        bgcolor: theme.palette.text.primary
                    }}>
                        {userName.toUpperCase()[0]}
                    </Avatar>
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: "visible",
                        filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                        mt: 1.5,
                        "& .MuiAvatar-root": {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        "&::before": {
                            content: '""',
                            display: "block",
                            position: "absolute",
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: "background.paper",
                            transform: "translateY(-50%) rotate(45deg)",
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
                {CustomerMenuItems.map((item, index) => (
                    <a
                        key={index}
                        href={item.url}
                        style={{ textDecoration: "none", color: "inherit" }}
                        onClick={item.action}
                    >
                        <MenuItem
                            onClick={handleClose}
                            sx={{
                                minWidth: { xs: "380px", sm: "260px" },
                                py: 1,
                                color: "inherit",
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            {item.title}
                        </MenuItem>
                    </a>
                ))}
            </Menu>
        </Fragment>
    );
};

export default CustomerMenu;
