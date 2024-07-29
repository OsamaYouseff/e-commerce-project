/* eslint-disable react/prop-types */
import { Stack, Box, Typography } from "@mui/material";
import { ColorModeContext } from "../../Theme/theme";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const ItemComponent = ({ item, cartDataDispatch }) => {
    const theme = useTheme(ColorModeContext);

    function handleClickIncreaseDecrease(type, oldQuantity = item.quantity) {
        cartDataDispatch({
            type: type,
            payload: {
                id: item.id,
                quantity: oldQuantity,
                price: item.price,
            },
        });
    }
    return (
        <Stack
            key={item.id}
            direction="row"
            gap={2}
            justifyContent={"space-between"}
            sx={{
                p: 1.2,
                mb: 1,
                borderRadius: "5px",
                bgcolor: theme.palette.sectionBgColor.main,
                borderBottom: ` 1px solid ${theme.palette.footerBgColor.primary} `,
                boxShadow: 1,
            }}
        >
            <img
                style={{ maxWidth: "100px", borderRadius: "5px" }}
                src={item.imageURL}
                alt="cart-item"
            />
            <Box
                sx={{ display: "flex", flex: 1, flexDirection: "column" }}
                justifyContent={"space-between"}
            >
                <Stack direction="row" justifyContent={"space-between"}>
                    <Typography sx={{ fontSize: "18px" }}>
                        {item.title}
                    </Typography>
                    <Typography sx={{ fontWeight: "bolder", color: "#ff4450" }}>
                        ${item.price}
                    </Typography>
                </Stack>
                <Stack direction="row" gap={2} justifyContent={"space-between"}>
                    <Stack direction="row" gap={0.8} alignItems={"flex-end"}>
                        <IconButton
                            color="primary"
                            sx={{
                                width: "40px",
                                height: "25px",
                                border: ` 1px solid ${theme.palette.primary.main} `,
                                borderRadius: "6px",
                                fontSize: " 20px",
                                p: 0,
                                m: 0,
                                fontWeight: "bolder",
                            }}
                            variant="contained"
                            onClick={() =>
                                handleClickIncreaseDecrease("DECREASE_QUANTITY")
                            }
                        >
                            <RemoveIcon size="small" />
                        </IconButton>

                        <input
                            type="text"
                            value={item.quantity}
                            onChange={(e) => {
                                let value = e.target.value;
                                if (value <= 0) value = 1;

                                handleClickIncreaseDecrease(
                                    "CHANGE_QUANTITY",
                                    value
                                );
                            }}
                            style={{
                                width: "40px",
                                height: "25px",
                                fontSize: "18px",
                                fontWeight: "bold",
                                borderRadius: "5px",
                                border: `1px solid ${theme.palette.text.primary}`,
                                px: 2.5,
                                py: 0.3,
                                textAlign: "center",
                            }}
                        />

                        <IconButton
                            color="primary"
                            sx={{
                                width: "40px",
                                height: "25px",
                                border: ` 1px solid ${theme.palette.primary.main} `,
                                borderRadius: "6px",
                                fontSize: " 20px",
                                p: 0,
                                m: 0,
                                fontWeight: "bolder",
                            }}
                            variant="contained"
                            onClick={() =>
                                handleClickIncreaseDecrease("INCREASE_QUANTITY")
                            }
                        >
                            <AddIcon size="small" />
                        </IconButton>
                    </Stack>

                    <IconButton
                        onClick={() =>
                            cartDataDispatch({
                                type: "REMOVE_FROM_CART",
                                payload: { id: item.id },
                            })
                        }
                        sx={{
                            border: `1px solid  ${theme.palette.text.primary}`,
                            aspectRatio: "1 / 1",
                            "&:hover": {
                                color: "#ff4450",
                                borderColor: "#ff4450",
                            },
                            p: 0.6,
                        }}
                        aria-label="delete"
                        size="small"
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Box>
        </Stack>
    );
};
export default ItemComponent;
