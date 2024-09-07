import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Box } from '@mui/material';
const PieActiveArcComponent = () => {
    const data = [
        { id: 0, value: 10, label: 'series A' },
        { id: 1, value: 15, label: 'series B' },
        { id: 2, value: 20, label: 'series C' },
    ];

    return (
        <Box className="flex-center" sx={{ backgroundColor: "bgColor.main", borderRadius: 2, width: "100%", height: { xs: "12.5rem", sm: "18.75rem" } }}
        >
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
        </Box>
    );
}

export default PieActiveArcComponent;
