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
        <Stack Stack direction="row" gap={1} justifyContent={"space-between"} sx={{
            p: 1.2, mb: 1,
            borderRadius: "5px",
            // bgcolor: theme.palette.sectionBgColor.main,
            // border: ` 1px solid #ddd`,
            boxShadow: 1,
        }} >
            <img style={{ maxWidth: "100px", borderRadius: "5px" }} src="./images/banner-17.jpg" alt="cart-item" />
            <Box sx={{ display: "flex", flex: 1, flexDirection: "column" }} justifyContent={"space-between"}>
                <Stack direction="row" justifyContent={"space-between"} alignItems={"center"} sx={{ height: "100%" }}>
                    <Typography sx={{ fontSize: "18px", width: "25%" }}>Cart item name </Typography>
                    <Typography sx={{ width: "10%" }}>$19.99 </Typography>
                    <Stack direction="row" gap={.8} alignItems={"flex-end"} sx={{ width: "25%" }}>
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
                    <Typography sx={{ fontSize: "18px", fontWeight: "bolder", width: "15%", color: "#ff4450" }}>$19.99 </Typography>
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