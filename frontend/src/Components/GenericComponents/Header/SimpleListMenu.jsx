import { useState } from "react";
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ColorModeContext } from "../../../Theme/theme";
import { useTheme } from '@mui/material/styles';

const SimpleListMenu = () => {
    const options = [
        'All Category',
        'Clothes',
        'Electronics',
        'Furniture',
    ];

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
        <div style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            maxHeight: "40px",

        }} >
            <List
                component="nav"
                aria-label="Device settings"
                sx={{
                    p: 0, minWidth: "160px", borderTopRightRadius: "25px",
                    borderBottomRightRadius: "25px",
                    overflow: "hidden", bgcolor: theme.palette.categoryColor.main,
                    borderLeft: "1px solid #777",

                }}
            >
                <ListItemButton
                    id="lock-button"
                    aria-haspopup="listbox"
                    aria-controls="lock-menu"
                    aria-label="when device is locked"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClickListItem}
                    sx={{ maxHeight: "40px", border: "1px solid #777", }}
                >
                    <ListItemText
                        secondary={options[selectedIndex]}
                        sx={{ textAlign: "center" }}
                    />
                    <ExpandMoreIcon sx={{ fontSize: "24px", color: "#777" }} />

                </ListItemButton>
            </List>
            <Menu
                id="lock-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'lock-button',
                    role: 'listbox',
                }}
                sx={{ transform: "translateY(3px)" }}

            >
                {options.map((option, index) => (
                    <MenuItem
                        key={index}
                        selected={index === selectedIndex}
                        onClick={(event) => handleMenuItemClick(event, index)}
                        sx={{ fontSize: "16px", minWidth: "145px", ".css-6hp17o-MuiList-root-MuiMenu-list": { py: 0 } }}
                    >
                        {option}
                    </MenuItem>
                ))}
            </Menu>
        </div >
    );
}

export default SimpleListMenu;