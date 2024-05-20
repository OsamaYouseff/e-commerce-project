import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../../Theme/theme";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useState } from "react";
/// Icons
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
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
const ProductDetails = ({ handleCloseModal, open }) => {
  const theme = useTheme(ColorModeContext);
  const [previewImgUrl, setPreviewImgUrl] = useState('src/images/1.jpg');

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
              WOMEN<span>&apos;</span>S FASHION
            </Typography>
            <Typography
              my={0.4}
              fontSize={"22px"}
              color={"crimson"}
              variant="h6"
            >
              $12.99
            </Typography>
            <Typography sx={{ fontSize: "16px" }}>
              Lizards are a widespread group of squamate reptiles,
              with over 6,000 species, ranging across all
              continents except Antarctica
            </Typography>

            <Stack
              sx={{
                justifyContent: { xs: "center", sm: "left" },
              }}
              direction={"row"}
              gap={1}
              my={2}
            >
              {["src/images/1.jpg", "src/images/2.jpg"].map(
                (item) => {
                  return (
                    <Box
                      key={item}
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
                      }}
                    >
                      <img
                        height={100}
                        width={90}
                        src={item}
                        alt="product-preview-img"
                        onClick={() => setPreviewImgUrl(item)}
                      />

                    </Box>
                  );
                }
              )}
            </Stack>

            <Button
              sx={{
                mb: { xs: 1, sm: 0 },
                textTransform: "capitalize",
                p: "5px 15px !important",
                bgcolor: "#ff6e6e",
              }}
              variant="contained"
            >
              <AddShoppingCartOutlinedIcon
                sx={{ mr: 1 }}
                fontSize="small"
              />
              Buy now
            </Button>
          </Box>
        </Stack>
      </Modal>
    </div>
  );
};

export default ProductDetails;
