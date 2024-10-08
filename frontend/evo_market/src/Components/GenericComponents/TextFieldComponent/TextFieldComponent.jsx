/* eslint-disable react/prop-types */
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";

const TextFieldComponent = ({ value, setFormData, label, id, type, colWidth, keyName, mb = 3, placeholder = "", required = true }) => {
    function handelFormData(e) {
        setFormData(keyName, e.target.value);
    }

    return (
        <Grid item xs={12} sm={colWidth} mb={mb} >
            <TextField
                style={{ color: "red" }}
                required={required}
                fullWidth
                name={id}
                label={label}
                type={type}
                id={id}
                autoComplete={id}
                value={value == "null" ? "" : value}
                onChange={(e) => handelFormData(e)}
                size="small"
                placeholder={placeholder}
            />
        </Grid>
    );
};

export default TextFieldComponent;
