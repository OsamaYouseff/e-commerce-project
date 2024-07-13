import Zoom from '@mui/material/Zoom';
import Fab from '@mui/material/Fab';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import { useCallback } from 'react';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Box from '@mui/material/Box';

const ScrollToTop = () => {
    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }, []);

    const trigger = useScrollTrigger({
        // Number of pixels needed to scroll to toggle `trigger` to `true`.
        threshold: 100,
    });

    return (
        <Zoom in={trigger}>
            <Box
                role="presentation"
                // Place the button in the bottom right corner.
                sx={{
                    position: "fixed",
                    bottom: 32,
                    right: 32,
                    zIndex: 120,
                }}
            >
                <Fab
                    onClick={scrollToTop}
                    color="primary"
                    size="small"
                    aria-label="Scroll back to top"
                    variant = "extended"
                >
                    <KeyboardArrowUp fontSize="medium" />
                </Fab>
            </Box>
        </Zoom>
    );
}

export default ScrollToTop