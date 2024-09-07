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

const SelectMenu = ({ minWidth = "9.375rem", options, selectedOption, setSelectedOption }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    // const [selectedIndex, setSelectedIndex] = useState(0);
    const open = Boolean(anchorEl);
    const handleClickListItem = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuItemClick = (value) => {
        setSelectedOption(value);
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
                maxHeight: "2.2rem",
            }}
        >
            <List
                component="nav"
                aria-label="Device settings"
                sx={{
                    p: 0,
                    minWidth: minWidth,
                    bgcolor: "transparent",
                    flexGrow: 1,
                }}
            >
                <ListItemButton
                    id="lock-button"
                    aria-haspopup="listbox"
                    aria-controls="change-category-menu"
                    aria-label="when device is locked"
                    aria-expanded={open ? "true" : "false"}
                    onClick={handleClickListItem}
                    sx={{
                        maxHeight: "2.2rem", border: ".0625rem solid #777", borderRadius: ".5rem",
                    }}
                >
                    <ListItemText
                        secondary={selectedOption}
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
                        selected={option === selectedOption}
                        onClick={(e) => handleMenuItemClick(option)}
                        sx={{
                            fontSize: "1rem",
                            minWidth: minWidth,
                            ".css-6hp17o-MuiList-root-MuiMenu-list": { py: 0 },
                            // bgcolor: theme.palette.categoryColor.main,
                        }}
                    >
                        {option}
                    </MenuItem>
                ))}
            </Menu>
        </Box >
    );
};

export default SelectMenu;
