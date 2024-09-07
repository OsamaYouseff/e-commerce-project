import { Box, Stack, Typography, TextField, Button } from "@mui/material";

//// custom component
import SelectMenu from "../SelectMenu/SelectMenu.jsx"
import SearchBar from "./SearchBar.jsx"

const FilterBar = ({ title, sorting, setSorting, sortingOptions, UiLimit, setLimit, setUiLimit, handelFilterSearch, searchName, resetSearch }) => {
    return (
        <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
            flexWrap={"wrap"}
            gap={3}
            sx={{ bgcolor: "sectionBgColor.main", p: 2, borderRadius: ".625rem", boxShadow: "rgba(0, 0, 0, 0.24) 0rem .1875rem .5rem;" }}
        >
            <Box sx={{ display: "flex", alignItems: "center", width: "100%", gap: 2, flexWrap: "wrap" }}>

                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: "bold",
                        fontSize: { xs: "1.25rem", sm: "1.25rem" },
                        width: { xs: "100%", sm: "auto" },
                    }}
                >
                    Filter {title}
                </Typography>

                <Box className="flex-between" sx={{ gap: 2, flexGrow: { xs: 1, sm: 0 } }}>
                    <SelectMenu minWidth="8.75rem" options={sortingOptions} selectedOption={sorting} setSelectedOption={setSorting} />
                    <TextField
                        fullWidth
                        label={"---- items num ----"}
                        type="number"
                        id={"12345567899"}
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
                            width: "8.75rem",
                            flexGrow: 1,
                            maxHeight: "2.2rem",
                            "input": {
                                textAlign: "center", p: .76,
                            },
                            ".MuiOutlinedInput-notchedOutline.css-9425fu-MuiOutlinedInput-notchedOutline": {
                                borderRadius: ".5rem",
                            }
                        }}
                    />

                </Box>

                <SearchBar handelFilterSearch={handelFilterSearch} searchName={searchName} resetSearch={resetSearch} />
            </Box>
        </Stack>
    )
}


export default FilterBar;