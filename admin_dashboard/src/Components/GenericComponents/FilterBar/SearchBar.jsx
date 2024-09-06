import { Box, TextField, Button } from "@mui/material";

//// icons
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from "react";


const SearchBar = ({ handelFilterSearch, searchName, resetSearch }) => {
    const [searchValue, setSearchValue] = useState("");

    const applySearch = (value) => {
        if (`${value}`.trim() === "") return;
        handelFilterSearch(`${value}`.trim());
    }

    const handelResetSearch = async () => {
        if (`${searchValue}`.trim() === "") return;
        setSearchValue("");
        resetSearch();
    }


    return (
        <Box className="flex-between " sx={{
            position: "relative", flexGrow: { xs: 1, sm: 0 },
            gap: 1,
        }}>
            <TextField
                fullWidth
                type="text"
                id={"4564545"}
                size="small"
                placeholder={searchName}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                sx={{
                    width: { xs: "100%", sm: "240px", md: "300px" },
                    maxHeight: "2.2rem",
                    flexGrow: { xs: 1, sm: 0 },
                    "input": {
                        textAlign: "start", p: 0.76,
                        pl: 5
                    },
                    ".MuiOutlinedInput-notchedOutline.css-9425fu-MuiOutlinedInput-notchedOutline": {
                        borderRadius: "8px",
                    },
                }}
            />
            <SearchIcon sx={{
                position: "absolute", top: "50%", left: "10px", transform: "translateY(-50%)",
                color: "gray",
            }} />
            <CloseIcon onClick={() => handelResetSearch()} sx={{
                position: "absolute", top: "50%", left: { xs: "77%", sm: "63%", md: "68%" }, transform: "translateY(-50%)",
                color: "gray", cursor: "pointer",
            }} />

            <Button variant="outlined"
                sx={{
                    fontWeight: "bolder", maxHeight: "2.2rem", borderRadius: "8px"
                }}
                onClick={() => applySearch(searchValue)}
            >
                Search
            </Button>

        </Box >
    )
}

export default SearchBar;