/* eslint-disable react/prop-types */

import { useTheme } from "@emotion/react";
import { ColorModeContext } from "../Theme/theme";

import { Box } from "@mui/material";

const NoItemsComponent = ({ message, minHeight, fontSize }) => {
    const theme = useTheme(ColorModeContext);

    return (
        <Box
            className="flex-center"
            sx={{
                p: 2,
                // bgcolor: theme.palette.sectionBgColor.main,
                // color: theme.palette.text.main,
                textAlign: "center",
                borderRadius: "10px",
                fontWeight: "bolder",
                fontSize: fontSize,
                width: "100%",
                minHeight: minHeight,
            }}
        >
            {message}
        </Box>
    )
}

export default NoItemsComponent;