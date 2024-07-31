/* eslint-disable react/prop-types */
import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../../Theme/theme";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { useState } from "react";
// import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

/// Icons
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";

///// redux
import { useDispatch } from "react-redux";
import { addUpdateProductInCartReducer } from "../../../redux/ApiCartSlice.js";

//// styles
const CloseBtnStyles = {
    position: "absolute",
    top: { xs: "5px", md: "15px" },
    right: { xs: "5px", md: "15px" },
    fontSize: "55px",
    width: "45px",
    height: "45px",
    cursor: "pointer",
    borderRadius: "50%",
    p: 1,
    "&:hover": {
        transform: "rotate(180deg)",
        color: "#ff6e6e",
        borderColor: "#ff6e6e",
    },
    transition: "0.35s",
};
const modalStyles = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    flexDirection: { xs: "column", md: "row" },
    gap: { xs: 1, md: 4 },
    justifyContent: { sx: "center", md: "space-between" },
};

// eslint-disable-next-line react/prop-types
const ProductDetails = ({ PreviewedProduct, handleCloseModal, open }) => {
    const theme = useTheme(ColorModeContext);
    const productImg = PreviewedProduct.img;
    const [selectedImg, setSelectedImg] = useState(0);
    const dispatch = useDispatch();

    // const [previewImgUrl, setPreviewImgUrl] = useState(`${productImg}`);
    const handleClickAddToCart = () => {
        dispatch(
            addUpdateProductInCartReducer({
                productId: PreviewedProduct._id,
                quantity: 1,
                price: PreviewedProduct.price,
            })
        );
    };

    const handelSelectedImg = (event, newValue) => {
        if (newValue !== null) {
            setSelectedImg(newValue);
        }
    };
    return (
        <Box>
            <Modal
                open={open}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                sx={{
                    ".MuiStack-root": {
                        width: { xs: "95%", md: "80%", lg: "70%", xl: "60%" },
                        maxHeight: { xs: "98%", md: "100%", lg: "1000px" },
                        // minHeight: "300px",
                        borderRadius: "10px",
                        border: "none",
                        bgcolor: theme.palette.categoryColor.main,
                    },
                }}
            >
                <Stack sx={modalStyles} direction={"row"} alignItems={"center"}>
                    <CloseRoundedIcon
                        color={theme.palette.text.primary}
                        sx={CloseBtnStyles}
                        onClick={handleCloseModal}
                    />
                    <Box
                        sx={{
                            padding: "0",
                            height: "300px",
                            maxWidth: { xs: 200, lg: "350px" },
                            minWidth: { xs: 200, lg: "320px" },
                            maxHeight: { xs: 200, lg: "320px" },
                            minHeight: { xs: 200, lg: "320px" },
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <img
                            style={{
                                maxWidth: "100%",
                                maxHeight: "100%",
                                borderRadius: "10px",
                            }}
                            src={productImg}
                            alt="product-img"
                        />
                    </Box>
                    <Box
                        sx={{
                            minHeight: "400px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "start",
                            justifyContent: "center",
                            gap: { xs: 0, md: 4, lg: 2 },
                            [theme.breakpoints.down("md")]: {
                                alignItems: "center",
                            },
                        }}
                    >
                        <Stack
                            sx={{
                                fontSize: { xs: "18px", lg: "18px" },
                                flexDirection: { xs: "row", md: "column" },
                                alignItems: { xs: "center", md: "start" },
                                justifyContent: "center",
                                gap: { xs: 2, md: 0 },
                                mb: { xs: 1, md: 0 },
                                minWidth: "100%",
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: "bold",
                                    fontSize: { xs: "20px", lg: "18px" },
                                }}
                            >
                                {PreviewedProduct.title.slice(0, 20)}
                            </Typography>
                            <Typography
                                my={0.4}
                                fontSize={"22px"}
                                color={"crimson"}
                                variant="h6"
                            >
                                ${PreviewedProduct.price}
                            </Typography>
                        </Stack>

                        <Typography
                            sx={{
                                fontSize: {
                                    xs: "16px",
                                    lg: "18px",
                                    textAlign: { xs: "justify", md: "left" },
                                },
                                maxWidth: { xs: "100%", lg: "100%" },
                            }}
                        >
                            {PreviewedProduct.desc}
                        </Typography>
                        <Stack
                            sx={{
                                justifyContent: { xs: "center", md: "left" },
                                overflow: "auto",
                                minWidth: { xs: "100%", md: "100%" },
                            }}
                            direction={"row"}
                            gap={1}
                            my={2}
                        >
                            <ToggleButtonGroup
                                value={selectedImg}
                                exclusive
                                onChange={handelSelectedImg}
                                sx={{
                                    ".Mui-selected": {
                                        opacity: "1",
                                        border: "1px solid #ff6e6e",
                                        background: "initial",
                                        borderRadius: "5px !important",
                                    },
                                }}
                            >
                                {/* {productImg.map((item, index) => {
                                    return (
                                        <ToggleButton
                                            value={index}
                                            key={item.id}
                                            sx={{
                                                display: "flex",
                                                p: 0,
                                                border: "1px solid transparent",
                                                "&:hover": {
                                                    borderColor: "#ff6e6e",
                                                },
                                                borderRadius: 1,
                                                cursor: "pointer",
                                                transition: "0.35s",
                                                overflow: "hidden",
                                                margin: "0 2px",
                                                opacity: 0.5,
                                                marginX: "5px",
                                            }}
                                        >
                                            <img
                                                height={100}
                                                width={90}
                                                src={item.url}
                                                alt="product-preview-img"
                                                onClick={() => {
                                                    setPreviewImgUrl(item.url);
                                                    setSelectedImg(index);
                                                }}
                                            />
                                        </ToggleButton>
                                    );
                                })} */}
                            </ToggleButtonGroup>
                        </Stack>
                        <Stack
                            sx={{
                                width: "100% !important",
                                flexDirection: { xs: "column", md: "row" },
                                gap: { xs: 1, md: 0 },
                            }}
                        >
                            <Button
                                sx={{
                                    textTransform: "capitalize",
                                    p: "5px 15px !important",
                                    bgcolor: "#ff6e6e",
                                    fontWeight: "bold",
                                }}
                                variant="contained"
                            >
                                <AddShoppingCartOutlinedIcon
                                    sx={{ mr: 1 }}
                                    fontSize="small"
                                />
                                Buy now
                            </Button>
                            <span
                                style={{
                                    display: "inline-block",
                                    width: "10px",
                                }}
                            >
                                {" "}
                            </span>
                            <Button
                                onClick={() => {
                                    handleClickAddToCart();
                                }}
                                sx={{
                                    mb: { xs: 1, md: 0 },
                                    textTransform: "capitalize",
                                    p: "5px 15px !important",
                                    fontWeight: "bold",
                                }}
                                color="secondary"
                                variant="contained"
                            >
                                <AddShoppingCartOutlinedIcon
                                    sx={{ mr: 1 }}
                                    fontSize="small"
                                />
                                Add To Cart
                            </Button>
                        </Stack>
                    </Box>
                </Stack>
            </Modal>
        </Box>
    );
};

export default ProductDetails;
