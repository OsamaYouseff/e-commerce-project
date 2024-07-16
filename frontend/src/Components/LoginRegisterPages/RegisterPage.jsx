import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useState } from 'react';


//// Reducers
import ConnectWithApi from "../../Reducers/ApiReducer";


function isPasswordsMatch(password, confirmPassword) {
    return password.trim() === confirmPassword.trim();
}


export default function RegisterPage() {



    const [confirmPassword, setConfirmPassword] = useState('');
    const [formData, setFormData] = useState({
        FirstName: '',
        LastName: '',
        Email: '',
        Password: '',
        PhoneNumber: '',
    })

    const handleSubmit = (event) => {
        event.preventDefault();

        //// check if passwords match
        if (!isPasswordsMatch(formData.password, confirmPassword)) return alert('Passwords do not match');

        // const data = new FormData(event.currentTarget);

        // console.log(formData);

        //// Send data to API
        ConnectWithApi("RegisterCustomer", formData);

        //// get token from API


        ///// store token in local storage


        ///// redirect to home page


    };


    //// Todo : add validation using React Hook Form library
    //// Todo : add modal for messages


    return (

        <Container component="main" maxWidth="sm" sx={{ boxShadow: 6, borderRadius: 3, p: 1, my: 1 }}>
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 1,
                    marginBottom: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign up
                </Typography>
                <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                autoComplete="given-name"
                                name="firstName"
                                required
                                fullWidth
                                id="firstName"
                                label="First Name"
                                autoFocus
                                value={formData.FirstName}
                                onChange={(e) => setFormData({ ...formData, FirstName: e.target.value.trim() })}
                                size='small'
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                id="lastName"
                                label="Last Name"
                                name="lastName"
                                autoComplete="family-name"
                                value={formData.LastName}
                                onChange={(e) => setFormData({ ...formData, LastName: e.target.value.trim() })}
                                size='small'

                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                type='email'
                                autoComplete="email"
                                value={formData.Email}
                                onChange={(e) => setFormData({ ...formData, Email: e.target.value.trim() })}
                                size='small'

                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="password"
                                label="Password"
                                name="password"
                                autoComplete="new-password"
                                value={formData.Password}
                                onChange={(e) => setFormData({ ...formData, Password: e.target.value.trim() })}
                                size='small'

                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="password"
                                label="Confirm Password"
                                name="password"
                                autoComplete="confirm-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value.trim())}
                                size='small'
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                name="phone-number"
                                label="phone number"
                                type="phone number"
                                id="phone-number"
                                autoComplete="phone-number"
                                value={formData.PhoneNumber}
                                onChange={(e) => setFormData({ ...formData, PhoneNumber: e.target.value.trim() })}
                                size='small'

                            />
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, fontWeight: "bolder" }}
                    >
                        Sign Up
                    </Button>
                    <Link href="/" className='flex-center' sx={{ width: "100%", textDecoration: "none", mb: 3 }}>
                        <Button variant='contained' color="secondary" sx={{ width: "100%", fontWeight: "bolder" }}>Back To Shopping</Button>
                    </Link>
                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <Link href="/login" variant="body2" sx={{ cursor: "pointer", fontWeight: "bold" }}>
                                Already have an account? Sign in
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
}