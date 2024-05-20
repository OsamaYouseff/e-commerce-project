import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../Theme/theme";
const Footer = () => {
  const theme = useTheme(ColorModeContext);
  return (
    <Box className="footer flex-center" sx={{
      width: "100%",
      // background: `linear-gradient(90deg, ${theme.palette.footerBgColor.accent}, ${theme.palette.footerBgColor.primary},${theme.palette.footerBgColor.accent})`,
      background: `linear-gradient(90deg, #1d273b, #2e4a56, #1d273b)`,
      borderTop: `1px solid ${theme.palette.divider}`,
      marginTop: "15px",
      borderTopLeftRadius: "4px",
      borderTopRightRadius: "4px",
      fontSize: "20px",
      p: 1,
      color: "#f7f7f7",
      fontWeight: "bold"
    }}
    >
      Developed By  <a style={{
        color: "#009688", fontWeight: "bold", textDecoration: "none"
        , marginLeft: "5px"
      }} target="_blank" href="https://github.com/osamayouseff">@Osama Youseff</a></Box>
  );
};

export default Footer;
