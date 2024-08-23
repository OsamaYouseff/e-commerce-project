/* eslint-disable react/prop-types */
import { Stack, Box, Typography } from "@mui/material";
import { ColorModeContext } from "../Theme/theme.jsx";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import toast from 'react-hot-toast';


///// redux
import { useDispatch, useSelector } from "react-redux";
import { addUpdateProductInCartReducer, removeProductFromCartReducer } from "../redux/CartSlice/ApiCartSlice.js";
import { IsUserLoggedIn } from "../General/GeneralFunctions.js";
import { useState } from "react";

const ItemComponentDetails = ({ item, quantity }) => {
    const theme = useTheme(ColorModeContext);

    //// state
    const [filedQuantity, setFiledQuantity] = useState(quantity);

    //// redux
    const dispatch = useDispatch();
    const isLoading = useSelector((state) => state.CartApiRequest.isLoading);

    //// handlers
    function handleClickIncreaseDecrease(type, targetQuantity = quantity) {
        if (!IsUserLoggedIn()) {
            toast.error("Please log in or sign up with new account to do this action🙂");
            return;
        }

        if (isLoading) return; //// prevent user form doing many requests at the same time

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
        if (!IsUserLoggedIn() || isLoading) {
            toast.error("Please log in or sign up with new account to do this action🙂");
            return;
        } else {
            if (isLoading) return; //// prevent user form doing many requests at the same time

            dispatch(
                removeProductFromCartReducer({
                    productId: item._id,
                    price: item.price,
                })
            );
        }
    }

    if (item == undefined) {
        return <></>;
    } else {
        return (
            <Stack
                key={item._id}
                direction="row"
                justifyContent={"space-between"}
                alignItems={"center"}
                sx={{
                    p: 1.2,
                    mb: 1,
                    borderRadius: ".3125rem",
                    boxShadow: 1,
                    gap: { xs: 2, sm: 1 },
                }}
            >
                <Box
                    className="flex-center"
                    sx={{
                        width: "6.25rem",
                        maxHeight: "6.25rem",
                    }}
                >
                    <img
                        style={{
                            maxWidth: "6.25rem",
                            maxHeight: "6.25rem",
                            borderRadius: ".3125rem",
                        }}
                        src={item.img}
                        alt="cart-item"
                    />
                </Box>
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
                                fontSize: "1.125rem",
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
                                    width: "2.5rem",
                                    height: "1.5625rem",
                                    border: ` .0625rem solid ${theme.palette.primary.main} `,
                                    borderRadius: ".375rem",
                                    fontSize: " 1.25rem",
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
                                value={filedQuantity}
                                onChange={(e) => {
                                    let value = e.target.value;
                                    if (value <= 0) value = 1;
                                    setFiledQuantity(value);
                                }}
                                onBlur={(e) => {
                                    let value = e.target.value;
                                    if (value <= 0) value = 1;
                                    handleClickIncreaseDecrease(
                                        "CHANGE_QUANTITY",
                                        value
                                    );
                                }}
                                style={{
                                    width: "2.5rem",
                                    height: "1.5625rem",
                                    fontSize: "1.125rem",
                                    fontWeight: "bold",
                                    borderRadius: ".3125rem",
                                    border: `.0625rem solid ${theme.palette.text.primary}`,
                                    px: 2.5,
                                    py: 0.3,
                                    textAlign: "center",
                                }}
                            />

                            <IconButton
                                color="primary"
                                sx={{
                                    width: "2.5rem",
                                    height: "1.5625rem",
                                    border: ` .0625rem solid ${theme.palette.primary.main} `,
                                    borderRadius: ".375rem",
                                    fontSize: " 1.25rem",
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
                        <Stack
                            direction="row"
                            sx={{
                                fontSize: "1.125rem",
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
                            ${(quantity * item.price).toFixed(2)}
                        </Stack>
                        <IconButton
                            onClick={() => handleClickDelete()}
                            sx={{
                                border: `.0625rem solid  ${theme.palette.text.primary}`,
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
export default ItemComponentDetails;
