/* eslint-disable react/prop-types */

import { Box } from "@mui/material";

const NoItemsComponent = ({ message, minHeight, fontSize }) => {

    return (
        <Box
            className="flex-center"
            sx={{
                p: 2,
                bgcolor: "sectionBgColor.main",
                color: "text.primary",
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