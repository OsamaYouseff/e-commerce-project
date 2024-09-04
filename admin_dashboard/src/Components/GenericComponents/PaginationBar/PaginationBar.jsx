import { Box } from "@mui/material";
import Pagination from '@mui/material/Pagination';
const PaginationBar = ({ page, setPage, totalPages }) => {
    return (
        <Box className="flex-center" mt={5} sx={{ width: "100%", bgcolor: "sectionBgColor.main", p: 1, borderRadius: 1, boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px;" }} >
            <Pagination page={page} size="large" onChange={(e, value) => setPage(value)} siblingCount={window.innerWidth > 550 ? 1 : 0} count={totalPages} color="secondary" />
        </Box>
    )
}

export default PaginationBar;