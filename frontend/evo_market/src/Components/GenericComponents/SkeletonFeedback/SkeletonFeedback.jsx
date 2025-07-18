/* eslint-disable react/prop-types */
import { Box } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

const SkeletonStyles = {
    flexGrow: 1,
    minWidth: "17.5rem",
    height: 360,
    borderRadius: ".5rem",
};
const SkeletonFeedback = ({ numOfSkeletons = 10 }) => {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(285px,1fr))",
                mt: ".9375rem", py: ".9375rem", gap: "20px",
            }}

        >
            {[...Array(numOfSkeletons)].map((item, index) => (
                <Skeleton
                    key={index}
                    variant="rectangular"
                    height={420}
                    sx={SkeletonStyles}
                />
            ))}
        </Box>
    );
};

export default SkeletonFeedback;
