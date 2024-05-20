import { Box, Stack, Typography } from "@mui/material";
import Container from '@mui/material/Container';
import LocalGroceryStoreOutlinedIcon from '@mui/icons-material/LocalGroceryStoreOutlined';
import { styled, alpha, useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import PersonIcon from '@mui/icons-material/Person';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useState } from "react";
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ColorModeContext } from "../../Theme/theme";

const transitionDuration = '350ms';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #777",
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        right: -3,
        top: 13,
        border: `2px solid ${theme.palette.background.paper}`,
        padding: '0 4px',
    },
}));

const options = [
    'All Category',
    'Clothes',
    'Electronics',
    'Furniture',
];

const MidHeader = function () {
    const theme = useTheme(ColorModeContext.theme);
    const fontSizeClamp = "clamp(11px,calc(12px + (14 - 12) * (100vw - 1000px) / (1920 - 1000)),14px) !important";
    return (
        <Container maxWidth="xl" sx={{
            marginTop: "15px"
        }}>
            <Stack className="" sx={{
                display: "flex",
                flexDirection: { xs: "row-reverse", md: "row" },
                flexWrap: "wrap",
                justifyContent: "space-between", alignItems: "center",
                gap: "10px",
            }}>
                {/* Logo */}
                <Stack alignItems={"center"} sx={{
                    order: { md: -1 },
                }} >
                    <LocalGroceryStoreOutlinedIcon sx={{ fontSize: "28px" }} />
                    <Typography variant="body" sx={{ fontSize: fontSizeClamp, fontWeight: "bolder" }}>E-Commerce</Typography>
                </Stack>
                {/*== Logo ==*/}

                {/* Search */}
                <Box flexGrow={0.6} sx={{ p: 0, minWidth: { xs: "100%", md: "150px" } }}>
                    <Search sx={{
                        p: 0, borderRadius: "25px", bgcolor: theme.palette.bgColor.main,
                        maxHeight: "40px !important", minWidth: "100%",
                        margin: "0 !important"
                    }}>
                        <SearchIconWrapper >
                            <SearchIcon sx={{ color: "#777" }} />
                        </SearchIconWrapper>
                        <StyledInputBase
                            // className="border"
                            placeholder="Search…"
                            inputProps={{ 'aria-label': 'search' }}
                            sx={{ flex: 1 }}
                        />
                        <SimpleListMenu />
                    </Search>
                </Box>
                {/*== Search ==*/}

                {/* Icons */}
                <Stack alignItems={"center"} direction={"row"} sx={{
                    [theme.breakpoints.down("md")]: {
                        order: -1
                    }
                }}>
                    <IconButton aria-label="cart" sx={{ transition: transitionDuration, "& :hover": { cursor: "pointer" } }}>
                        <PersonIcon sx={{ borderRadius: "7px" }} />
                    </IconButton>
                    <IconButton aria-label="cart" >
                        <StyledBadge badgeContent={4} color="primary"  >
                            <ShoppingCartIcon sx={{ transition: transitionDuration }} />
                        </StyledBadge>

                    </IconButton>
                </Stack>
                {/*== Icons ==*/}
            </Stack>
        </Container >
    );
}

function SimpleListMenu() {
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
                        key={option}
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


export default MidHeader;