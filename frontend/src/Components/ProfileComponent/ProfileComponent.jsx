/* eslint-disable react/prop-types */
import { useTheme } from "@emotion/react";
import { Container, Stack, Typography, Box } from "@mui/material";
import { ColorModeContext } from "../../Theme/theme";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PaymentIcon from "@mui/icons-material/Payment";
import { useContext } from "react";
import { CustomerContext } from "../../Contexts/CustomerContext";
import Grid from "@mui/material/Grid";
import { useState } from "react";
import { Button } from "@mui/material";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Man2RoundedIcon from "@mui/icons-material/Man2Rounded";
import Woman2RoundedIcon from "@mui/icons-material/Woman2Rounded";
import TextFieldComponent from "../GenericComponents/TextFieldComponent/TextFieldComponent";
import CustomerMenuDrawer from "./CustomerMenuDrawer";

const ProfileComponent = () => {
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

    const theme = useTheme(ColorModeContext);
    const { customerData, customerDataDispatch } = useContext(CustomerContext);

    const [formData, setFormData] = useState({
        firstname: customerData.firstname,
        lastname: customerData.lastname,
        username: customerData.username,
        email: customerData.email,
        password: customerData.password,
        phone: customerData.phone,
        gender: customerData.gender,
    });

    ///// TODO : Return isDataChanged to false after doing your job
    const [isDataChanged, setIsDataChanged] = useState(false);

    const checkDataChanged = (formData) => {
        if (
            formData.firstname === customerData.firstname &&
            formData.lastname === customerData.lastname &&
            formData.username === customerData.username &&
            formData.email === customerData.email &&
            formData.password === customerData.password &&
            formData.phone === customerData.phone &&
            formData.gender === customerData.gender
        ) {
            setIsDataChanged(false);
        } else {
            setIsDataChanged(true);
        }
    };

    ///// handlers
    const handleUpdateData = (e) => {
        e.preventDefault();

        const { password, ...rest } = formData;

        customerDataDispatch({
            type: "UPDATE_USER_DATA",
            payload: rest,
        });
    };

    const handelGender = (event, newValue) => {
        if (newValue !== null) {
            // setFormData({ ...formData, gender: newValue });

            const updatedFormData = {
                ...formData,
                gender: newValue,
            };
            setFormData(updatedFormData);

            checkDataChanged(updatedFormData);
        }
    };

    const handelFormData = (key, value) => {
        const updatedFormData = {
            ...formData,
            [key]: value,
        };
        setFormData(updatedFormData);
        checkDataChanged(updatedFormData);
    };

    return (
        <Container
            maxWidth="xl"
            sx={{
                width: { xs: "95%", md: "auto" },
                marginTop: "10px",
                bgcolor: theme.palette.categoryColor.main,
                borderRadius: "6px",
                px: "5px ",
                py: "8px",
                boxShadow: 3,
                mb: 2,
            }}
        >
            <Stack
                sx={{
                    display: "flex",
                    gap: "20px",
                    flexDirection: { xs: "column", md: "row" },
                    width: "100%",
                    height: "100%",
                    p: 0,
                }}
            >
                <Stack
                    sx={{
                        width: "20%",
                        minWidth: { xs: "100%", md: "300px" },
                        height: "100%",
                        p: 3,
                        borderRadius: "6px",
                        // borderRight: `1px solid #bdbec7`,
                        px: 1,
                        display: { xs: "none", md: "block" },
                    }}
                >
                    <Typography
                        sx={{ fontSize: "18px", px: 2, fontWeight: "bolder" }}
                        variant="body"
                    >
                        Hello <span> {customerData.username} ✋</span>
                    </Typography>
                    <Typography sx={{ fontSize: "16px", px: 2 }} variant="body">
                        {customerData.email}
                    </Typography>
                    <Divider sx={{ m: "10px", width: "90%" }} />
                    <Box>
                        {CustomerMenuItems.map((item, index) => (
                            <a
                                key={index}
                                href={item.url}
                                style={{
                                    textDecoration: "none",
                                    color: "inherit",
                                }}
                                onClick={item.action}
                            >
                                <MenuItem
                                    // onClick={handleClose}
                                    sx={{
                                        minWidth: { xs: "380px", sm: "100%" },
                                        py: 2,
                                        border: `1px solid ${
                                            item.title == "Profile"
                                                ? theme.palette.neutral.main
                                                : "inherit"
                                        }`,
                                        borderRadius: "6px",
                                    }}
                                >
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    {item.title}
                                </MenuItem>
                            </a>
                        ))}
                    </Box>
                </Stack>
                <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ display: { xs: "none", md: "block" } }}
                />

                <Stack
                    sx={{
                        width: { xs: "100%", md: "80%" },
                        p: 5,
                        // bgcolor: "black",
                        flexGrow: 1,
                        borderRadius: "6px",
                    }}
                >
                    <Typography variant="h5">Profile Info</Typography>
                    <Box
                        component="form"
                        noValidate
                        // onSubmit={handleSubmit}
                        sx={{ mt: 3 }}
                    >
                        <Grid container spacing={2}>
                            <TextFieldComponent
                                value={formData.firstname}
                                setFormData={handelFormData}
                                label="First Name"
                                id="firstname"
                                type="text"
                                colWidth={6}
                                keyName="firstname"
                            />
                            <TextFieldComponent
                                value={formData.lastname}
                                setFormData={handelFormData}
                                label="Last Name"
                                id="lastname"
                                type="text"
                                colWidth={6}
                                keyName="lastname"
                            />
                            <TextFieldComponent
                                value={formData.username}
                                setFormData={handelFormData}
                                label="Username"
                                id="username"
                                type="text"
                                colWidth={6}
                                keyName="username"
                            />
                            <TextFieldComponent
                                value={formData.email}
                                setFormData={handelFormData}
                                label="Email Address"
                                id="email"
                                type="email"
                                colWidth={6}
                                keyName="email"
                            />

                            <TextFieldComponent
                                value={formData.phone}
                                setFormData={handelFormData}
                                label="Phone Number"
                                id="phone-number"
                                type="Phone Number"
                                colWidth={6}
                                keyName="phone"
                            />

                            {/* Gender */}
                            <Grid item xs={12} sm={6} mb={3}>
                                <Box
                                    sx={{
                                        gap: 3,
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: {
                                            xs: "space-between",
                                            md: "flex-start",
                                        },
                                    }}
                                >
                                    <label style={{ fontWeight: "bolder" }}>
                                        Gender
                                    </label>

                                    <ToggleButtonGroup
                                        value={formData.gender}
                                        exclusive
                                        onChange={handelGender}
                                        aria-label="gender"
                                        size="small"
                                        sx={{
                                            ".MuiToggleButtonGroup-grouped.Mui-selected":
                                                {
                                                    color: `${theme.palette.primary.main} !important`,
                                                    borderColor: `${theme.palette.primary.main} !important`,
                                                },
                                        }}
                                    >
                                        <ToggleButton
                                            value="male"
                                            aria-label="male-gender"
                                        >
                                            <Stack
                                                direction="row"
                                                alignItems={"center"}
                                            >
                                                <Man2RoundedIcon />
                                                Male
                                            </Stack>
                                        </ToggleButton>
                                        <ToggleButton
                                            value="female"
                                            aria-label="female-gender"
                                        >
                                            <Stack
                                                direction="row"
                                                alignItems={"center"}
                                            >
                                                <Woman2RoundedIcon />
                                                Female
                                            </Stack>
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>
                            </Grid>
                            {/*== Gender ==*/}
                        </Grid>
                        <Button
                            onClick={handleUpdateData}
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={!isDataChanged}
                            sx={{
                                mt: 3,
                                mb: 2,
                                fontWeight: "bolder",
                                width: { xs: "100%", md: "200px" },
                            }}
                        >
                            Update Profile
                        </Button>
                    </Box>
                </Stack>
            </Stack>
        </Container>
    );
};

export default ProfileComponent;
