/* eslint-disable react-hooks/exhaustive-deps */
// redux
import { useSelector, useDispatch } from "react-redux";

import { Box, Container, Stack, Typography, Button, } from "@mui/material";
import { useEffect, useState } from "react";
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded';
import LocalAtmRoundedIcon from '@mui/icons-material/LocalAtmRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';

const categoryOptions = ["All Category", "Clothes", "Electronics", "Furniture"];
const sortingOptions = ["Asc", "Desc"];

const HomePage = () => {
    const iconStyles = {
        borderRadius: "50%",
        border: "1px solid transparent",
        fontSize: { xs: "4rem", sm: "3rem" },
        p: 1,
    }

    return (
        <Container
            maxWidth="xl" py={3}
            sx={{
                px: { xs: 1, sm: 1, md: 2, lg: 3 },
                flexGrow: 1,
                minHeight: "inherit",
            }}
        >
            <Typography variant="h1" sx={{ fontWeight: "bold", my: 3, fontSize: "1.5rem" }}>Dashboard</Typography>
            <Box className="flex-between" sx={{
                gap: 3,
                // flexDirection: { xs: "column", sm: "column", md: "row", lg: "row" },
                flexWrap: "wrap",

            }}>
                <StatisticsBoxComponent title="Total customers" value="765" icon={<Groups2RoundedIcon sx={{ ...iconStyles, bgcolor: "#ff5a1f" }} />} />
                <StatisticsBoxComponent title="Total income" value="$ 6,760.89" icon={<LocalAtmRoundedIcon sx={{ ...iconStyles, bgcolor: "#0e9f6e" }} />} />
                <StatisticsBoxComponent title="New Orders" value="150" icon={<ShoppingCartRoundedIcon sx={{ ...iconStyles, bgcolor: "#3f83f8" }} />} />
                <StatisticsBoxComponent title="Unread Chats" value="15" icon={<ChatRoundedIcon sx={{ ...iconStyles, bgcolor: "#0694a2" }} />} />
            </Box>

            <Box className="flex-between" sx={{
                my: 4,
                flexWrap: { xs: "wrap", sm: "wrap", md: "nowrap", lg: "nowrap" },

            }}>
                <PieActiveArcComponent />
                <TickPlacementBars />
            </Box>
        </Container >
    )
}

const StatisticsBoxComponent = ({ title, value, icon, iconColor }) => {

    return (

        < Box className="flex-center" sx={{
            flexGrow: 1,
            // maxWidth: "100%",
            gap: { xs: 4, sm: 2 },
            bgcolor: "bgColor.main",
            py: 2.5,
            px: 4,
            borderRadius: 2,
            mx: { xs: 1, sm: 0 },
        }}>
            {/* <Groups2RoundedIcon sx={{ ...iconStyles, bgcolor: iconColor }} /> */}
            {icon}
            <Stack gap={1} sx={{ minWidth: { xs: "150px", sm: "100px" } }}>
                <Typography variant="h5" sx={{ fontSize: { xs: "1.2rem", sm: "0.8rem" } }}>{title}</Typography>
                <Typography variant="h5" sx={{ fontSize: { xs: "2rem", sm: "1.2rem" } }}>{value}</Typography>
            </Stack>
        </ Box>
    );
}





import { BarChart } from '@mui/x-charts/BarChart';
import * as React from 'react';

import { PieChart } from '@mui/x-charts/PieChart';
function PieActiveArcComponent() {
    const data = [
        { id: 0, value: 10, label: 'series A' },
        { id: 1, value: 15, label: 'series B' },
        { id: 2, value: 20, label: 'series C' },
    ];

    return (
        <PieChart
            series={[
                {
                    data,
                    highlightScope: { fade: 'global', highlight: 'item' },
                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                },
            ]}
            height={200}
        />
    );
}

import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import { dataset } from './dataset/weather';

function TickParamsSelector({
    tickPlacement,
    tickLabelPlacement,
    setTickPlacement,
    setTickLabelPlacement,
}) {
    return (
        <Stack direction="column" justifyContent="space-between" sx={{ width: '100%' }}>
            <FormControl>
                <FormLabel id="tick-placement-radio-buttons-group-label">
                    tickPlacement
                </FormLabel>
                <RadioGroup
                    row
                    aria-labelledby="tick-placement-radio-buttons-group-label"
                    name="tick-placement"
                    value={tickPlacement}
                    onChange={(event) => setTickPlacement(event.target.value)}
                >
                    <FormControlLabel value="start" control={<Radio />} label="start" />
                    <FormControlLabel value="end" control={<Radio />} label="end" />
                    <FormControlLabel value="middle" control={<Radio />} label="middle" />
                    <FormControlLabel
                        value="extremities"
                        control={<Radio />}
                        label="extremities"
                    />
                </RadioGroup>
            </FormControl>
            <FormControl>
                <FormLabel id="label-placement-radio-buttons-group-label">
                    tickLabelPlacement
                </FormLabel>
                <RadioGroup
                    row
                    aria-labelledby="label-placement-radio-buttons-group-label"
                    name="label-placement"
                    value={tickLabelPlacement}
                    onChange={(event) => setTickLabelPlacement(event.target.value)}
                >
                    <FormControlLabel value="tick" control={<Radio />} label="tick" />
                    <FormControlLabel value="middle" control={<Radio />} label="middle" />
                </RadioGroup>
            </FormControl>
        </Stack>
    );
}

const valueFormatter = (value) => `${value}mm`;

const chartSetting = {
    // yAxis: [
    //     {
    //         label: 'rainfall (mm)',
    //     },
    // ],
    series: [{ dataKey: 'seoul', label: 'New customers', valueFormatter }],
    height: 300,
    sx: {
        [`& .${axisClasses.directionY} .${axisClasses.label}`]: {
            transform: 'translateX(-10px)',
        },
    },
};

function TickPlacementBars() {
    const [tickPlacement, setTickPlacement] = React.useState('middle');
    const [tickLabelPlacement, setTickLabelPlacement] = React.useState('middle');

    return (
        <div style={{ width: '100%' }}>
            {/* <TickParamsSelector
                tickPlacement={tickPlacement}
                tickLabelPlacement={tickLabelPlacement}
                setTickPlacement={setTickPlacement}
                setTickLabelPlacement={setTickLabelPlacement}
            /> */}
            <BarChart
                dataset={dataset}
                xAxis={[
                    { scaleType: 'band', dataKey: 'month', tickPlacement, tickLabelPlacement },
                ]}
                {...chartSetting}
            />
        </div>
    );
}




export default HomePage;