/* eslint-disable react/prop-types */
import { Stack } from "@mui/material";
import { ColorModeContext } from "../../../Theme/theme.jsx";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";


const ControlProductAmount = ({ fieldQuantity, setFieldQuantity, handleClickIncreaseDecrease, quantity, maxRange }) => {
    const theme = useTheme(ColorModeContext);

    const buttonStyles = {
        width: "2.8125rem",
        height: "1.5625rem",
        border: ` .125rem solid ${theme.palette.primary.main} `,
        borderRadius: ".375rem",
        fontSize: " 1.25rem",
        p: 1,
        m: 0,
        fontWeight: "bolder",
    }

    return (
        <Stack className="flex-center" gap={1}>
            <IconButton
                color="primary"
                sx={buttonStyles}
                variant="contained"
                aria-label="decrease quantity"
                onClick={() => {
                    if (quantity <= 1) return;
                    setFieldQuantity(fieldQuantity - 1);
                    handleClickIncreaseDecrease("DECREASE_QUANTITY");
                }}
            >
                <RemoveIcon size="small" />
            </IconButton>

            <input
                type="text"
                value={fieldQuantity}
                onChange={(e) => {
                    let value = e.target.value;
                    if (value <= 0 || value > maxRange) value = 1;
                    setFieldQuantity(value);
                }}
                aria-label="change quantity"

                onBlur={(e) => {
                    let value = e.target.value;
                    if (value <= 0 || value > maxRange) value = 1;
                    handleClickIncreaseDecrease("CHANGE_QUANTITY", value);
                }}
                style={{
                    width: "3.125rem",
                    height: "1.5625rem",
                    fontSize: "1.25rem",
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
                    setFieldQuantity(fieldQuantity + 1);
                    handleClickIncreaseDecrease("INCREASE_QUANTITY");
                }}
            >
                <AddIcon size="small" />
            </IconButton>
        </Stack>
    )
}


export default ControlProductAmount;