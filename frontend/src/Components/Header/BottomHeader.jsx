import { Stack, Typography } from "@mui/material";
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Fragment, useState } from "react";
import Box from '@mui/material/Box';
import { ColorModeContext } from "../../Theme/theme";
import { useTheme } from '@mui/material/styles';
import { Container } from "@mui/material";
import SwipeableDrawer from '@mui/material/Drawer';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useMediaQuery from '@mui/material/useMediaQuery';
import LinksMenus from "./LinksMenus";
//// Icons
import WidgetsIcon from '@mui/icons-material/Widgets';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import MenuIcon from '@mui/icons-material/Menu';
import PedalBikeIcon from '@mui/icons-material/PedalBike';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';


//// styles
const iconStyle = {
    fontSize: "24px",
    marginRight: "10px",
}
const LinksStyles = {
    padding: "4px 2px 2px 20px",
    cursor: "pointer",
    borderRadius: "4px",
    transition: "0.15s",
    "&:hover": { "backgroundColor": "#607D8B", color: "#f7f7f7" },
}

///// vars
const LinksData = [
    {
        title: "Home",
        links: ["link 1", "link 2", "link 3"],
    },
    {
        title: "Mega Menu",
        links: ["link 1", "link 2", "link 3"],
    },
    {
        title: "Full screen menu",
        links: ["link 1", "link 2", "link 3"],
    },
    {
        title: "Pages",
        links: ["link 1", "link 2", "link 3"],
    },
    {
        title: "User account",
        links: ["link 1", "link 2", "link 3"],
    },
    {
        title: "Vendor account",
        links: ["link 1", "link 2", "link 3"],
    },
];

const categoryData = [
    {
        title: "Bikes",
        icon: (<PedalBikeIcon sx={iconStyle} />),
    },
    {
        title: "Electronics",
        icon: (<ElectricBoltIcon sx={iconStyle} />),
    },
    {
        title: "Books",
        icon: (<MenuBookIcon sx={iconStyle} />),
    },
    {
        title: "Games",
        icon: (<SportsEsportsIcon sx={iconStyle} />),
    }
];

//// components

const BottomHeader = function () {
    return (
        <Container maxWidth="xl">
            <Stack
                className="flex-between"
                sx={{
                    marginTop: "15px",
                    width: "100%",
                    height: "60px",
                    color: "white",
                }}
            >
                <CategoryMenu />
                {useMediaQuery("(min-width:1000px) ") && (<LinksMenus />)}
                {useMediaQuery("(max-width:1000px) ") && (<Drawer />)}

            </Stack >
        </Container>
    )
}

function CategoryMenu() {
    const fontSizeClamp = "clamp(11px,calc(12px + (15 - 12) * (100vw - 1000px) / (1920 - 1000)),16px) !important";
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const theme = useTheme(ColorModeContext.theme);


    return (
        <Stack
            alignItems={"center"}
            sx={{ bgcolor: theme.palette.categoryColor.main, minWidth: "150px", borderRadius: "5px", border: "1px solid #777" }}
        >
            <Button
                className="flex-between"
                id="basic-button"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                sx={{ gap: 1, color: theme.palette.text.primary, width: "100%" }}
            >
                <WidgetsIcon fontSize="small" />
                <Typography className="clamp14-20">Category</Typography>
                <Box flexGrow={1}></Box>
                <KeyboardArrowRightIcon fontSize="small" />
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
                sx={{
                    transform: "translateY(5px)",
                    ".css-6hp17o-MuiList-root-MuiMenu-list": { backgroundColor: theme.palette.categoryColor.main }
                }}
            >
                {categoryData.map((item, index) => (
                    <MenuItem key={index} sx={{ width: "190px", }} onClick={handleClose}>
                        {item.icon}
                        <Typography sx={{ fontSize: fontSizeClamp }}>{item.title}</Typography>
                    </MenuItem>
                ))}

            </Menu>
        </Stack >
    );
}

function Drawer() {
    const [state, setState] = useState({
        top: false,
        left: false,
        bottom: false,
        right: false,
    });
    const toggleDrawer = (anchor, open) => (event) => {
        if (
            event &&
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return;
        }

        setState({ ...state, [anchor]: open });
    };
    const theme = useTheme(ColorModeContext.theme);
    const openingLocation = "top";

    return (
        <Fragment >
            <MenuIcon onClick={toggleDrawer(openingLocation, true)} sx={{ color: theme.palette.text.primary, cursor: "pointer" }} />

            <SwipeableDrawer SwipeableDrawer
                anchor={openingLocation}
                open={state[openingLocation]}
                onClose={toggleDrawer(openingLocation, false)}
                onOpen={toggleDrawer(openingLocation, true)}
            >
                <Box className="flex-start" sx={{
                    height: "1000px",
                    border: "1px solid #777",
                    bgcolor: theme.palette.categoryColor.main,

                }}>
                    <Box className="accordions-container flex-column-center " sx={{ width: "100%", minWidth: "350px", gap: "10px", p: 1, borderRadius: "5px" }}>
                        <Button sx={{ color: theme.palette.text.primary, marginTop: "15px", }} onClick={toggleDrawer(openingLocation, false)}>
                            <CloseRoundedIcon sx={{
                                fontSize: "45px",
                                width: "45px",
                                height: "45px",
                                cursor: "pointer",
                                borderRadius: "50%",
                                p: 1,
                                color: theme.palette.text.primary,
                                border: `1px solid ${theme.palette.text.primary}`,
                                "&:hover": { rotate: "180deg", color: "#ff6e6e", borderColor: "#ff6e6e" },
                                transition: "0.35s"
                            }} onClick={toggleDrawer(openingLocation, false)} />
                        </Button>
                        <AccordionComponents />
                    </Box>
                </Box>
            </SwipeableDrawer >
        </Fragment >
    )
}

function AccordionComponents() {
    return (
        LinksData.map((item) => {
            return (
                <Accordion key={item.id} sx={{ maxWidth: "380px", minWidth: "95% !important", m: 0 }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"

                    >
                        {item.title}
                    </AccordionSummary>
                    <AccordionDetails>
                        {item.links.map((link) => {
                            return (
                                <Typography sx={LinksStyles} key={item.id}>{link}</Typography>
                            )
                        })}
                    </AccordionDetails>
                </Accordion>
            )

        }
        )
    )
}

export default BottomHeader;