/* eslint-disable react/prop-types */
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Dialog from "@mui/material/Dialog";
import { Button, Stack } from "@mui/material";

import { Fragment, useState } from "react";

export function ChangePasswordDialog({
    handelFormData,
    handleChangePassword,
    formData,
}) {
    const [open, setOpen] = useState(false);

    const handleChangeField = (key, value) => {
        handelFormData(key, value);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    return (
        <Fragment>
            <Button
                variant="contained"
                onClick={handleClickOpen}
                sx={{
                    fontWeight: "bolder",
                    width: { xs: "100%", md: "200px" },
                }}
            >
                CHANGE PASSWORD
            </Button>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="password-dialog-title"
                aria-describedby="password-dialog-description"
                fullWidth
            >
                <Stack
                    alignItems={"center"}
                    justifyContent={"space-between"}
                    sx={{
                        px: 2,
                        py: 4,
                        minWidth: { xs: "300px", md: "400px" },
                        maxWidth: "100%",
                        bgcolor: "sectionBgColor.main",
                    }}
                    spacing={4}
                >
                    <PasswordField
                        value={formData.currentPassword}
                        label="Current Password"
                        title="currentPassword"
                        handleClickShowPassword={handleClickShowPassword}
                        handleMouseDownPassword={handleMouseDownPassword}
                        showPassword={showPassword}
                        handleChangeField={handleChangeField}
                    />
                    <PasswordField
                        value={formData.newPassword}
                        label="New Password"
                        title="newPassword"
                        handleClickShowPassword={handleClickShowPassword}
                        handleMouseDownPassword={handleMouseDownPassword}
                        showPassword={showPassword}
                        handleChangeField={handleChangeField}
                    />
                    <PasswordField
                        value={formData.confirmNewPassword}
                        label="Repeat New Password"
                        title="confirmNewPassword"
                        handleClickShowPassword={handleClickShowPassword}
                        handleMouseDownPassword={handleMouseDownPassword}
                        showPassword={showPassword}
                        handleChangeField={handleChangeField}
                    />

                    <Button
                        variant="contained"
                        onClick={handleChangePassword}
                        // type="submit"
                        fullWidth
                        disabled={
                            formData.currentPassword.trim() === "" ||
                            formData.newPassword.trim() === "" ||
                            formData.confirmNewPassword.trim() === ""
                        }
                        sx={{
                            fontWeight: "bolder",
                            width: "100%",
                        }}
                    >
                        CHANGE PASSWORD
                    </Button>
                </Stack>
            </Dialog>
        </Fragment>
    );
}

const PasswordField = ({
    value,
    handleClickShowPassword,
    handleMouseDownPassword,
    showPassword,
    label,
    handleChangeField,
    title,
}) => {
    return (
        <FormControl sx={{ m: 1, width: "100%" }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">
                {label}
            </InputLabel>
            <OutlinedInput
                onChange={(e) => handleChangeField(title, e.target.value)}
                value={value}
                id="outlined-adornment-password"
                type={showPassword ? "text" : "password"}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                        >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                }
                label="Password"
            />
        </FormControl>
    );
};

export default ChangePasswordDialog;
