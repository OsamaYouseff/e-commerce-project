import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../../Theme/theme";
const Footer = () => {
  const theme = useTheme(ColorModeContext);
  const fontSizeClamp = "clamp(.9375rem,calc(.9375rem + (32 - 15) * (100vw - 62.5rem) / (1920 - 1000)),2rem) !important";

  return (
    <Box className="footer flex-center" sx={{
      width: "100%",
      background: `linear-gradient(90deg, #1d273b, #2e4a56, #1d273b)`,
      borderTop: `.0625rem solid ${theme.palette.divider}`,
      borderTopLeftRadius: ".25rem",
      borderTopRightRadius: ".25rem",
      fontSize: fontSizeClamp,
      p: 1,
      color: "#f7f7f7",
      fontWeight: "bold"
    }}
    >
      Developed By  <a style={{
        color: "#009688", fontWeight: "bold", textDecoration: "none"
        , marginLeft: ".625rem"
      }} target="_blank" href="https://github.com/osamayouseff">@Osama Youseff</a>
      <Typography sx={{ marginLeft: ".625rem", fontWeight: "bold", fontSize: "inherit" }}> © {new Date().getFullYear()}</Typography>
    </Box>
  );
};

export default Footer;
