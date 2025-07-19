/* eslint-disable react/prop-types */
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

const SkeletonFeedbackCard = ({ numOfSkeletons = 10, minWidth = "17.5rem" }) => {
    const SkeletonStyles = {
        flexGrow: 1,
        minWidth: { minWidth },
        height: 350,
        borderRadius: ".5rem",
    };
    return (
        <Stack
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
                    sx={SkeletonStyles}
                />
            ))}
        </Stack>
    );
};

export default SkeletonFeedbackCard;
