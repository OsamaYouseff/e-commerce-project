import { useState } from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ColorModeContext } from "../../../Theme/theme";
import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/material";

const SimpleListMenu = () => {
    const options = ["All Category", "Clothes", "Electronics", "Furniture"];

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const open = Boolean(anchorEl);
    const handleClickListItem = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuItemClick = (event, index) => {
        setSelectedIndex(index);
        setAnchorEl(null);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const theme = useTheme(ColorModeContext.theme);

    return (
        <Box
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                maxHeight: "2.5rem",
            }}
        >
            <List
                component="nav"
                aria-label="Device settings"
                sx={{
                    p: 0,
                    minWidth: "10rem",
                    borderTopRightRadius: "1.5625rem",
                    borderBottomRightRadius: "1.5625rem",
                    overflow: "hidden",
                    bgcolor: theme.palette.categoryColor.main,
                    borderLeft: ".0625rem solid #777",
                }}
            >
                <ListItemButton
                    id="lock-button"
                    aria-haspopup="listbox"
                    aria-controls="change-category-menu"
                    aria-label="when device is locked"
                    aria-expanded={open ? "true" : "false"}
                    onClick={handleClickListItem}
                    sx={{ maxHeight: "2.5rem", border: ".0625rem solid #777" }}
                >
                    <ListItemText
                        secondary={options[selectedIndex]}
                        sx={{ textAlign: "center" }}
                    />
                    <ExpandMoreIcon sx={{ fontSize: "1.5rem", color: "#777" }} />
                </ListItemButton>
            </List>
            <Menu
                id="lock-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    "aria-labelledby": "lock-button",
                    role: "listbox",
                }}
                sx={{ transform: "translateY(.1875rem)" }}
            >
                {options.map((option, index) => (
                    <MenuItem
                        key={index}
                        selected={index === selectedIndex}
                        onClick={(event) => handleMenuItemClick(event, index)}
                        sx={{
                            fontSize: "1rem",
                            minWidth: "9.0625rem",
                            ".css-6hp17o-MuiList-root-MuiMenu-list": { py: 0 },
                        }}
                    >
                        {option}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
};

export default SimpleListMenu;
