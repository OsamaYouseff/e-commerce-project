import PaymentIcon from '@mui/icons-material/Payment';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { Box, Stack, Typography } from "@mui/material";
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/material/styles/useTheme';
import { ColorModeContext } from "../../../Theme/theme";


const Features = () => {
    const theme = useTheme(ColorModeContext);
    return (
        <Stack direction={"row"} alignItems={"center"} justifyContent={"space-center"} gap={1} marginTop={".9375rem"}
            flexWrap={"wrap"}
            divider={(useMediaQuery("(min-width:56.25rem) ")) ? (<Divider orientation="vertical" flexItem />) : null}
            sx={{ bgcolor: theme.palette.categoryColor.main, borderRadius: ".375rem", px: "1rem", py: ".5rem", boxShadow: 3, }}
        >
            <BoxFeature icon={<ElectricBoltIcon />} title="Free Delivery" subtitle="Starts form $10" />
            <BoxFeature icon={<WorkspacePremiumIcon />} title="Payment" subtitle="Secure system" />
            <BoxFeature icon={<AccessAlarmIcon />} title="365 Days" subtitle="For free return" />
            <BoxFeature icon={<PaymentIcon />} title="Money Guararantee" subtitle="7 Days back" />
        </Stack >
    )
}
export default Features;

// eslint-disable-next-line react/prop-types
function BoxFeature({ icon, title, subtitle }) {
    const theme = useTheme();
    return (
        <Stack className="border" direction={"row"} alignItems={"center"} justifyContent={"center"} gap={2} sx={{
            px: "1rem", py: ".5rem", borderRadius: ".375rem", flexGrow: "1", border: ".0625rem solid transparent", cursor: "pointer",
            "&:hover": { border: `.0625rem solid ${theme.palette.text.primary}` }, transition: "all 0.35s ease", width: "12.5rem",
            [theme.breakpoints.down('sm')]: { justifyContent: "start", },
            [theme.breakpoints.down('md')]: { boxShadow: 1, }
        }}>
            {icon}
            <Box >
                <Typography fontSize={".9375rem"}>{title}</Typography>
                <Typography fontSize={".8125rem"} color={theme.palette.text.secondary}>{subtitle}</Typography>
            </Box >
        </Stack >
    )
}

