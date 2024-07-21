/* eslint-disable react/prop-types */
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import { Fragment, useState } from "react";
import PersonIcon from "@mui/icons-material/Person";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PaymentIcon from "@mui/icons-material/Payment";
import { useContext } from "react";
import { CustomerContext } from "../../../Contexts/CustomerContext";
import { Avatar } from "@mui/material";

const CustomerMenu = () => {
    const { customerData, customerDataDispatch } = useContext(CustomerContext);

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

    const CustomerListItems = [
        {
            title: "Orders",
            icon: <LocalShippingIcon fontSize="small" />,
            link: `\\cart`,
        },
        {
            title: "Profile",
            icon: <PersonIcon fontSize="small" />,
            link: `\\profile`,
        },
        {
            title: "Address",
            icon: <LocationOnIcon fontSize="small" />,
            link: `\\address`,
        },
        {
            title: "Wishlist",
            icon: <FavoriteIcon fontSize="small" />,
            link: `\\wishlist`,
        },
        {
            title: "Payments",
            icon: <PaymentIcon fontSize="small" />,
            link: `\\payments`,
        },
        {
            title: "Settings",
            icon: <Settings fontSize="small" />,
            link: `\\settings`,
        },
        {
            title: "Logout",
            icon: <Logout fontSize="small" />,
            link: `\\home`,
        },
    ];

    return (
        <Fragment>
            <Tooltip
                title={
                    customerData.FirstName.trim() !== ""
                        ? customerData.FirstName + " " + customerData.LastName
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
                    <Avatar sx={{ width: 28, height: 28 }}>
                        {customerData.FirstName[0]}
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
                {CustomerListItems.map((item, index) => (
                    <a
                        key={index}
                        href={item.link}
                        style={{ textDecoration: "none", color: "inherit" }}
                        onClick={handleLogout}
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
