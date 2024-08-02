import { Box, Button, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { TextField } from "@mui/material";

/// context
import { ColorModeContext } from "../../../Theme/theme";

///// hooks
import { useTheme } from "@emotion/react";
import { useState } from "react";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

/// redux
import { useDispatch } from "react-redux";
import { changePasswordReducer } from "../../../redux/ApiCustomerSlice";
import { deleteCustomerAccountReducer } from "../../../redux/ApiCustomerSlice";

const SettingsComponent = () => {
    const dispatch = useDispatch();
    const theme = useTheme(ColorModeContext);

    //// states
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    //// handlers
    const handleChangePassword = async (e) => {
        e.preventDefault();

        //// check if the new password is the same as the repeat new password
        if (
            formData.newPassword.trim() !== formData.confirmNewPassword.trim()
        ) {
            alert("New password and confirm new Password Fields do not match");
            return;
        }

        ///// min length
        if (formData.newPassword.trim().length < 8) {
            alert("New password must be at least 8 characters long");
            return;
        }
        // alert("password changed successfully");
        await dispatch(changePasswordReducer(formData));
    };

    const handleDeleteAccount = () => {
        //  take confirmation by using dialog

        const confirmation = window.confirm(
            "Are you sure you want to delete your account?"
        );
        if (confirmation) {
            dispatch(deleteCustomerAccountReducer());
        }
    };

    const handelFormData = (key, value) => {
        const updatedFormData = {
            ...formData,
            [key]: value,
        };
        setFormData(updatedFormData);
    };

    return (
        <Stack sx={{ minWidth: "67vw", height: "80vh" }}>
            <Box sx={{ mb: 2, px: 1 }}>
                <Typography
                    variant="h4"
                    sx={{
                        my: 1,
                        fontSize: { xs: "22px", md: "30px" },
                        fontWeight: "bolder",
                    }}
                >
                    Account Settings
                </Typography>
                <Typography variant="body" sx={{ my: 1, fontSize: "15px" }}>
                    Manage your account settings for a personalized experience.
                </Typography>
            </Box>

            <Box
                sx={{
                    px: { xs: 3, md: 2 },
                    py: 3,
                    bgcolor: theme.palette.natural.main,
                    borderRadius: "6px",
                    mb: 2,
                }}
            >
                <Typography variant="h6">Security</Typography>
                <Stack
                    component="form"
                    noValidate
                    direction={{ xs: "column", md: "row" }}
                    alignItems={"center"}
                    justifyContent={"flex-start"}
                    mt={2}
                    gap={3}
                >
                    <Grid item sx={{ width: { xs: "100%", md: "200px" } }}>
                        <TextField
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            value="************"
                            onChange={(e) => handelFormData(e)}
                            size="small"
                            disabled
                        />
                    </Grid>
                    <ChangePasswordDialog
                        handelFormData={handelFormData}
                        handleChangePassword={handleChangePassword}
                        formData={formData}
                    />
                </Stack>
            </Box>
            <Box
                sx={{
                    px: { xs: 3, md: 2 },
                    py: 3,
                    bgcolor: theme.palette.natural.main,
                    borderRadius: "6px",
                }}
            >
                <Typography variant="h6" mb={2}>
                    Account Deletion
                </Typography>
                <Button
                    onClick={() => handleDeleteAccount()}
                    color="error"
                    variant="contained"
                    sx={{
                        fontWeight: "bolder",
                        width: { xs: "100%", md: "200px" },
                        mb: 2,
                    }}
                >
                    Delete Account
                </Button>
                <Typography
                    variant="h6"
                    sx={{ fontSize: "15px", width: "100%" }}
                >
                    We are sad 😢 to see you go, but hope to see you again!
                </Typography>
            </Box>
        </Stack>
    );
};

export default SettingsComponent;
