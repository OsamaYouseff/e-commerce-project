/* eslint-disable react/prop-types */
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
                    height={360}
                    sx={SkeletonStyles}
                />
            ))}
        </Stack>
    );
};

export default SkeletonFeedback;
