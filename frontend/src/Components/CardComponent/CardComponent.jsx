/* eslint-disable react/prop-types */
import { Stack, Typography } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import { motion, AnimatePresence } from "framer-motion";

/// Icons
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";

const CardComponent = ({
    productData,
    handelOpenModal,
    handleSetPreviewedProduct,
}) => {
    return (
        <AnimatePresence>
            <Card
                component={motion.section}
                layout
                initial={{ transform: "scale(0)" }}
                animate={{ transform: "scale(1)" }}
                exit={{ transform: "scale(0)" }}
                transition={{
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100,
                }}
                onClick={() => {
                    handleSetPreviewedProduct(productData);
                    handelOpenModal();
                }}
                sx={{
                    flexGrow: 1,
                    maxWidth: {
                        xs: "100%",
                        sm: "48%",
                        md: "32%",
                        lg: "24%",
                        xl: 300,
                    },
                    cursor: "pointer",
                    boxShadow: 3,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
            >
                <CardMedia
                    className="card-img"
                    component="img"
                    alt="green iguana"
                    height="245"
                    image={`${productData.img}`}
                    sx={{
                        boxShadow: 3,
                        cursor: "pointer",
                        flexGrow: 1,
                        transition: "transform 0.35s ease-in-out",
                        "&:hover": {
                            transform: "scale(1.05) rotate(2deg)",
                        },
                        maxHeight: "245px",
                    }}
                />
                <CardContent
                    sx={{
                        position: "relative",
                        zIndex: "100 !important",
                        bgcolor: "inherit",
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    <Stack
                        direction={"row"}
                        justifyContent={"space-between"}
                        alignItems={"center"}
                    >
                        <Typography
                            gutterBottom
                            fontSize={"18px"}
                            component="div"
                        >
                            {productData.title.slice(0, 20)}...
                        </Typography>
                        <Typography
                            gutterBottom
                            fontSize={"16px"}
                            component="div"
                            color={"crimson"}
                        >
                            ${productData.price}
                        </Typography>
                    </Stack>
                    <Typography fontSize={"16px"} color="text.secondary">
                        {productData.desc.slice(0, 120)}..
                    </Typography>
                </CardContent>
                <Stack
                    sx={{ p: 1.4, bgcolor: "inherit" }}
                    direction={"row"}
                    justifyContent={"space-between"}
                    alignItems={"center"}
                >
                    <Button
                        size="small"
                        sx={{ fontSize: "14px" }}
                        onClick={() => {
                            handleSetPreviewedProduct(productData);
                            handelOpenModal();
                        }}
                    >
                        <AddShoppingCartOutlinedIcon
                            sx={{ marginRight: "5px", fontSize: "20px" }}
                        />
                        Add To Cart
                    </Button>
                    <Rating
                        name="read-only"
                        value={productData.rating}
                        readOnly
                        size="small"
                        precision={0.5}
                    />
                </Stack>
            </Card>
        </AnimatePresence>
    );
};

export default CardComponent;
