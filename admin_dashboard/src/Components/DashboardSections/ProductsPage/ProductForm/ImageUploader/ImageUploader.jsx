import { Box } from "@mui/material";
import { styled } from '@mui/material/styles';



const ImageUploader = ({ imgURL, handelFormData }) => {
    const VisuallyHiddenInput = styled('input')({
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: "100%",
        height: "100%",
        cursor: "pointer",
        opacity: 0,
    });

    const handleFileChange = (event) => {
        const file = event.target.files[0]; // Get the first selected file
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                handelFormData("img", reader.result);
            };
            reader.readAsDataURL(file); // Read the file as a Data URL
        }
    };

    return (
        <Box className="flex-center" sx={{ width: "100%", height: "100%", position: "absolute" }}>
            <VisuallyHiddenInput
                className="upload-file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                multiple
                sx={{ zIndex: 23 }}
            />
            {imgURL && <img src={imgURL} alt="Selected" style={{ position: "absolute", maxWidth: "100%", height: "100%", zIndex: 22 }} />}
        </Box>
    );
}


export default ImageUploader