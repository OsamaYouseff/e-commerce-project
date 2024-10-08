import { Box, Button, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { TextField } from "@mui/material";

//// custom Components
import toast from 'react-hot-toast';
import ConfirmComponent from "../../../../../shared_files/ConfirmComponent/ConfirmComponent.jsx"
import { ChangePasswordDialog } from "./ChangePasswordDialog";



//// hooks
import { useState } from "react";

/// redux
import { useDispatch } from "react-redux";
import { changePasswordReducer, deleteCustomerAccountReducer } from "../../../redux/CustomerSlice/ApiCustomerSlice";
import { IsUserLoggedIn } from "../../../General/GeneralFunctions.js";

const SettingsComponent = () => {
    const dispatch = useDispatch();

    //// states
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });



    //// Confirm Component
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const handleClickOpenConfirmDialog = () => setOpenConfirmDialog(true);
    const handleCloseConfirmDialog = () => setOpenConfirmDialog(false);




    //// handlers
    const handleChangePassword = async (e) => {
        e.preventDefault();

        //// check if the new password is the same as the repeat new password
        if (
            formData.newPassword.trim() !== formData.confirmNewPassword.trim()
        ) {
            toast.error("New password and confirm new Password Fields do not match");
            return;
        }

        ///// min length
        if (formData.newPassword.trim().length < 8) {
            toast.error("New password must be at least 8 characters long");
            return;
        }

        if (IsUserLoggedIn()) await dispatch(changePasswordReducer(formData));
        else toast.error("Please log in or sign up with new account🙂");
    };


    const confirmDeleteAccount = () => {
        if (IsUserLoggedIn()) dispatch(deleteCustomerAccountReducer());
        else toast.error("Please log in or sign up with new account🙂");
    };

    const handleDeleteAccount = () => {
        handleClickOpenConfirmDialog();
    };

    const handelFormData = (key, value) => {
        const updatedFormData = {
            ...formData,
            [key]: value,
        };
        setFormData(updatedFormData);
    };

    return (
        <Stack sx={{ minWidth: "67vw", height: "70vh" }}>


            <Box sx={{ mb: 2, px: 2 }}>
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
                    px: { xs: 3, md: 3 },
                    py: 3,
                    bgcolor: "natural.main",
                    borderRadius: "6px",
                    mb: 2,
                }}
            >
                <Typography variant="h3" sx={{ fontSize: "24px" }}>Security</Typography>
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
                    px: { xs: 3, md: 3 },
                    py: 3,
                    bgcolor: "natural.main",
                    borderRadius: "6px",
                }}
            >
                <Typography variant="h3" sx={{ fontSize: "24px" }} mb={2}>
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
                    variant="h3"
                    sx={{ fontSize: "15px", width: "100%" }}
                >
                    We are sad 😢 to see you go, but hope to see you again!
                </Typography>
            </Box>
            {
                openConfirmDialog && <ConfirmComponent
                    openConfirmDialog={openConfirmDialog}
                    confirmAction={confirmDeleteAccount}
                    handleCloseConfirmDialog={handleCloseConfirmDialog}
                    message="Are you sure you want to delete your account?"
                />
            }

        </Stack>
    );
};

export default SettingsComponent;
