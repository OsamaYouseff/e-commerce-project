import { Stack, Box, Typography } from "@mui/material";
import { useState } from "react";
import { ColorModeContext } from "../../Theme/theme";
import { useTheme } from "@mui/material/styles";
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';


const ItemComponent = () => {
    const [quantity, setQuantity] = useState(1);
    const theme = useTheme(ColorModeContext);


    function handleClickIncreaseDecrease(type) {
        if (type === "increase") {
            setQuantity(quantity + 1);
        } else {
            if (quantity > 1) {
                setQuantity(quantity - 1);
            }
        }
    }
    return (
        <Stack Stack direction="row" gap={2} justifyContent={"space-between"} sx={{
            p: 1.2, mb: 1,
            borderRadius: "5px",
            bgcolor: theme.palette.sectionBgColor.main,
            borderBottom: ` 1px solid ${theme.palette.footerBgColor.primary} `,
            boxShadow: 1
        }} >
            <img style={{ maxWidth: "100px", borderRadius: "5px" }} src="./images/banner-17.jpg" alt="cart-item" />
            <Box sx={{ display: "flex", flex: 1, flexDirection: "column" }} justifyContent={"space-between"}>
                <Stack direction="row" justifyContent={"space-between"}>
                    <Typography sx={{ fontSize: "18px" }}>Cart item name </Typography>
                    <Typography sx={{ fontWeight: "bolder", color: "#ff4450" }}>$19.99 </Typography>
                </Stack>
                <Stack direction="row" gap={2} justifyContent={"space-between"}>
                    <Stack direction="row" gap={.8} alignItems={"flex-end"}>
                        <IconButton color="primary" sx={{
                            width: "40px", height: "25px",
                            border: ` 1px solid ${theme.palette.primary.main} `,
                            borderRadius: "6px", fontSize: " 20px", p: 0, m: 0,
                            fontWeight: "bolder"
                        }} variant="contained" onClick={() => handleClickIncreaseDecrease("decrease")}>
                            <RemoveIcon size="small" />
                        </IconButton>

                        <input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{
                            width: "40px", height: "25px", fontSize: "18px", fontWeight: "bold", borderRadius: "5px",
                            border: `1px solid ${theme.palette.text.primary}`, px: 2.5, py: .3,
                            textAlign: "center"
                        }} />

                        <IconButton color="primary" sx={{
                            width: "40px", height: "25px",
                            border: ` 1px solid ${theme.palette.primary.main} `,
                            borderRadius: "6px", fontSize: " 20px", p: 0,
                            m: 0, fontWeight: "bolder"
                        }} variant="contained" onClick={() => handleClickIncreaseDecrease("increase")}>
                            <AddIcon size="small" />
                        </IconButton>
                    </Stack>

                    <IconButton sx={{
                        border: `1px solid  ${theme.palette.text.primary}`,
                        aspectRatio: "1 / 1",
                        "&:hover": { color: "#ff4450", borderColor: "#ff4450" }, p: 0.6
                    }} aria-label="delete" size="small">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Box >
        </Stack >
    );
};
export default ItemComponent;   