/* eslint-disable react/prop-types */
import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../../Theme/theme";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { useState } from "react";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

/// Icons
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";


//// styless
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
  flexDirection: { xs: "column", sm: "row" },
};


// eslint-disable-next-line react/prop-types
const ProductDetails = ({ PreviewedProduct, handleCloseModal, open }) => {
  const theme = useTheme(ColorModeContext);
  const imagesObjsArr = PreviewedProduct.attributes.productImages.data;
  const [previewImgUrl, setPreviewImgUrl] = useState(`${imagesObjsArr[0].attributes.url}`);
  const [selectedImg, setSelectedImg] = useState(0);

  const handelSelectedImg = (event, newValue) => {
    if (newValue !== null) {
      setSelectedImg(newValue);
    }
  }
  return (
    <div>
      <Modal
        open={open}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{
          ".MuiStack-root": {
            width: { xs: "94%", md: "850px" },
            minWidth: "390px",
            borderRadius: "10px",
            border: "none",
            bgcolor: theme.palette.categoryColor.main,
          },
        }}
      >
        <Stack
          sx={modalStyles}
          direction={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
          gap={3}
        >
          <CloseRoundedIcon
            color={theme.palette.text.primary}
            sx={CloseBtnStyles}
            onClick={handleCloseModal}
          />
          <Box>
            <img
              style={{ maxWidth: 300, minWidth: 300, borderRadius: "10px", maxHeight: "350px", minHeight: "350px" }}
              src={previewImgUrl}
              alt="product-img"
            />
          </Box>
          <Box
            sx={{
              [theme.breakpoints.down("sm")]: {
                display: "flex",
                flexDirection: "column",
                justifyContent: "start",
                alignItems: "center",
              },
              overflow: "hidden",
            }}
          >
            <Typography variant="h5">
              {PreviewedProduct.attributes.productTitle}
            </Typography>
            <Typography
              my={0.4}
              fontSize={"22px"}
              color={"crimson"}
              variant="h6"
            >
              ${PreviewedProduct.attributes.productPrice}
            </Typography>
            <Typography sx={{ fontSize: "16px" }}>
              {PreviewedProduct.attributes.productDescription}
            </Typography>
            <Stack
              sx={{
                justifyContent: { xs: "center", sm: "left" },
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
                    overflowX: "auto",
                  },
                }}
              >
                {imagesObjsArr.map(
                  (item, index) => {
                    return (
                      <ToggleButton value={index}
                        key={item.id}
                        sx={{
                          display: "flex",
                          p: 0,
                          border: "1px solid transparent",
                          "&:hover": { borderColor: "#ff6e6e", },
                          borderRadius: 1,
                          cursor: "pointer",
                          transition: "0.35s",
                          overflow: "hidden",
                          margin: "0 2px",
                          opacity: 0.5,
                          marginX: "5px",
                        }}>
                        < img
                          height={100}
                          width={90}
                          src={item.attributes.url}
                          alt="product-preview-img"
                          onClick={() => {
                            setPreviewImgUrl(item.attributes.url);
                            setSelectedImg(index);
                          }

                          }
                        />
                      </ToggleButton>
                    );
                  }
                )}

              </ToggleButtonGroup>
            </Stack>
            <Button
              sx={{
                mb: { xs: 1, sm: 0 },
                textTransform: "capitalize",
                p: "5px 15px !important",
                bgcolor: "#ff6e6e",
              }}
              variant="contained" >
              <AddShoppingCartOutlinedIcon
                sx={{ mr: 1 }}
                fontSize="small"
              />
              Buy now
            </Button>
          </Box>
        </Stack>
      </Modal >
    </div >
  );
};

export default ProductDetails;
