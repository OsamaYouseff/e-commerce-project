/* eslint-disable react/prop-types */
import { Stack, Box, Typography } from "@mui/material";
import { ColorModeContext } from "../../Theme/theme";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

///// redux
import { useDispatch } from "react-redux";
import {
    addUpdateProductInCartReducer,
    removeProductFromCartReducer,
} from "../../redux/ApiCartSlice.js";

const ItemComponent = ({ item, quantity }) => {
    const theme = useTheme(ColorModeContext);

    const dispatch = useDispatch();

    function handleClickIncreaseDecrease(type, targetQuantity = quantity) {
        let targetProduct = {
            productId: item._id,
            quantity: targetQuantity,
            price: item.price,
        };
        if (type === "INCREASE_QUANTITY") {
            targetProduct.quantity += 1;
            dispatch(addUpdateProductInCartReducer(targetProduct));
        } else if (type === "CHANGE_QUANTITY") {
            targetProduct.quantity = targetQuantity;
            dispatch(addUpdateProductInCartReducer(targetProduct));
        } else {
            if (targetQuantity === 1) return;
            targetProduct.quantity -= 1;
            dispatch(addUpdateProductInCartReducer(targetProduct));
        }
    }

    function handleClickDelete() {
        dispatch(
            removeProductFromCartReducer({
                productId: item._id,
                price: item.price,
            })
        );
    }

    if (item == undefined) {
        return <></>;
    } else {
        return (
            <Stack
                key={item._id}
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
                <Box
                    className="flex-center"
                    sx={{
                        width: "100px",
                        maxHeight: "100%",
                    }}
                >
                    <img
                        style={{
                            maxWidth: "100%",
                            maxHeight: "90px",
                            borderRadius: "5px",
                        }}
                        src={item.img}
                        alt="cart-item"
                    />
                </Box>
                <Box
                    sx={{ display: "flex", flex: 1, flexDirection: "column" }}
                    justifyContent={"space-between"}
                >
                    <Stack direction="row" justifyContent={"space-between"}>
                        <Typography sx={{ fontSize: "16px" }}>
                            {item.title.slice(0, 20)}
                        </Typography>
                        <Typography
                            sx={{ fontWeight: "bolder", color: "#ff4450" }}
                        >
                            ${item.price}
                        </Typography>
                    </Stack>
                    <Stack
                        direction="row"
                        gap={2}
                        justifyContent={"space-between"}
                    >
                        <Stack
                            direction="row"
                            gap={0.8}
                            alignItems={"flex-end"}
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
                                onClick={() => {
                                    if (quantity <= 1) return;
                                    handleClickIncreaseDecrease(
                                        "DECREASE_QUANTITY"
                                    );
                                }}
                            >
                                <RemoveIcon size="small" />
                            </IconButton>

                            <input
                                type="text"
                                value={quantity}
                                onBlur={(e) => {
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
                                onClick={() => {
                                    handleClickIncreaseDecrease(
                                        "INCREASE_QUANTITY"
                                    );
                                }}
                            >
                                <AddIcon size="small" />
                            </IconButton>
                        </Stack>

                        <IconButton
                            onClick={() => handleClickDelete()}
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
    }
};
export default ItemComponent;
