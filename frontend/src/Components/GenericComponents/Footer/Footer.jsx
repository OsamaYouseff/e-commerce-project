import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../../Theme/theme";
const Footer = () => {
  const theme = useTheme(ColorModeContext);
  const fontSizeClamp = "clamp(15px,calc(15px + (32 - 15) * (100vw - 1000px) / (1920 - 1000)),32px) !important";

  return (
    <Box className="footer flex-center" sx={{
      width: "100%",
      background: `linear-gradient(90deg, #1d273b, #2e4a56, #1d273b)`,
      borderTop: `1px solid ${theme.palette.divider}`,
      borderTopLeftRadius: "4px",
      borderTopRightRadius: "4px",
      fontSize: fontSizeClamp,
      p: 1,
      color: "#f7f7f7",
      fontWeight: "bold"
    }}
    >
      Developed By  <a style={{
        color: "#009688", fontWeight: "bold", textDecoration: "none"
        , marginLeft: "10px"
      }} target="_blank" href="https://github.com/osamayouseff">@Osama Youseff</a>
      <Typography sx={{ marginLeft: "10px", fontWeight: "bold", fontSize: "inherit" }}> © {new Date().getFullYear()}</Typography>
    </Box>
  );
};

export default Footer;
