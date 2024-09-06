/* eslint-disable react/prop-types */
import { Box, Stack, Typography } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
// import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import { motion, AnimatePresence } from "framer-motion";

/// Icons
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import RemoveRedEyeRoundedIcon from '@mui/icons-material/RemoveRedEyeRounded';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import ShoppingCartCheckoutRoundedIcon from '@mui/icons-material/ShoppingCartCheckoutRounded';


import { useDispatch } from "react-redux";
import { deleteProductReducer, toggleDisableProductReducer } from "../../redux/ProductSlice/ApiProductSlice";
import { IsUserLoggedIn } from "../../General/GeneralFunctions";
import toast from 'react-hot-toast';
import { useTheme } from "@emotion/react";
import { ColorModeContext } from "../../Theme/theme";
import { Link } from "react-router-dom";
import { useState } from "react";
import ConfirmComponent from "../GenericComponents/ConfirmComponent/ConfirmComponent";



const productButtonStyle = {
    fontSize: ".875rem", fontWeight: "bolder", p: .5, minWidth: "25px !important",
    borderRadius: "8px",
}

let operationType = "delete";
let enableMessage = "Are you sure you want to enable this product again?"
let disableMessage = "Are you sure you want to disable this product? i won't appear in your store."
let deleteMessage = "Are you sure you want to delete this product? you wont be able to undo this action."



const ProductCardComponent = ({ productData }) => {
    const dispatch = useDispatch();
    const theme = useTheme(ColorModeContext);

    let [modelText, setModelText] = useState({
        actionName: "",
        message: ""
    });

    const isDeleted = productData.isDeleted;

    //// Confirm Component
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const handleClickOpenConfirmDialog = () => setOpenConfirmDialog(true);
    const handleCloseConfirmDialog = () => setOpenConfirmDialog(false);

    const confirmChangeProductStatus = () => {


        if (IsUserLoggedIn()) {

            switch (operationType) {
                case "enable":
                    dispatch(toggleDisableProductReducer(productData._id));
                    break;
                case "disable":
                    dispatch(toggleDisableProductReducer(productData._id));
                    break;
                case "delete":
                    dispatch(deleteProductReducer(productData._id));
                    break;
                default:
                    break;
            }
        } else {
            toast.error("Your not authorized to do this action🙂");
            setTimeout(() => {
                GoLoginPage();
            }, 1000);
        }
    };

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
                sx={{
                    flexGrow: 1,
                    maxWidth: {
                        xs: "100%",
                        sm: "48%",
                        md: "32%",
                        lg: "24%",
                        xl: 275,
                    },
                    boxShadow: 3,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    opacity: isDeleted ? 0.35 : 1,

                }}
            >

                <Box
                    sx={{
                        backgroundImage: `url(${productData.img})`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "contain",
                        height: { xs: "14rem", md: "175px" },
                        width: "100%",
                        transition: "transform 0.35s ease-in-out",
                        "&:hover": { transform: "scale(1.03) " },
                    }}
                ></Box>
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
                    <Typography
                        gutterBottom
                        fontSize={"1.15rem"}
                        component="div"
                    >
                        {productData.title.slice(0, 20)}
                    </Typography>

                    <Stack
                        direction={"row"}
                        justifyContent={"space-between"}
                        alignItems={"center"}
                        mb={1}
                    >
                        <Typography
                            fontSize={"1rem"}
                            component="div"
                            sx={{ color: theme.palette.specialText2.main }}
                        >
                            ${productData.price}
                        </Typography>

                        <Rating
                            name="read-only"
                            value={productData.rating}
                            readOnly
                            size="small"
                            precision={0.5}
                        />
                    </Stack>
                    <Typography fontSize={"1rem"} color="text.secondary">
                        {productData.desc.slice(0, 60)}..
                    </Typography>
                </CardContent>
                <Stack
                    sx={{ p: 1.4, bgcolor: "inherit" }}
                    direction={"row"}
                    justifyContent={"space-between"}
                    alignItems={"center"}
                >
                    <Box className="flex-between" sx={{ gap: 1 }}>
                        <Link to={`/product/${productData._id}`}>
                            <Button
                                color="secondary"
                                size="small"
                                sx={productButtonStyle}
                                variant="contained"
                            >
                                <RemoveRedEyeRoundedIcon sx={{ fontSize: "1.25rem" }} />
                            </Button>
                        </Link>
                        <Button
                            size="small"
                            sx={productButtonStyle}
                            variant="contained"
                            onClick={() => {
                                document.location.href = `/edit-product/${productData._id}`
                            }}
                        >
                            <EditRoundedIcon sx={{ fontSize: "1.25rem" }} />
                        </Button>
                    </Box>
                    <Box className="flex-between" sx={{ gap: 1 }}>
                        <Button
                            color="warning"
                            size="small"
                            sx={productButtonStyle}
                            onClick={() => {
                                operationType = isDeleted ? "enable" : "disable";
                                setModelText({ actionName: isDeleted ? "Enable Product" : "Disable Product", message: isDeleted ? enableMessage : disableMessage })
                                handleClickOpenConfirmDialog()
                            }}
                            variant="contained"
                        >
                            {isDeleted ? <ShoppingCartCheckoutRoundedIcon sx={{ fontSize: "1.25rem" }} /> : <RemoveShoppingCartIcon sx={{ fontSize: "1.25rem" }} />}
                        </Button>
                        <Button
                            color="error"
                            size="small"
                            sx={productButtonStyle}
                            onClick={() => {
                                setModelText({ actionName: "Delete Product", message: deleteMessage })
                                operationType = "delete"
                                handleClickOpenConfirmDialog()
                            }}
                            variant="contained"
                            disabled={isDeleted}
                        >
                            <DeleteRoundedIcon sx={{ fontSize: "1.25rem" }} />
                        </Button>
                    </Box>


                </Stack>
                {
                    openConfirmDialog && <ConfirmComponent
                        openConfirmDialog={openConfirmDialog}
                        confirmAction={confirmChangeProductStatus}
                        handleCloseConfirmDialog={handleCloseConfirmDialog}
                        message={modelText?.message}
                        actionName={modelText?.actionName}
                    />
                }
            </Card>
        </AnimatePresence>
    );
};


export default ProductCardComponent;
