/* eslint-disable no-unused-vars */
import { Box, Stack, TextField, Typography } from "@mui/material";

/* eslint-disable react/prop-types */
import Grid from "@mui/material/Grid";
import TextFieldComponent from "../../GenericComponents/TextFieldComponent/TextFieldComponent";
import FormControl from "@mui/material/FormControl";
import Divider from "@mui/material/Divider";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import SwitchButton from "../../GenericComponents/SwitchButton/SwitchButton";

const FormAddressComponent = ({
    formData,
    phoneCode,
    handelFormData,
    children,
}) => {
    return (
        <Stack
            sx={{
                gap: 2,
                mb: 2,
                width: "100%",
                overflowY: "auto",
                // maxHeight: { xs: "auto", md: "70vh", lg: "60vh" },
                flexDirection: { xs: "column", md: "row" },
                alignItems: "flex-start",
                justifyContent: "center",
            }}
        >
            {/* Location info */}
            <Box
                component="form"
                noValidate
                sx={{
                    flexGrow: 1,
                    width: { xs: "100%", md: "50%" },
                    maxWidth: { xs: "100%", md: "50%" },
                    overflowX: "hidden",
                }}
            >
                <Typography variant="h6" mb={2}>
                    Location details
                </Typography>

                {children}

                <Grid mt={1} container spacing={2}>
                    {/* TODO add regex pattern for this filed */}
                    <TextFieldComponent
                        value={formData.fullAddress}
                        setFormData={handelFormData}
                        label="Full Address"
                        id="fullAddress"
                        type="text"
                        colWidth={12}
                        keyName="fullAddress"
                        placeholder="[City]-[Street Name]-[building Number]"
                    />
                </Grid>

                <FormControl sx={{ mb: 1 }}>
                    <FormLabel id="row-radio">
                        Address label (optional)
                    </FormLabel>
                    <RadioGroup
                        value={formData.label}
                        row
                        aria-labelledby="row-radio"
                        name="row-radio-buttons-group"
                        sx={{ pl: 2 }}
                    >
                        <FormControlLabel
                            value="Home"
                            control={<Radio />}
                            label="Home"
                            onClick={() => handelFormData("label", "Home")}
                        />
                        <FormControlLabel
                            value="Work"
                            control={<Radio />}
                            label="Work"
                            onClick={() => handelFormData("label", "Work")}
                        />
                    </RadioGroup>
                </FormControl>

                <FormControlLabel
                    sx={{ display: "block" }}
                    control={
                        <SwitchButton
                            defaultChecked={formData.isDefault}
                            sx={{ mr: 1 }}
                        />
                    }
                    onClick={() =>
                        handelFormData("isDefault", !formData.isDefault)
                    }
                    labelPlacement="start"
                    label="Set as default address"
                    // disabled
                    value={formData.isDefault}
                />
            </Box>
            {/*== Location info ==*/}

            <Divider orientation="vertical" flexItem>
                <Divider orientation="horizontal" flexItem></Divider>
            </Divider>

            {/* contact details */}
            <Box
                component="form"
                noValidate
                sx={{
                    maxWidth: { xs: "100%", md: "50%" },
                    width: { xs: "100%", md: "50%" },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    minHeight: "100%",
                }}
            >
                <Typography variant="h6" mb={2}>
                    Your contact details
                </Typography>

                <Stack
                    className="flex-between"
                    sx={{
                        justifyContent: "space-between",
                        width: "100%",
                        gap: 2,
                    }}
                >
                    <TextField
                        size="small"
                        sx={{
                            maxWidth: 90,
                            mb: 3,
                            input: {
                                textAlign: "center",
                            },
                        }}
                        value={`+ ${phoneCode}`}
                        disabled
                        mb={3}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                        <TextFieldComponent
                            value={formData.phoneNumber}
                            setFormData={handelFormData}
                            label="phone Number"
                            id="phoneNumber"
                            type="text"
                            colWidth={12}
                            keyName="phoneNumber"
                        />
                    </Box>
                </Stack>
                <Grid container>
                    <TextFieldComponent
                        value={formData.firstName}
                        setFormData={handelFormData}
                        label="First Name"
                        id="firstname"
                        type="text"
                        colWidth={12}
                        keyName="firstname"
                    />
                    <TextFieldComponent
                        value={formData.lastName}
                        setFormData={handelFormData}
                        label="Last Name"
                        id="lastname"
                        type="text"
                        colWidth={12}
                        keyName="lastname"
                    />
                </Grid>
            </Box>
            {/*== contact details ==*/}
        </Stack>
    );
};
export default FormAddressComponent;
