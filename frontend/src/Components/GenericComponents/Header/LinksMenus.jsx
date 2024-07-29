import {
    ListItem,
    ListItemButton,
    ListItemText,
    Stack,
    Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ColorModeContext } from "../../../Theme/theme";
import { useTheme } from "@mui/material/styles";
import Paper from "@mui/material/Paper";

//// icons
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

//// vars
const HomeMenuData = [
    { titleName: "Dashboard" },
    {
        titleName: "Products",
        listClassName: "Products-List",
        subMenu: (
            <SubMenu
                listClassName={"Products-List"}
                subMenuLinks={[
                    { titleName: "All Products" },
                    { titleName: "Add Edit Products" },
                    { titleName: "Sub Link 3" },
                    { titleName: "Sub Link 4" },
                ]}
            />
        ),
    },
    { titleName: "Orders" },
    { titleName: "Profile" },
];
const MegaMenuData = [
    { titleName: "Base Link 1" },
    { titleName: "Base Link 2" },

    {
        titleName: "Base Link 3",
        listClassName: "BaseLink1-List",
        subMenu: (
            <SubMenu
                listClassName={"BaseLink1-List"}
                subMenuLinks={[
                    { titleName: "Sub Link 1" },
                    { titleName: "Sub Link 2" },
                    { titleName: "Sub Link 3" },
                    { titleName: "Sub Link 4" },
                ]}
            />
        ),
    },
    { titleName: "Base Link 4" },
];
const FullScreenMenuData = [
    { titleName: "Base Link 1" },
    {
        titleName: "Base Link 2",
        listClassName: "BaseLink1-List",
        subMenu: (
            <SubMenu
                listClassName={"BaseLink1-List"}
                subMenuLinks={[
                    { titleName: "Sub Link 1" },
                    { titleName: "Sub Link 2" },
                    { titleName: "Sub Link 3" },
                    { titleName: "Sub Link 4" },
                ]}
            />
        ),
    },
    { titleName: "Base Link 3" },
    { titleName: "Base Link 4" },
];
const PagesMenuData = [
    { titleName: "Sale Page" },
    { titleName: "Shop" },
    { titleName: "Auth" },
    {
        titleName: "Vendor",
        listClassName: "BaseLink1-List",
        subMenu: (
            <SubMenu
                listClassName={"BaseLink1-List"}
                subMenuLinks={[
                    { titleName: "Sub Link 1" },
                    { titleName: "Sub Link 2" },
                    { titleName: "Sub Link 3" },
                    { titleName: "Sub Link 4" },
                ]}
            />
        ),
    },
];
const UserMenuData = [
    { titleName: "Order" },
    { titleName: "Profile" },
    { titleName: "Address" },
    {
        titleName: "Vendor",
        listClassName: "BaseLink4-List",
        subMenu: (
            <SubMenu
                listClassName={"BaseLink4-List"}
                subMenuLinks={[
                    { titleName: "Sub Link 1" },
                    { titleName: "Sub Link 2" },
                    { titleName: "Sub Link 3" },
                    { titleName: "Sub Link 4" },
                ]}
            />
        ),
    },
    {
        titleName: "Support tickets",
        listClassName: "BaseLink5-List",
        subMenu: (
            <SubMenu
                listClassName={"BaseLink5-List"}
                subMenuLinks={[
                    { titleName: "Sub Link 1" },
                    { titleName: "Sub Link 2" },
                    { titleName: "Sub Link 3" },
                    { titleName: "Sub Link 4" },
                ]}
            />
        ),
    },
    { titleName: "wishlist" },
];
const VendorMenuData = [
    { titleName: "Dashboard" },
    { titleName: "Products" },
    { titleName: "Order" },
    {
        titleName: "Profile",
        listClassName: "BaseLink4-List",
        subMenu: (
            <SubMenu
                listClassName={"BaseLink4-List"}
                subMenuLinks={[
                    { titleName: "Sub Link 1" },
                    { titleName: "Sub Link 2" },
                    { titleName: "Sub Link 3" },
                    { titleName: "Sub Link 4" },
                ]}
            />
        ),
    },
];

//// styles
const ListItemButtonStyles = {
    px: 2,
    fontSize: "15px",
    m: 0,
    borderRadius: "6px",
};

const LinksMenus = () => {
    return (
        <Stack
            flexGrow={1}
            className="flex-center"
            sx={{ zIndex: "100 !important" }}
        >
            <BaseMenu key={1} titleName={"Home"} subMenu={HomeMenuData} />
            <BaseMenu key={2} titleName={"Mega Menu"} subMenu={MegaMenuData} />
            <BaseMenu
                key={3}
                titleName={"Full screen menu"}
                subMenu={FullScreenMenuData}
            />
            <BaseMenu key={4} titleName={"Pages"} subMenu={PagesMenuData} />
            <BaseMenu
                key={5}
                titleName={"User account"}
                subMenu={UserMenuData}
            />
            <BaseMenu
                key={6}
                titleName={"Vendor account"}
                subMenu={VendorMenuData}
            />
        </Stack>
    );
};

// eslint-disable-next-line react/prop-types
function BaseMenu({ key, titleName, subMenu }) {
    const theme = useTheme(ColorModeContext);
    return (
        <Box
            key={key}
            className="flex-center"
            sx={{
                ".css-10hburv-MuiTypography-root": {
                    fontSize:
                        "clamp(10px,calc(12px + (16 - 12) * (100vw - 1000px) / (1920 - 1000)),16px) !important",
                },
            }}
        >
            <ListItem
                cursor="pointer"
                className="flex-center"
                sx={{
                    maxWidth: "250px",
                    position: "relative",
                    "&:hover": {
                        ".Base-List": {
                            display: "block",
                            zIndex: "99",
                            bgcolor: theme.palette.categoryColor.main,
                        },
                    },
                    padding: "6px",
                }}
            >
                <ListItemButton
                    className="flex-center"
                    sx={{
                        px: 1.5,
                        py: 0.31,
                        justifyContent: "center",
                        bgcolor: theme.palette.categoryColor.main,
                        color: theme.palette.text.primary,
                        borderRadius: "4px",
                        border: "1px solid #7777",
                    }}
                >
                    <Typography
                        sx={{ textTransform: "capitalize" }}
                        className="clamp14-20"
                    >
                        {titleName}
                    </Typography>
                    <ExpandMoreIcon sx={{ fontSize: "20px" }} />
                </ListItemButton>

                {/* List Menu */}
                <Paper
                    className="Base-List"
                    sx={{
                        minWidth: "180px",
                        position: "absolute",
                        top: "100%",
                        Padding: "4px",
                        display: "none",
                    }}
                >
                    {[...subMenu].map((item) => {
                        return (
                            <ListItem
                                key={item.id}
                                sx={{
                                    borderRadius: "4px",
                                    ".MuiListItemButton-root.MuiListItemButton-gutters":
                                        { padding: "5px 4px 5px 15px  " },
                                    padding: "0px !important",
                                    color: theme.palette.text.primary,
                                    "&:hover": {
                                        // ".Products-List": { display: "block" },
                                        ...(`${item.listClassName}` != null && {
                                            [`.${item.listClassName}`]: {
                                                display: "block",
                                                zIndex: "100",
                                                color: theme.palette
                                                    .categoryColor.main,
                                            },
                                        }),
                                    },
                                }}
                            >
                                <ListItemButton sx={ListItemButtonStyles}>
                                    <ListItemText primary={item.titleName} />
                                    {item.subMenu != null ? (
                                        <KeyboardArrowRightIcon fontSize="16px" />
                                    ) : null}
                                    {item.subMenu}
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </Paper>
                {/*== List Menu ==*/}
            </ListItem>
        </Box>
    );
}
// eslint-disable-next-line react/prop-types
function SubMenu({ listClassName, subMenuLinks }) {
    const theme = useTheme(ColorModeContext);
    return (
        <Box
            className={listClassName}
            sx={{
                minWidth: "180px",
                position: "absolute",
                top: "0%",
                left: `-100%`,
                backgroundColor: "transparent",
                Padding: "4px",
                display: "none",
            }}
        >
            {/* List Menu */}
            <Paper
                sx={{
                    width: "100%",
                    bgcolor: theme.palette.categoryColor.main,
                }}
            >
                {[...subMenuLinks].map((item, index) => {
                    return (
                        <ListItem
                            key={index}
                            sx={{
                                padding: "0",
                                color: theme.palette.text.primary,
                            }}
                        >
                            <ListItemButton sx={ListItemButtonStyles}>
                                <ListItemText primary={item.titleName} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </Paper>
            {/* List Menu */}
        </Box>
    );
}

export default LinksMenus;
