import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../../Theme/theme";
const Footer = () => {
  const theme = useTheme(ColorModeContext);
  return (
    <Box className="footer flex-center" sx={{
      width: "100%",
      background: `linear-gradient(90deg, #1d273b, #2e4a56, #1d273b)`,
      borderTop: `1px solid ${theme.palette.divider}`,
      borderTopLeftRadius: "4px",
      borderTopRightRadius: "4px",
      fontSize: { xs: "17px", md: "20px" },
      p: 1,
      color: "#f7f7f7",
      fontWeight: "bold"
    }}
    >
      Developed By  <a style={{
        color: "#009688", fontWeight: "bold", textDecoration: "none"
        , marginLeft: "10px"
      }} target="_blank" href="https://github.com/osamayouseff">@Osama Youseff</a>
      <Typography sx={{ marginLeft: "10px", fontSize: "19px" }}> © {new Date().getFullYear()}</Typography>
    </Box>
  );
};

export default Footer;
