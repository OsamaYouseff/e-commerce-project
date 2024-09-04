/* eslint-disable react/prop-types */
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { useTheme } from '@emotion/react';
import { ColorModeContext } from '../../../Theme/theme';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function ConfirmComponent({ openConfirmDialog, confirmAction, handleCloseConfirmDialog, message, actionName = "Delete Product" }) {
    const theme = useTheme(ColorModeContext);

    return (
        <React.Fragment >
            <Dialog
                open={openConfirmDialog}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleCloseConfirmDialog}
                aria-describedby="alert-dialog-slide-description"
                sx={{
                    ".MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation24.MuiDialog-paper": {
                        bgcolor: theme.palette.bgColor.main,
                        p: {
                            xs: 1,
                            sm: 2
                        },
                    }
                }}

            >
                <DialogTitle sx={{
                    p: 2
                }}>{`${actionName} Confirmation`}</DialogTitle>
                <DialogContent sx={{
                    p: 2
                }} >
                    <DialogContentText id="alert-dialog-slide-description" >
                        {message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button sx={{ fontWeight: 'bold' }} color='error' variant='outlined' onClick={handleCloseConfirmDialog}>Cancel</Button>
                    <Button
                        sx={{
                            fontWeight: 'bold',
                        }}
                        variant='outlined'
                        onClick={() => {
                            handleCloseConfirmDialog();
                            confirmAction();
                        }}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
