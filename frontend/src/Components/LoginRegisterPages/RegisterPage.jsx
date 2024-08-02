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

//// Redux
import { useDispatch } from "react-redux";
import { registerACustomerReducer } from "../../redux/ApiCustomerSlice";

//// functions
function isPasswordsMatch(password = "", confirmPassword = "") {
    return password.trim() === confirmPassword.trim();
}

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
    height: "25px",
};

export default function RegisterPage() {
    const [confirmPassword, setConfirmPassword] = useState("Os123@.seto");
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();

    ///// TODO: clear these fields after finishing development
    const [formData, setFormData] = useState({
        username: "ahmedsayed",
        email: "AhmedSayed@gmail.com",
        password: "Os123@.seto",
        phone: "+0201234567890",
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

        //// invalid password checking
        if (formData.password == undefined || confirmPassword == undefined)
            return alert("Please enter both passwords");

        if (formData.password.trim().length < 8)
            return alert("Password must be at least 8 characters long");

        //// check if passwords match
        if (!isPasswordsMatch(formData.password, confirmPassword))
            return alert("Passwords do not match");

        // const data = new FormData(event.currentTarget);
        //// Send data to API
        dispatch(registerACustomerReducer(formData));
    };

    //// Todo : add validation using React Hook Form library
    //// Todo : add modal for messages

    if (
        localStorage.getItem("customerInfo") ||
        sessionStorage.getItem("customerInfo")
    ) {
        window.location.href = "/";
    } else {
        return (
            <Container
                component="main"
                maxWidth="sm"
                sx={{ boxShadow: 6, borderRadius: 3, p: 1, my: 1 }}
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
                        sx={{ mt: 3 }}
                    >
                        <Grid container spacing={2}>
                            {/* <Grid item xs={12} sm={6}>
                            <TextField
                                autoComplete="given-name"
                                name="firstname"
                                required
                                fullWidth
                                id="firstname"
                                label="First Name"
                                autoFocus
                                value={formData.firstname}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        firstname: e.target.value.trim(),
                                    })
                                }
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                id="lastname"
                                label="Last Name"
                                name="lastname"
                                autoComplete="family-name"
                                value={formData.lastname}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        lastname: e.target.value.trim(),
                                    })
                                }
                                size="small"
                            />
                        </Grid> */}

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
                                    type={showPassword ? "text" : "password"}
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
                                    type={showPassword ? "text" : "password"}
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
            </Container>
        );
    }
}
