import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

const SkeletonStyles = {
    flexGrow: 1,
    minWidth: "280px",
    height: 360,
    borderRadius: "8px",
}
const SkeletonFeedback = () => {
    return (
        <Stack
            direction="row"
            sx={{ width: "100% !important", flexWrap: "wrap", gap: " 15px 10px" }}
            alignItems={"space-between"} justifyContent={"center"} >
            {
                [...Array(8)].map((item, index) => (
                    <Skeleton key={index} variant="rectangular" height={360} sx={SkeletonStyles} />
                ))
            }
        </Stack >
    );
}

export default SkeletonFeedback

