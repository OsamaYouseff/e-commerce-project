import { FormControl, MenuItem, Select } from "@mui/material";
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import OutlinedInput from '@mui/material/OutlinedInput';

///// hooks
import { useState } from "react";


const mainBorderColor = "#7a7a7acc"
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const SelectComponent = ({ category = [], handelFormData }) => {

    const categories = [
        "electronics",
        "clothing",
        "home & kitchen",
        "beauty & personal care",
        "books",
        "toys & games",
        "sports & outdoors",
        "automotive",
        "jewelry",
        "shoes",
        "health & wellness",
        "pet supplies",
        "garden & outdoor",
        "furniture",
        "office supplies",
        "tools & home improvement",
        "groceries",
        "baby products",
        "computers & accessories",
        "cameras & photography",
        "music instruments",
        "video games",
        "watches",
        "luggage & travel gear",
        "appliances"
    ];


    const handleChangeCategories = (event) => {
        const { target: { value } } = event;

        typeof value === 'string' ?
            handelFormData("categories", value.split(',')) : handelFormData("categories", value);
    };

    return (
        <div>
            <FormControl sx={{ m: 1, width: "100%" }}>
                <InputLabel id="demo-multiple-checkbox-label">Categories</InputLabel>
                <Select
                    labelId="demo-multiple-checkbox-label"
                    id="demo-multiple-checkbox"
                    multiple
                    value={category}
                    onChange={handleChangeCategories}
                    input={<OutlinedInput label="Categories" />}
                    renderValue={(selected) => selected.join(', ')}
                    MenuProps={MenuProps}
                >
                    {categories.map((name) => (
                        <MenuItem key={name} value={name}>
                            <Checkbox checked={category.indexOf(name) > -1} />
                            <ListItemText primary={name} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );

}


export default SelectComponent;