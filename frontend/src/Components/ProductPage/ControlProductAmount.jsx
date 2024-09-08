/* eslint-disable react/prop-types */
import { Box, Stack } from "@mui/material";
import { ColorModeContext } from "../../Theme/theme.jsx";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import toast from "react-hot-toast";


const ControlProductAmount = ({ fieldQuantity, setFieldQuantity, quantity, scale, maxRange }) => {
    const theme = useTheme(ColorModeContext);

    const buttonStyles = {
        width: "55px",
        height: "30px",
        border: ` .125rem solid ${theme.palette.primary.main} `,
        borderRadius: ".375rem",
        fontSize: " 1.25rem",
        p: 1,
        m: 0,
        fontWeight: "bolder",
    }

    return (
        <Box sx={{ maxWidth: "100%" }} >
            <Stack
                direction="row"
                gap={0.8}
                alignItems={"flex-end"}
                justifyContent={"center"}
                sx={{ transform: scale == 1 ? "" : { xs: "translateX(-1.5625rem)", sm: "translateX(-0.9375rem)", md: "translateX(-0.75rem)" } }}
            >
                <IconButton
                    color="primary"
                    sx={buttonStyles}
                    variant="contained"
                    aria-label="decrease quantity"
                    onClick={() => {
                        if (quantity <= 1) return;
                        setFieldQuantity(fieldQuantity - 1);
                    }}
                >
                    <RemoveIcon size="small" />
                </IconButton>

                <input
                    type="text"
                    value={fieldQuantity}
                    onChange={(e) => {
                        let value = e.target.value;
                        if (value <= 0) return setFieldQuantity(1);
                        else if (value > maxRange) {
                            toast.error("There are only " + maxRange + " items in stock");
                            return setFieldQuantity(maxRange);
                        }
                        else
                            return setFieldQuantity(value);
                    }}
                    aria-label="change quantity"

                    onBlur={(e) => {
                        let value = e.target.value;
                        if (value <= 0 || value > maxRange) value = 1;
                    }}
                    style={{
                        width: "55px",
                        height: "30px",
                        fontSize: "1.375rem",
                        fontWeight: "bold",
                        borderRadius: ".3125rem",
                        border: `.0625rem solid ${theme.palette.text.primary}`,
                        px: 2.5,
                        py: 0.3,
                        textAlign: "center",
                        background: theme.palette.sectionBgColor.main,
                        color: theme.palette.text.primary,
                    }}
                />

                <IconButton
                    color="primary"
                    sx={buttonStyles}
                    variant="contained"
                    aria-label="increase quantity"
                    onClick={() => {
                        if (fieldQuantity < maxRange) {
                            setFieldQuantity(fieldQuantity + 1);
                        } else
                            toast.error("There are only " + maxRange + " items in stock");
                    }}
                >
                    <AddIcon size="small" />
                </IconButton>
            </Stack>
        </Box >


    )
}


export default ControlProductAmount;