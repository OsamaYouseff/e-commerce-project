import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

const SkeletonFeedback = () => {
    return (
        <Stack
            direction="row"
            sx={{ width: "100% !important", flexWrap: "wrap", gap: " 15px 10px" }}
            alignItems={"space-between"} justifyContent={"center"}
        >
            <Skeleton variant="rectangular" height={360} sx={{ flexGrow: 1, minWidth: "280px" }} />
            <Skeleton variant="rectangular" height={360} sx={{ flexGrow: 1, minWidth: "280px" }} />
            <Skeleton variant="rectangular" height={360} sx={{ flexGrow: 1, minWidth: "280px" }} />
            <Skeleton variant="rectangular" height={360} sx={{ flexGrow: 1, minWidth: "280px" }} />
            <Skeleton variant="rectangular" height={360} sx={{ flexGrow: 1, minWidth: "280px" }} />
            <Skeleton variant="rectangular" height={360} sx={{ flexGrow: 1, minWidth: "280px" }} />
            <Skeleton variant="rectangular" height={360} sx={{ flexGrow: 1, minWidth: "280px" }} />
            <Skeleton variant="rectangular" height={360} sx={{ flexGrow: 1, minWidth: "280px" }} />
            <Skeleton variant="rectangular" height={360} sx={{ flexGrow: 1, minWidth: "280px" }} />
            <Skeleton variant="rectangular" height={360} sx={{ flexGrow: 1, minWidth: "280px" }} />
        </Stack >
    );
}

export default SkeletonFeedback

