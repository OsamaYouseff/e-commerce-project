import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useState } from "react";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import TextFieldComponent from "../GenericComponents/TextFieldComponent/TextFieldComponent";

import { toast } from "react-hot-toast";

//// Redux
import { useDispatch } from "react-redux";
import { registerACustomerReducer } from "../../redux/CustomerSlice/ApiCustomerSlice";
import { GoHome, IsUserLoggedIn, ValidateSignUpForm, PrintErrors } from "../../General/GeneralFunctions";

//// functions
function handlePasswordVisibility(showPassword, setShowPassword) {
    return showPassword ? (
        <RemoveRedEyeIcon
            sx={eyeStyles}
            onClick={() => setShowPassword(!showPassword)}
        />
    ) : (
        <VisibilityOffIcon
            sx={eyeStyles}
            onClick={() => setShowPassword(!showPassword)}
        />
    );
}

//// styles
const eyeStyles = {
    cursor: "pointer",
    position: "absolute",
    right: "-0%",
    top: "65%",
    transform: "translate(-50%,-50%)",
    zIndex: 10,
    color: "white",
    borderRadius: "50%",
    height: "1.5625rem",
};

export default function RegisterPage() {
    const [confirmPassword, setConfirmPassword] = useState("Os123@.seto");
    const [showPassword, setShowPassword] = useState(true);

    const dispatch = useDispatch();

    ///// TODO: clear these fields after finishing development
    const [formData, setFormData] = useState({
        // username: "ahmedsayed",
        // email: "AhmedSayed@gmail.com",
        // password: "Os123@.seto",
        // phone: "+0201234567890",
        username: "",
        email: "",
        password: "",
        phone: "",
    });

    const handelFormData = (key, value) => {
        const updatedFormData = {
            ...formData,
            [key]: value,
        };
        setFormData(updatedFormData);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        let errors = ValidateSignUpForm(formData, confirmPassword);

        if (Object.keys(errors.errors).length > 0) {
            let errorMessage = PrintErrors(errors.errors);
            toast.error(errorMessage)
            return;
        }
        if (!IsUserLoggedIn()) dispatch(registerACustomerReducer(formData));
        else toast.error("You are already logged in");
    };

    //// Todo : add modal for messages

    if (IsUserLoggedIn()) {
        GoHome();
    } else {
        return (
            <Container
                component="main"
                maxWidth="sm"
                sx={{ boxShadow: 6, borderRadius: 3, p: { xs: 2, md: 4 }, my: 1 }}
            >
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 1,
                        marginBottom: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign up
                    </Typography>
                    <Box
                        component="form"
                        noValidate
                        onSubmit={handleSubmit}
                        sx={{ mt: 3, width: "100%" }}
                    >
                        <Grid container spacing={2}>
                            <TextFieldComponent
                                value={formData.username}
                                setFormData={handelFormData}
                                label="Username"
                                id="username"
                                type="text"
                                colWidth={12}
                                keyName="username"
                                mb={1}
                            />
                            <TextFieldComponent
                                value={formData.email}
                                setFormData={handelFormData}
                                label="Email Address"
                                id="email"
                                type="email"
                                colWidth={12}
                                keyName="email"
                                mb={1}
                            />
                            <Grid item xs={12} sx={{ position: "relative" }}>
                                <TextField
                                    required
                                    fullWidth
                                    type={showPassword ? "password" : "text"}
                                    id="password"
                                    label="Password"
                                    name="password"
                                    autoComplete="new-password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password: e.target.value.trim(),
                                        })
                                    }
                                    size="small"
                                />
                                {handlePasswordVisibility(
                                    showPassword,
                                    setShowPassword
                                )}
                            </Grid>
                            <Grid item xs={12} sx={{ position: "relative" }}>
                                <TextField
                                    required
                                    fullWidth
                                    id="password"
                                    type={showPassword ? "password" : "text"}
                                    label="Confirm Password"
                                    name="password"
                                    autoComplete="confirm-password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(
                                            e.target.value.trim()
                                        )
                                    }
                                    size="small"
                                />
                                {handlePasswordVisibility(
                                    showPassword,
                                    setShowPassword
                                )}
                            </Grid>
                            <TextFieldComponent
                                value={formData.phone}
                                setFormData={handelFormData}
                                label="Phone Number"
                                id="phone-number"
                                type="Phone Number"
                                colWidth={12}
                                keyName="phone"
                                mb={1}
                            />
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, fontWeight: "bolder" }}
                        >
                            Sign Up
                        </Button>
                        <Link
                            href="/"
                            className="flex-center go-home"
                            sx={{
                                width: "100%",
                                textDecoration: "none",
                                mb: 3,
                            }}
                        >
                            <Button
                                variant="contained"
                                color="secondary"
                                sx={{ width: "100%", fontWeight: "bolder" }}
                            >
                                Back To Shopping
                            </Button>
                        </Link>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link
                                    href="/login"
                                    variant="body2"
                                    sx={{
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Already have an account? Sign in
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container >
        );
    }
}
