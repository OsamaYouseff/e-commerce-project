/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { Box, Container, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../Theme/theme";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { useParams } from "react-router-dom";

/// Icons
import Rating from "@mui/material/Rating";
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';


///// redux
import { useDispatch, useSelector } from "react-redux";
import { addUpdateProductInCartReducer } from "../../redux/CartSlice/ApiCartSlice.js";
import { getAProductReducer } from "../../redux/ProductSlice/ApiProductSlice.js"
import { deleteProductReducer, toggleDisableProductReducer } from "../../redux/ProductSlice/ApiProductSlice";

//// GeneralFunctions
import { IsUserLoggedIn } from "../../General/GeneralFunctions.js";

//// custom components
import LoaderComponent from "../GenericComponents/LoaderComponent/LoaderComponent.jsx";
import NoItemComponent from "../../Components/GenericComponents/NoItemsComponent/NoItemsComponent.jsx"
import ConfirmComponent from "../GenericComponents/ConfirmComponent/ConfirmComponent.jsx";

//// styles
const pageStyles = {
    display: "flex",
    minHeight: "60vh",
    width: "100%",
    bgcolor: "background.paper",
    p: { xs: 2, md: 4 },
    mt: 2,
    flexDirection: { xs: "column", md: "row" },
    gap: { xs: 1, md: 4 },
    justifyContent: { sx: "center", md: "space-between" },
    alignItems: { xs: "center", md: "flex-start" },
};
const productButtonStyle = {
    minWidth: "120px ",
    width: { xs: "100%", sm: "31%" },
    fontSize: "16px",
    fontWeight: "bolder ",
    py: .75, px: 1,
    borderRadius: "8px",
}
const fontSizeClamp = "clamp(1.25rem,calc(1.5rem + (25 - 15) * (100vw - 62.5rem) / (1920 - 1000)),2rem) !important";
const ColorCircle = ({ color }) => {
    const theme = useTheme(ColorModeContext);
    return <Box sx={{ width: "1.375rem", height: "1.375rem", borderRadius: "50%", bgcolor: color, border: `.125rem solid ${theme.palette.specialText.main}`, cursor: "pointer" }}></Box>
}

let operationType = "delete";
let enableMessage = "Are you sure you want to enable this product again?"
let disableMessage = "Are you sure you want to disable this product? i won't appear in your store."
let deleteMessage = "Are you sure you want to delete this product? you wont be able to undo this action."

const ProductPage = () => {

    let PreviewedProduct = useSelector((state) => state.ProductsApiRequest.singleProduct);
    let isLoading = useSelector((state) => state.ProductsApiRequest.isLoading);
    let error = useSelector((state) => state.ProductsApiRequest.error);

    const { productId } = useParams();
    const theme = useTheme(ColorModeContext);
    const productImg = PreviewedProduct?.img;

    const dispatch = useDispatch();

    let [modelText, setModelText] = useState({
        actionName: "",
        message: ""
    });

    const isDeleted = PreviewedProduct.isDeleted;


    //// Confirm Component
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const handleClickOpenConfirmDialog = () => setOpenConfirmDialog(true);
    const handleCloseConfirmDialog = () => setOpenConfirmDialog(false);

    const confirmChangeProductStatus = () => {

        switch (operationType) {
            case "enable":
                dispatch(toggleDisableProductReducer(PreviewedProduct._id));
                break;
            case "disable":
                dispatch(toggleDisableProductReducer(PreviewedProduct._id));
                break;
            case "delete":
                dispatch(deleteProductReducer(PreviewedProduct._id));
                break;
            default:
                break;
        }

        // if (IsUserLoggedIn()) {
        //      dispatch(deleteProductReducer(PreviewedProduct._id));
        // } else {
        //     toast.error("Please log in or sign up with new account to do this action🙂");
        // }
    };

    useEffect(() => {
        const getProduct = async () => {
            await dispatch(getAProductReducer(productId));
        }
        getProduct();

    }, []);


    if (isLoading) return <LoaderComponent />
    if (error) return <NoItemComponent message={"There is something wrong can't show this product right now 😔 "} minHeight={"60vh"} fontSize={"1.5rem"} />

    return (
        <Container sx={pageStyles} maxWidth="xl">
            <Box
                sx={{
                    paddingTop: "2.5rem",
                    maxWidth: { xs: 320, md: "31.25rem" },
                    minWidth: { xs: 320, md: "25rem" },
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <img
                    style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        borderRadius: ".625rem",
                    }}
                    src={productImg}
                    alt="product-img"
                />
            </Box>
            <Box
                sx={{
                    minHeight: "25rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "start",
                    justifyContent: "center",
                    gap: { xs: 0, md: 4, lg: 2 },
                    [theme.breakpoints.down("md")]: {
                        alignItems: "center",
                    },
                    flexGrow: 1,
                }}
            >
                <Typography
                    variant="h1"
                    sx={{
                        fontWeight: "bold",
                        fontSize: fontSizeClamp,
                        width: "100%",
                    }}
                >
                    {PreviewedProduct.title}
                </Typography>

                <Typography
                    fontSize={"1.5rem"}
                    color={"crimson"}
                    variant="h6"
                    fontWeight={"bold"}
                    width={"100%"}
                >
                    ${PreviewedProduct.price}
                </Typography>

                <Stack
                    alignItems={"center"}
                    direction={"row"}
                    sx={{
                        fontSize: { xs: "1rem", lg: "1.125rem" },
                        textAlign: { xs: "justify", md: "left" },
                        maxWidth: { xs: "100%", lg: "100%" },
                        width: "100%",
                        mb: 1,
                    }}
                >
                    <span style={{ fontWeight: "bold", minWidth: "6.875rem" }}>Rating :</span> <Rating
                        name="read-only"
                        value={PreviewedProduct.rating}
                        readOnly
                        size="small"
                        precision={0.5}
                    />
                </Stack>

                <Stack
                    direction={"row"}
                    alignItems={"center"}
                    sx={{
                        fontSize: { xs: "1rem", lg: "1.125rem" },
                        textAlign: { xs: "justify", md: "left" },
                        minWidth: { xs: "100%", lg: "100%" },
                        mb: 1
                    }}
                >
                    <span style={{ fontWeight: "bold", minWidth: "6.875rem" }}>Colors :</span>
                    <ColorCircle color={PreviewedProduct.color} />
                </Stack>

                <Typography
                    sx={{
                        fontSize: { xs: "1rem", lg: "1.125rem" },
                        textAlign: { xs: "justify", md: "left" },
                        maxWidth: { xs: "100%", lg: "100%" },
                        width: "100%", mb: 1
                    }}
                >
                    <span style={{ display: "inline-block", fontWeight: "bold", minWidth: "6.875rem" }}>Size :</span>{PreviewedProduct.size}
                </Typography>

                <Stack className="flex-center" sx={{ mb: 4, width: "100%", justifyContent: "flex-start" }}>
                    <Typography sx={{ fontSize: { xs: "1rem", lg: "1.125rem" }, minWidth: "6.875rem", fontWeight: "bold" }}> amount : </Typography>

                    {
                        PreviewedProduct.amount === 0
                            ? <Typography variant="body" sx={{ fontSize: { xs: "1rem", lg: "1.125rem", fontWeight: "bold", color: theme.palette.specialText2.main } }}>Out of stock</Typography>
                            : <Typography variant="body" sx={{ fontSize: { xs: "1rem", lg: "1.125rem" } }}>
                                ( <span style={{ fontWeight: "bold", color: theme.palette.specialText.main }}>{PreviewedProduct.amount}</span> ) items in stock
                            </Typography>
                    }

                </Stack>

                {/* action buttons */}
                <Stack className="flex-between"
                    sx={{ py: 1.4, bgcolor: "inherit", gap: 2, flexWrap: "wrap", width: "100%", mb: 3 }}

                >
                    <Button
                        size="small"
                        sx={{ ...productButtonStyle, gap: 1 }}
                        variant="contained"
                        disabled={isDeleted}
                        onClick={() => {
                            document.location.href = `/products/edit-product/${PreviewedProduct._id}`
                        }}
                    >
                        <EditRoundedIcon sx={{ fontSize: "1.25rem" }} />
                        <span style={{ fontWeight: "bolder" }}>Edit</span>
                    </Button>
                    <Button
                        color="warning"
                        size="small"
                        sx={{ ...productButtonStyle, gap: 1 }}
                        onClick={() => {
                            operationType = isDeleted ? "enable" : "disable";
                            setModelText({ actionName: isDeleted ? "Enable Product" : "Disable Product", message: isDeleted ? enableMessage : disableMessage })
                            handleClickOpenConfirmDialog()
                        }}
                        variant="contained"
                    >
                        <RemoveShoppingCartIcon sx={{ fontSize: "1.25rem" }} />
                        <span style={{ fontWeight: "bolder" }}>{isDeleted ? "Enable" : "Disable"}</span>
                    </Button>
                    <Button
                        color="error"
                        size="small"
                        sx={{ ...productButtonStyle, gap: 1 }}
                        onClick={() => {
                            setModelText({ actionName: "Delete Product", message: deleteMessage })
                            operationType = "delete"
                            handleClickOpenConfirmDialog()
                        }}
                        variant="contained"
                        disabled={isDeleted}
                    >
                        <DeleteRoundedIcon sx={{ fontSize: "1.25rem" }} />
                        <span style={{ fontWeight: "bolder" }}>
                            Delete
                        </span>
                    </Button>


                </Stack>
                {/*== action buttons ==*/}

                <Typography
                    sx={{
                        fontSize: "1rem",
                        textAlign: { xs: "justify", md: "left" },
                        maxWidth: { xs: "100%", lg: "100%" },
                        lineHeight: "1.5",
                        letterSpacing: ".0313rem",
                        mb: 4,
                    }}
                >
                    <span style={{ fontWeight: "bold", fontSize: "1.125rem", }}>Description : </span>  <br /> {PreviewedProduct.desc}
                </Typography>
            </Box >
            {
                openConfirmDialog && <ConfirmComponent
                    openConfirmDialog={openConfirmDialog}
                    confirmAction={confirmChangeProductStatus}
                    handleCloseConfirmDialog={handleCloseConfirmDialog}
                    message={modelText?.message}
                    actionName={modelText?.actionName}
                />
            }

        </Container >
    );
};

export default ProductPage;


