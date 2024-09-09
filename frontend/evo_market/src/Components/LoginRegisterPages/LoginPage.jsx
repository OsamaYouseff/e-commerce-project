///// MUI Components
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import toast from 'react-hot-toast';

///// Custom Hooks
import { useState } from "react";

///// Redux
import { useDispatch } from "react-redux";

///// Redux Actions
import { customerLoginReducer } from "../../redux/CustomerSlice/ApiCustomerSlice";
import { IsUserLoggedIn } from "../../General/GeneralFunctions.js";
import { GoHome, PrintErrors, ValidateLoginForm } from "../../../../shared_files/General/GeneralFunctions.js";

//// styles
const eyeStyles = {
    cursor: "pointer",
    position: "absolute",
    right: "-0%",
    top: "58%",
    transform: "translate(-50%,-50%)",
    zIndex: 10,
    color: "white",
    borderRadius: "50%",
    height: "25px",
};

export default function LoginPage() {
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        // username: "sama",
        // password: "Os123@.seto2",
        username: "",
        password: "",
        rememberMe: false,
    });
    const [showPassword, setShowPassword] = useState(true);


    const handleSubmit = (event) => {
        event.preventDefault();

        let errors = ValidateLoginForm(formData);

        if (Object.keys(errors.errors).length > 0) {
            let errorMessage = PrintErrors(errors.errors);
            toast.error(errorMessage)
            return;
        }

        if (!IsUserLoggedIn()) dispatch(customerLoginReducer(formData));
        else {
            toast.error("You are already logged in");
            setTimeout(() => { GoHome(); }, 1500)
        }
    };

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

    //// prevent user from accessing login page if he is already logged in
    if (IsUserLoggedIn()) {
        GoHome();
    } else {
        return (
            <Container
                component="main"
                maxWidth="sm"
                sx={{ boxShadow: 6, borderRadius: 3, p: { xs: 2, md: 4 } }}
            >
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        noValidate
                        sx={{ mt: 1, width: "100%" }}
                    >
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            size="small"
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    username: e.target.value.trim(),
                                })
                            }
                        />
                        <Grid item xs={12} sx={{ position: "relative" }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type={showPassword ? "password" : "text"}
                                id="password"
                                autoComplete="current-password"
                                size="small"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value.trim(),
                                    })
                                }
                            />
                            {handlePasswordVisibility(
                                showPassword,
                                setShowPassword
                            )}
                        </Grid>
                        <FormControlLabel
                            control={
                                <Checkbox value="remember" color="primary" />
                            }
                            label="Remember me"
                            checked={formData.rememberMe}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    rememberMe: e.target.checked,
                                })
                            }
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, fontWeight: "bolder" }}
                        >
                            Sign In
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
                        <Grid container>
                            {/* <Grid item xs>
                                <Link
                                    href="#"
                                    variant="body2"
                                    sx={{ fontWeight: "bolder" }}
                                >
                                    Forgot password?
                                </Link>
                            </Grid> */}
                            <Grid item>
                                <Link
                                    href="/register"
                                    variant="body2"
                                    sx={{ fontWeight: "bolder" }}
                                >
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        );
    }
}
