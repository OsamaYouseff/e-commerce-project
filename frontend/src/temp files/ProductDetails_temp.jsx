// /* eslint-disable react/prop-types */
// import { Box, Stack, Typography } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// import { ColorModeContext } from "../../../Theme/theme";
// import Button from "@mui/material/Button";
// import Modal from "@mui/material/Modal";
// import { useContext, useState } from "react";
// import ToggleButton from "@mui/material/ToggleButton";
// import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

// /// Icons
// import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
// import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
// import { CartContext } from "../../../Contexts/CustomerContext";

// //// styles
// const CloseBtnStyles = {
//     position: "absolute",
//     top: { xs: ".3125rem", md: ".9375rem" },
//     right: { xs: ".3125rem", md: ".9375rem" },
//     fontSize: "3.4375rem",
//     width: "2.8125rem",
//     height: "2.8125rem",
//     cursor: "pointer",
//     borderRadius: "50%",
//     p: 1,
//     "&:hover": {
//         transform: "rotate(180deg)",
//         color: "#ff6e6e",
//         borderColor: "#ff6e6e",
//     },
//     transition: "0.35s",
// };
// const modalStyles = {
//     position: "absolute",
//     top: "50%",
//     left: "50%",
//     transform: "translate(-50%, -50%)",
//     width: 400,
//     bgcolor: "background.paper",
//     border: ".125rem solid #000",
//     boxShadow: 24,
//     p: 4,
//     flexDirection: { xs: "column", sm: "row" },
//     gap: { xs: 1, sm: 4 },
//     justifyContent: { sx: "center", sm: "space-between" },
// };

// // eslint-disable-next-line react/prop-types
// const ProductDetails = ({ PreviewedProduct, handleCloseModal, open }) => {
//     const theme = useTheme(ColorModeContext);
//     const imagesObjsArr = PreviewedProduct.attributes.productImages.data;
//     const [previewImgUrl, setPreviewImgUrl] = useState(
//         `${imagesObjsArr[0].attributes.url}`
//     );
//     const [selectedImg, setSelectedImg] = useState(0);

//     const { cartDataDispatch } = useContext(CartContext);

//     const handleClickAddToCart = () => {
//         cartDataDispatch({
//             type: "ADD_TO_CART",
//             payload: {
//                 id: PreviewedProduct.id,
//                 title: PreviewedProduct.attributes.productTitle,
//                 quantity: 1,
//                 price: PreviewedProduct.attributes.productPrice,
//                 imageURL: imagesObjsArr[0].attributes.url,
//             },
//         });
//     };

//     const handelSelectedImg = (event, newValue) => {
//         if (newValue !== null) {
//             setSelectedImg(newValue);
//         }
//     };
//     return (
//         <Box>
//             <Modal
//                 open={open}
//                 onClose={handleCloseModal}
//                 aria-labelledby="modal-modal-title"
//                 aria-describedby="modal-modal-description"
//                 sx={{
//                     ".MuiStack-root": {
//                         width: { xs: "95%", sm: "80%", md: "53.125rem" },
//                         maxHeight: { xs: "98%", sm: "34.375rem", md: "37.5rem" },
//                         // minWidth: "23.75rem",
//                         borderRadius: ".625rem",
//                         border: "none",
//                         bgcolor: theme.palette.categoryColor.main,
//                     },
//                 }}
//             >
//                 <Stack sx={modalStyles} direction={"row"} alignItems={"center"}>
//                     <CloseRoundedIcon
//                         color={theme.palette.text.primary}
//                         sx={CloseBtnStyles}
//                         onClick={handleCloseModal}
//                     />
//                     <Box
//                         sx={{
//                             padding: "0",
//                             maxWidth: { xs: 200, lg: "21.875rem" },
//                             minWidth: { xs: 200, lg: "20rem" },
//                             maxHeight: { xs: 200, lg: "20rem" },
//                             minHeight: { xs: 200, lg: "20rem" },
//                             display: "flex",
//                             justifyContent: "center",
//                             alignItems: "center",
//                         }}
//                     >
//                         <img
//                             style={{ maxWidth: "90%", borderRadius: ".625rem" }}
//                             src={previewImgUrl}
//                             alt="product-img"
//                         />
//                     </Box>
//                     <Box
//                         sx={{
//                             [theme.breakpoints.down("sm")]: {
//                                 display: "flex",
//                                 flexDirection: "column",
//                                 justifyContent: "start",
//                                 alignItems: "center",
//                             },
//                             overflow: "hidden",
//                         }}
//                     >
//                         <Stack
//                             sx={{
//                                 fontSize: { xs: "1.125rem", lg: "1.125rem" },
//                                 flexDirection: { xs: "row", sm: "column" },
//                                 alignItems: { xs: "center", sm: "start" },
//                                 justifyContent: "center",
//                                 gap: { xs: 1, sm: 0 },
//                             }}
//                         >
//                             <Typography variant="h6">
//                                 {PreviewedProduct.attributes.productTitle}
//                             </Typography>
//                             <Typography
//                                 my={0.4}
//                                 fontSize={"1.375rem"}
//                                 color={"crimson"}
//                                 variant="h6"
//                             >
//                                 ${PreviewedProduct.attributes.productPrice}
//                             </Typography>
//                         </Stack>

//                         <Typography
//                             sx={{
//                                 fontSize: { xs: ".875rem", lg: "1.125rem" },
//                                 maxWidth: { xs: "100%", lg: "100%" },
//                             }}
//                         >
//                             {PreviewedProduct.attributes.productDescription}
//                         </Typography>
//                         <Stack
//                             sx={{
//                                 justifyContent: { xs: "center", sm: "left" },
//                                 overflow: "auto",
//                                 minWidth: { xs: "100%", sm: "100%" },
//                             }}
//                             direction={"row"}
//                             gap={1}
//                             my={2}
//                         >
//                             <ToggleButtonGroup
//                                 value={selectedImg}
//                                 exclusive
//                                 onChange={handelSelectedImg}
//                                 sx={{
//                                     ".Mui-selected": {
//                                         opacity: "1",
//                                         border: ".0625rem solid #ff6e6e",
//                                         background: "initial",
//                                         borderRadius: ".3125rem !important",
//                                     },
//                                 }}
//                             >
//                                 {imagesObjsArr.map((item, index) => {
//                                     return (
//                                         <ToggleButton
//                                             value={index}
//                                             key={item.id}
//                                             sx={{
//                                                 display: "flex",
//                                                 p: 0,
//                                                 border: ".0625rem solid transparent",
//                                                 "&:hover": {
//                                                     borderColor: "#ff6e6e",
//                                                 },
//                                                 borderRadius: 1,
//                                                 cursor: "pointer",
//                                                 transition: "0.35s",
//                                                 overflow: "hidden",
//                                                 margin: "0 .125rem",
//                                                 opacity: 0.5,
//                                                 marginX: ".3125rem",
//                                             }}
//                                         >
//                                             <img
//                                                 height={100}
//                                                 width={90}
//                                                 src={item.attributes.url}
//                                                 alt="product-preview-img"
//                                                 onClick={() => {
//                                                     setPreviewImgUrl(
//                                                         item.attributes.url
//                                                     );
//                                                     setSelectedImg(index);
//                                                 }}
//                                             />
//                                         </ToggleButton>
//                                     );
//                                 })}
//                             </ToggleButtonGroup>
//                         </Stack>
//                         <Button
//                             sx={{
//                                 mb: { xs: 1, sm: 0 },
//                                 textTransform: "capitalize",
//                                 p: ".3125rem .9375rem !important",
//                                 bgcolor: "#ff6e6e",
//                                 fontWeight: "bold",
//                             }}
//                             variant="contained"
//                         >
//                             <AddShoppingCartOutlinedIcon
//                                 sx={{ mr: 1 }}
//                                 fontSize="small"
//                             />
//                             Buy now
//                         </Button>
//                         <span
//                             style={{ display: "inline-block", width: ".625rem" }}
//                         >
//                             {" "}
//                         </span>
//                         <Button
//                             onClick={() => {
//                                 handleClickAddToCart();
//                             }}
//                             sx={{
//                                 mb: { xs: 1, sm: 0 },
//                                 textTransform: "capitalize",
//                                 p: ".3125rem .9375rem !important",
//                                 fontWeight: "bold",
//                             }}
//                             color="secondary"
//                             variant="contained"
//                         >
//                             <AddShoppingCartOutlinedIcon
//                                 sx={{ mr: 1 }}
//                                 fontSize="small"
//                             />
//                             Add To Cart
//                         </Button>
//                     </Box>
//                 </Stack>
//             </Modal>
//         </Box>
//     );
// };

// export default ProductDetails;
