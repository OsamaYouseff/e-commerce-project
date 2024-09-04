import { Box, Stack, Typography, TextField } from "@mui/material";

//// custom component
import SelectMenu from "../SelectMenu/SelectMenu"

const FilterBar = ({ title, sorting, setSorting, sortingOptions, UiLimit, setLimit, setUiLimit }) => {
    return (
        <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
            flexWrap={"wrap"}
            gap={3}
            sx={{ bgcolor: "sectionBgColor.main", p: 2, borderRadius: "10px", boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px;" }}
        >
            <Box className="flex-between" sx={{ width: "100%", gap: 2, flexWrap: "wrap" }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: "bold",
                        fontSize: { xs: "1.25rem", sm: "20px" },
                        width: { xs: "100%", sm: "auto" },
                    }}
                >
                    Filter {title}
                </Typography>
                <SelectMenu minWidth="140px" options={sortingOptions} selectedOption={sorting} setSelectedOption={setSorting} />
                {/* <SelectMenu options={categoryOptions} /> */}
                <TextField
                    fullWidth
                    label={"-----  items num -----"}
                    type="number"
                    id={"5464545"}
                    value={UiLimit}
                    onBlur={(e) => {
                        const value = Number(e.target.value)
                        if (value > 0 && value <= 100) setLimit(value);
                    }}
                    onChange={(e) => {
                        const value = Number(e.target.value)
                        if (value > 0 && value <= 100) setUiLimit(value);
                    }}
                    size="small"
                    placeholder={"items num"}
                    sx={{
                        width: "140px",
                        maxHeight: "2.2rem",
                        "input": {
                            textAlign: "center", p: .76,
                        },
                        ".MuiOutlinedInput-notchedOutline.css-9425fu-MuiOutlinedInput-notchedOutline": {
                            borderRadius: "8px",
                        }
                    }}
                />
                <span style={{ flexGrow: 1 }}></span>
            </Box>
        </Stack>
    )
}

export default FilterBar;