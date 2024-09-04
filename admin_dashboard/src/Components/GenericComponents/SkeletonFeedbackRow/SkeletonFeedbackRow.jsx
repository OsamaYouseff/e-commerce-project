/* eslint-disable react/prop-types */
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

const SkeletonFeedbackRow = ({ numOfSkeletons = 10 }) => {
    const SkeletonStyles = {
        flexGrow: 1,
        minWidth: "100%",
        height: "40px",
        borderRadius: ".5rem",
    };
    return (
        <Stack
            sx={{ mt: ".9375rem", py: ".9375rem", gap: ".3rem 0" }}
            direction={"row"}
            flexWrap={"wrap"}
            justifyContent={"space-between"}
        >
            {[...Array(numOfSkeletons)].map((item, index) => (
                <Skeleton

                    key={index}
                    variant="rectangular"
                    sx={SkeletonStyles}
                />
            ))}
        </Stack>
    );
};

export default SkeletonFeedbackRow;
