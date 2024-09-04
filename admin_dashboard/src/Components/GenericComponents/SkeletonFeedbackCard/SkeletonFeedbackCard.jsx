/* eslint-disable react/prop-types */
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

const SkeletonFeedbackCard = ({ numOfSkeletons = 10, minWidth = "280px" }) => {
    const SkeletonStyles = {
        // flexGrow: 1,
        minWidth: { minWidth },
        height: 350,
        borderRadius: ".5rem",
    };
    return (
        <Stack
            sx={{ mt: ".9375rem", py: ".9375rem", gap: ".9375rem .625rem" }}
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

export default SkeletonFeedbackCard;
