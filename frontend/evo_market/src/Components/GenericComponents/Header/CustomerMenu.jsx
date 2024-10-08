/* eslint-disable react/prop-types */
import { Fragment, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { Avatar } from "@mui/material";
import { ColorModeContext } from "../../../../../shared_files/Theme/theme.jsx";
import { useTheme } from "@emotion/react";

///// redux
import { useDispatch } from "react-redux";
import { GetUserInfo, IsUserLoggedIn } from "../../../General/GeneralFunctions.js";
import { logoutCustomerAccountReducer } from "../../../redux/CustomerSlice/ApiCustomerSlice";

//// General Vars & Functions
import { CustomerMenuItemsVar } from "../../../General/GeneralVariables";

const CustomerMenu = () => {
    const CustomerMenuItems = CustomerMenuItemsVar;

    const dispatch = useDispatch();
    const customerData = GetUserInfo();
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
        if (IsUserLoggedIn()) dispatch(logoutCustomerAccountReducer());
    };

    //// adding logout function
    CustomerMenuItems.at(-1).action = handleLogout;

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
                    aria-controls={open ? "account-menu" : "account-menu"}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : "false"}
                >
                    <Avatar
                        className="flex-center"
                        sx={{
                            width: 32,
                            height: 32,
                            color: "sectionBgColor.main",
                            bgcolor: "text.primary",
                            fontWeight: "bolder",
                        }}
                    >
                        <span style={{ fontSize: "1.5rem" }}>
                            {userName.toUpperCase()[0]}
                        </span>
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
                        filter: "drop-shadow(0rem .125rem .5rem rgba(0,0,0,0.32))",
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
                        style={{
                            textDecoration: "none",
                            color: theme.palette.text.primary,
                        }}
                        onClick={item.action}
                    >
                        <MenuItem
                            onClick={handleClose}
                            sx={{
                                minWidth: { xs: "23.75rem", sm: "16.25rem" },
                                py: 1,
                                color: "inherit",
                            }}
                        >
                            <ListItemIcon sx={{ color: "inherit" }}>
                                {item.icon}
                            </ListItemIcon>
                            {item.title}
                        </MenuItem>
                    </a>
                ))}
            </Menu>
        </Fragment>
    );
};

export default CustomerMenu;
