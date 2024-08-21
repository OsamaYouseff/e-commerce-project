/* eslint-disable react/prop-types */
import { Container, Stack, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Button } from "@mui/material";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Man2RoundedIcon from "@mui/icons-material/Man2Rounded";
import Woman2RoundedIcon from "@mui/icons-material/Woman2Rounded";
import TextFieldComponent from "../../GenericComponents/TextFieldComponent/TextFieldComponent";
import toast from 'react-hot-toast';


/// context
import { ColorModeContext } from "../../../Theme/theme";

///// hooks
import { useTheme } from "@emotion/react";
import { useState } from "react";

/// redux
import { GetUserInfo, IsUserLoggedIn, CheckDuplicated } from "../../../General/GeneralFunctions";
import { updateCustomerAccountReducer } from "../../../redux/CustomerSlice/ApiCustomerSlice";
import { useDispatch } from "react-redux";

const ProfileComponent = ({ customerData }) => {
    const dispatch = useDispatch();
    const theme = useTheme(ColorModeContext);

    //// states
    const [formData, setFormData] = useState({
        firstname: customerData.firstname,
        lastname: customerData.lastname,
        username: customerData.username,
        email: customerData.email,
        phone: customerData.phone,
        gender: customerData.gender,
    });
    const [isDataChanged, setIsDataChanged] = useState(false);

    //// handlers
    const checkDataChanged = (formData) => {

        if (CheckDuplicated(formData, customerData)) setIsDataChanged(false);
        else setIsDataChanged(true);
    };

    const handleUpdateData = async (e) => {
        e.preventDefault();

        if (IsUserLoggedIn()) {
            await dispatch(updateCustomerAccountReducer(formData));
            setIsDataChanged(false);
            customerData = GetUserInfo();
        } else toast.error("Please log in or sign up with new account🙂");
    };

    const handelGender = (event, newValue) => {
        if (newValue !== null) {
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
        <Box
            className="flex-center"
            sx={{ flexGrow: 1, pt: 1, minHeight: "70vh" }}
        >
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
                    alignItems: "space-between",
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
        </Box>
    );
};

export default ProfileComponent;
