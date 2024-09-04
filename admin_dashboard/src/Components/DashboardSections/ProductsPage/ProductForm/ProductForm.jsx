import { Box, Button, Container, Stack, TextField, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

//// hooks
import { useState } from "react";
import { useTheme } from "@emotion/react";

/// redux
import { useSelector } from "react-redux";

//// General functions
import { GetUserInfo, IsUserLoggedIn } from "../../../../General/GeneralFunctions";


//// custom components
import TextFieldComponent from "../../../GenericComponents/TextFieldComponent/TextFieldComponent";
import { ColorModeContext } from "../../../../Theme/theme";
import SelectComponent from "./SelectComponent/SelectComponent";
import ImageUploader from "./ImageUploader/ImageUploader";
import LoaderComponent from "../../../GenericComponents/LoaderComponent/LoaderComponent";

const mainBorderColor = "#7a7a7acc"

const ProductForm = ({ productFrom, handelBtnName, cancelBtnName, mainTitle, handelSubmitForm }) => {
    const theme = useTheme(ColorModeContext);
    const isLoading = useSelector((state) => state.ProductsApiRequest.isLoading);

    const [formData, setFormData] = useState(productFrom)

    const handelFormData = (key, value) => {
        const updatedFormData = {
            ...formData,
            [key]: value,
        };
        setFormData(updatedFormData);
    };
    const resetOperation = () => {

        if (cancelBtnName === "reset") {
            setFormData({
                title: "",
                desc: "",
                img: "",
                categories: [],
                size: "",
                color: "",
                price: 1,
                rating: "",
                amount: 1,
                isDeleted: false,
            });
        } else {
            document.location.reload();
        }
    };


    return (
        <Container maxWidth="xl" sx={{ p: 0 }}>
            <Stack sx={{ minWidth: "100%", p: 1, px: 2, flex: 1, overflowX: "hidden", mb: 6, mt: 1 }} >
                <Link style={{ maxWidth: "fit-content", mb: 1 }} to="/products">
                    <Button
                        size="small"
                        sx={{ fontWeight: "bolder" }}
                        variant="outlined"
                    >
                        <ArrowBackIosIcon />
                        Back to Products
                    </Button>
                </Link>

                <Typography variant="h1" sx={{ fontSize: "1.25rem", my: 2, fontWeight: "bolder" }} color={theme.palette.secondary.main}>{mainTitle}</Typography>

                <Stack className="flex-between"
                    sx={{
                        gap: 3, mt: 2,
                        flexDirection: { xs: "column-reverse !important ", md: "row !important" }, width: "100%", p: 0,
                        alignItems: { xs: "center", sm: "flex-start" }
                    }} >

                    {/* Left Section */}
                    <Box sx={{ flexGrow: 1, minWidth: { xs: "100%", md: "49%" } }} >

                        <Typography variant="h1" sx={{ fontSize: "1.25rem", fontWeight: "bold", mb: 1 }} >Description</Typography>
                        <Box sx={{ borderRadius: "10px", p: 2, mb: 3, border: `1px solid ${mainBorderColor}` }}>
                            <Typography variant="h2" sx={{ fontSize: ".9rem", fontWeight: "bold", mb: 1 }} >Product Name</Typography>
                            <TextFieldComponent colWidth={4}
                                setFormData={handelFormData}
                                keyName={"title"}
                                type={"text"}
                                value={formData.title}
                                mb={3} />

                            <Typography variant="h2" sx={{ fontSize: ".9rem", fontWeight: "bold", mb: 1 }} >Product Description</Typography>
                            <textarea
                                style={{
                                    overflowY: "auto",
                                    minWidth: "100%",
                                    maxWidth: "100%",
                                    padding: "10px", minHeight: "180px",
                                    borderRadius: "6px",
                                    backgroundColor: theme.palette.background.paper,
                                    color: `${theme.palette.text.primary}`,
                                    border: `1px solid ${mainBorderColor}`,
                                }} colWidth={4}
                                defaultValue={formData.desc}
                                value={formData.desc}
                                onChange={(e) => handelFormData("desc", e.target.value)}
                            />

                        </Box>

                        <Typography variant="h2" sx={{ fontSize: "1.25rem", fontWeight: "bold", mb: 1 }} >More Details</Typography>
                        <Box className="flex-between"
                            sx={{
                                gap: 2, borderRadius: "10px",
                                p: 2, border: `1px solid ${mainBorderColor}`, width: "100%",
                                flexWrap: "wrap",
                                minHeight: "150px"
                            }}>

                            <Box className="flex-center" gap={2}>
                                <Typography variant="h2" sx={{ fontSize: "1rem", fontWeight: "bold", minWidth: "65px" }} >Price</Typography>
                                <Box className="flex-center" sx={{ position: "relative" }}>
                                    <span
                                        style={{
                                            fontSize: "1.3rem",
                                            fontWeight: "bold", position: "absolute", left: 0,
                                            border: `1px solid #494949`, padding: "0px 8px",
                                            borderRadius: "6px",
                                        }}>$</span>
                                    <TextField type="number" size="small"

                                        onMouseLeave={(e) => {
                                            if (e.target.value <= 0) handelFormData("price", 1)
                                        }}
                                        onChange={(e) => { handelFormData("price", e.target.value) }}
                                        sx={{
                                            minWidth: "120px", maxWidth: "140px",
                                            "input": {
                                                textAlign: "center",
                                                fontSize: "1rem", px: 1, pl: 3.8, py: .8
                                            }
                                        }}
                                        value={formData.price} />
                                </Box>

                            </Box>

                            <Box className="flex-between" gap={2}>
                                <Typography variant="h2" sx={{
                                    fontSize: "1rem",
                                    fontWeight: "bold", minWidth: "65px"
                                }} >
                                    Size
                                </Typography>
                                <TextField type="text" size="small"
                                    onChange={(e) => handelFormData("size", e.target.value)}
                                    sx={{
                                        minWidth: "120px", maxWidth: "140px",
                                        "input": { textAlign: "center", fontSize: ".8rem", p: .7 }
                                    }}
                                    value={formData.size} />
                            </Box>


                            <Box className="flex-center" gap={2}>
                                <Typography variant="h2" sx={{
                                    fontSize: "1rem",
                                    fontWeight: "bold", minWidth: "65px"
                                }} >
                                    Color
                                </Typography>
                                <input
                                    type="color"
                                    defaultValue={formData.color}
                                    style={{
                                        width: "33px",
                                        height: "33px",
                                        cursor: "pointer",
                                        background: "transparent",
                                        border: "none"
                                    }}
                                    onBlur={(e) => handelFormData("color", e.target.value)}
                                />

                            </Box>

                            <Box className="flex-between" gap={2} >
                                <Typography variant="h2" sx={{
                                    fontSize: "1rem",
                                    fontWeight: "bold", minWidth: "65px"
                                }} >
                                    Amount
                                </Typography>
                                <TextField type="number" size="small"

                                    onMouseLeave={(e) => {
                                        if (e.target.value <= 0) handelFormData("amount", 1)
                                    }}
                                    onChange={(e) => { handelFormData("amount", e.target.value) }}
                                    sx={{
                                        minWidth: "100px", maxWidth: "140px",
                                        "input": {
                                            textAlign: "center",
                                            fontSize: "1rem", px: 1, pl: 2.5, py: .8
                                        }
                                    }}
                                    value={formData.amount} />
                            </Box>
                            <Button
                                onClick={resetOperation}
                                type="submit"
                                fullWidth
                                color="error"
                                variant="outlined"
                                size="small"
                                sx={{
                                    fontWeight: "bolder",
                                    width: { xs: "100%", md: "140px" },
                                }}
                            >
                                {cancelBtnName}
                            </Button>
                            <Button
                                onClick={() => handelSubmitForm(formData)}
                                type="submit"
                                fullWidth
                                color="success"
                                variant="outlined"
                                size="small"
                                sx={{
                                    fontWeight: "bolder",
                                    width: { xs: "100%", md: "140px" },
                                }}
                            >
                                {handelBtnName}
                            </Button>

                        </Box>

                    </Box>
                    {/*== Left Section ==*/}

                    {/* Right Section */}
                    <Box sx={{ flexGrow: 1, minWidth: { xs: "100%", md: "49%" } }}>
                        <Typography variant="h2" sx={{ fontSize: "1.25rem", fontWeight: "bold", mb: 1 }} >Product Image</Typography>
                        <Box className="flex-center" sx={{
                            borderRadius: "10px",
                            p: 2, mb: 3,
                            border: `1px dashed ${mainBorderColor}`,
                            cursor: "pointer",
                            maxWidth: "100%",
                            position: "relative",
                        }}>
                            <Box className="flex-center" sx={{
                                width: "70px",
                                height: "300px",
                            }}>
                                <img
                                    style={{
                                        width: "100%",
                                        maxWidth: "100%",
                                        borderRadius: "10px",
                                        filter: "invert(76%) sepia(76%) saturate(3451%) hue-rotate(180deg) brightness(55%) contrast(20%)",
                                        display: formData.img ? "none" : "block",
                                    }}
                                    src="/src/assets/images/placeholder-images-image_large.svg"
                                    alt="product-img"
                                />
                            </Box>
                            <ImageUploader imgURL={formData.img} handelFormData={handelFormData} />
                        </Box>


                        <Typography variant="h1" sx={{ fontSize: "1.25rem", fontWeight: "bold", mb: 1 }} >Category</Typography>
                        <Box sx={{
                            borderRadius: "10px", p: 2,
                            border: `1px solid ${mainBorderColor}`, width: "100%", minHeight: "150px"
                        }}>
                            <Typography variant="h2" sx={{ fontSize: ".9rem", fontWeight: "bold", mb: 1 }} >Product Category</Typography>
                            <SelectComponent category={formData.categories} handelFormData={handelFormData} />
                        </Box>

                    </Box>
                    {/*== Right Section ==*/}

                </Stack>
            </Stack >

            {isLoading && <LoaderComponent />}

        </Container >
    );
};


export default ProductForm;
