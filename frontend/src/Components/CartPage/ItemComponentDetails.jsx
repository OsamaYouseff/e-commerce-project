/* eslint-disable react/prop-types */
import { Stack, Box, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { ColorModeContext } from "../../Theme/theme";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const ItemComponentDetails = ({ key, item, cartDataDispatch }) => {
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
            key={key}
            direction="row"
            justifyContent={"space-between"}
            alignItems={"center"}
            sx={{
                p: 1.2,
                mb: 1,
                borderRadius: "5px",
                boxShadow: 1,
                gap: { xs: 2, sm: 1 },
            }}
        >
            <img
                style={{
                    maxWidth: "100px",
                    maxHeight: "100px",
                    borderRadius: "5px",
                }}
                src="./images/banner-17.jpg"
                alt="cart-item"
            />
            <Box
                sx={{ display: "flex", flex: 1, flexDirection: "column" }}
                justifyContent={"space-between"}
            >
                <Stack
                    direction="row"
                    justifyContent={"space-evenly"}
                    alignItems={"center"}
                    gap={1}
                    sx={{ height: "100%", flexWrap: "wrap" }}
                >
                    <Typography
                        sx={{
                            fontSize: "18px",
                            width: { xs: "100%", sm: "20%" },
                        }}
                    >
                        {item.title}
                    </Typography>
                    <Typography
                        sx={{
                            width: { xs: "100%", sm: "12%" },
                            fontWeight: "bold",
                        }}
                    >
                        ${item.price}
                    </Typography>
                    <Stack
                        direction="row"
                        gap={0.8}
                        alignItems={"flex-end"}
                        sx={{ width: { xs: "100%", sm: "35%" } }}
                    >
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

                                console.log(value);
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
                    <Stack
                        direction="row"
                        sx={{
                            fontSize: "18px",
                            fontWeight: "bolder",
                            width: { xs: "75%", sm: "13%" },
                            color: "#ff4450",
                        }}
                    >
                        <Typography
                            sx={{
                                display: { xs: "block", sm: "none" },
                                width: "40%",
                                fontWeight: "bolder",
                                fontSize: "inherit",
                            }}
                        >
                            Total :{" "}
                        </Typography>
                        ${item.quantity * item.price}
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
export default ItemComponentDetails;
