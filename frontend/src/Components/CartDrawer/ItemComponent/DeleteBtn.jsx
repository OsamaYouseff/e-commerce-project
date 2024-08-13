/* eslint-disable react/prop-types */
import { ColorModeContext } from "../../../Theme/theme.jsx";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";


const DeleteBtn = ({ handleDeleteProduct }) => {
    const theme = useTheme(ColorModeContext);

    return (
        <IconButton
            onClick={() => handleDeleteProduct()}
            sx={{
                border: `1px solid  ${theme.palette.text.primary}`,
                aspectRatio: "1 / 1",
                transition: "all 0.25s ease",
                "&:hover": {
                    color: "#e91e63",
                    borderColor: "#e91e63",
                    scale: "1.08",
                },
                p: 0.6,
            }}
            aria-label="delete"
            size="small"
        >
            <DeleteIcon fontSize="small" />
        </IconButton>
    )
}


export default DeleteBtn;