/* eslint-disable react/prop-types */
import { Box, Stack } from "@mui/material";
import { ColorModeContext } from "../../../Theme/theme.jsx";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";





const ControlProductAmount = ({ fieldQuantity, setFieldQuantity, handleClickIncreaseDecrease, quantity, scale = ".8" }) => {
    const theme = useTheme(ColorModeContext);

    const buttonStyles = {
        width: "70px",
        height: "35px",
        border: ` 2px solid ${theme.palette.primary.main} `,
        borderRadius: "6px",
        fontSize: " 20px",
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
                sx={{ scale: scale, transform: scale == 1 ? "" : { xs: "translateX(-25px)", sm: "translateX(-15px)", md: "translateX(-12px)" } }}
            >
                <IconButton
                    color="primary"
                    sx={buttonStyles}
                    variant="contained"
                    aria-label="decrease quantity"
                    onClick={() => {
                        if (quantity <= 1) return;
                        setFieldQuantity(fieldQuantity - 1);
                        handleClickIncreaseDecrease(
                            "DECREASE_QUANTITY"
                        );
                    }}
                >
                    <RemoveIcon size="small" />
                </IconButton>

                <input
                    type="text"
                    value={fieldQuantity}
                    onChange={(e) => {
                        let value = e.target.value;
                        if (value <= 0) value = 1;
                        setFieldQuantity(value);
                    }}
                    aria-label="change quantity"

                    onBlur={(e) => {
                        let value = e.target.value;
                        if (value <= 0) value = 1;
                        handleClickIncreaseDecrease(
                            "CHANGE_QUANTITY",
                            value
                        );
                    }}
                    style={{
                        width: "60px",
                        height: "35px",
                        fontSize: "22px",
                        fontWeight: "bold",
                        borderRadius: "5px",
                        border: `1px solid ${theme.palette.text.primary}`,
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
                        setFieldQuantity(fieldQuantity + 1);
                        handleClickIncreaseDecrease(
                            "INCREASE_QUANTITY"
                        );
                    }}
                >
                    <AddIcon size="small" />
                </IconButton>
            </Stack>
        </Box >


    )
}


export default ControlProductAmount;