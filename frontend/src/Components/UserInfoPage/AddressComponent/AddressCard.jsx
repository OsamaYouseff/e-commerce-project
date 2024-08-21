/* eslint-disable react/prop-types */
import { Box, Button, Stack, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import { ColorModeContext } from "../../../Theme/theme";
import { FormControlLabel } from "@mui/material";
import SwitchButton from "../../GenericComponents/SwitchButton/SwitchButton";
import toast from 'react-hot-toast';

//// router
import { useNavigate } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";

//// redux
import { useDispatch } from "react-redux";
import { deleteCustomerAddressReducer, setDefaultAddressReducer } from "../../../redux/AddressSlice/ApiAddressSlice";
import { IsUserLoggedIn } from "../../../General/GeneralFunctions";
import { useState } from "react";
import ConfirmComponent from "../../GenericComponents/ConfirmComponent/ConfirmComponent";

const AddressCard = ({ address, numOfAddresses }) => {
    const theme = useTheme(ColorModeContext);
    const navigate = useNavigate();

    /// redux
    const dispatch = useDispatch();

    const isDefault = address.isDefault;
    const isDisabled = address.isDefault && numOfAddresses === 1;
    // const [isDefault, setIsDefault] = useState(address.isDefault);

    //// Confirm Component
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const handleClickOpenConfirmDialog = () => setOpenConfirmDialog(true);
    const handleCloseConfirmDialog = () => setOpenConfirmDialog(false);


    //// handlers
    const confirmDeleteAddress = () => {
        if (IsUserLoggedIn())
            dispatch(deleteCustomerAddressReducer(address._id));
        else toast.error("Please log in or sign up with new account🙂");
    }
    const handelDeleteAddress = () => {
        handleClickOpenConfirmDialog();
    };
    const handelSetDefault = async () => {
        if (isDefault || isDisabled) {
            toast.error("There must be at least one default address");
            return;
        }
        // if (!isDisabled) setIsDefault(!isDefault);

        if (IsUserLoggedIn())
            await dispatch(setDefaultAddressReducer(address._id));
        else toast.error("Please log in or sign up with new account🙂");

        // window.location.reload();
    };
    const handelUpdateAddress = async () => {
        await sessionStorage.setItem("edited-address", JSON.stringify(address));

        navigate(`/userInfo/update-address/${address._id}`);
    };

    return (
        <AnimatePresence>
            <Box
                component={motion.section}
                layout
                initial={{ transform: "scale(0)" }}
                animate={{ transform: "scale(1)" }}
                exit={{ transform: "scale(1)" }}
                transition={{
                    duration: 0.35,
                    type: "tween",
                    stiffness: 40,
                }}
                sx={{
                    bgcolor: theme.palette.natural.main,
                    px: { xs: 2, sm: 3 },
                    pt: { xs: 1, sm: 2 },
                    pb: 2,
                    borderRadius: "6px",
                    boxShadow: 1,
                    maxWidth: { xs: "100%", md: "800px", lg: "1000px" },
                }}
            >
                <Stack
                    direction={"row"}
                    justifyContent={"space-between"}
                    alignItems={"center"}
                    sx={{ flexDirection: { xs: "column-reverse", sm: "row" } }}
                >
                    <Typography
                        sx={{
                            fontWeight: "bolder",
                            width: { xs: "100%", sm: "fit-content" },
                            fontSize: "18px",
                            my: 1
                        }}
                    >
                        {address.label} Address
                    </Typography>
                    <Box
                        className="flex-between"
                        sx={{ gap: { xs: 1, md: 2 } }}
                    >
                        <Button
                            variant="outlined"
                            onClick={handelUpdateAddress}
                            sx={{ fontWeight: "bolder" }}
                        >
                            Edit
                        </Button>

                        <Button
                            onClick={() => handelDeleteAddress()}
                            variant="outlined"
                            color="error"
                            sx={{ fontWeight: "bolder" }}
                        >
                            Delete
                        </Button>
                        <FormControlLabel
                            control={
                                <SwitchButton
                                    sx={{
                                        m: { xs: 0.5, md: 1 },
                                        cursor: !isDisabled
                                            ? "pointer"
                                            : "not-allowed",
                                    }}
                                    defaultChecked
                                />
                            }
                            label="Default address"
                            labelPlacement="start"
                            disabled={isDisabled}
                            onClick={() => {
                                handelSetDefault();
                            }}
                            checked={isDefault}
                            sx={{
                                gap: 1,
                                maxWidth: { xs: "130px", sm: "fit-content" },
                            }}
                        />
                    </Box>
                </Stack>

                <Stack className="flex-start-row" gap={4}>
                    <p style={{ fontWeight: "bolder", minWidth: "70px" }}>
                        Name
                    </p>
                    <Box
                        className="flex-between"
                        sx={{ gap: 2, fontWeight: "bolder" }}
                    >
                        {address.firstName + " " + address.lastName}
                    </Box>
                </Stack>

                <Stack
                    mt={2}
                    className="flex-start-row"
                    gap={4}
                    sx={{
                        maxWidth: { xs: "100%", md: "390px" },
                        alignItems: "flex-start",
                    }}
                >
                    <p
                        style={{
                            fontWeight: "bolder",
                            marginTop: 0,
                            minWidth: "70px",
                        }}
                    >
                        Address
                    </p>
                    <Box
                        className="flex-center"
                        sx={{ gap: 2, fontWeight: "bolder" }}
                    >
                        {address.fullAddress}
                    </Box>
                </Stack>

                <Stack className="flex-start-row" gap={4}>
                    <p style={{ fontWeight: "bolder", minWidth: "70px" }}>
                        Phone
                    </p>
                    <Box
                        className="flex-between"
                        sx={{ gap: 2, fontWeight: "bolder" }}
                    >
                        {address.phoneNumber}
                    </Box>
                </Stack>
                {
                    openConfirmDialog && <ConfirmComponent
                        openConfirmDialog={openConfirmDialog}
                        confirmAction={confirmDeleteAddress}
                        handleCloseConfirmDialog={handleCloseConfirmDialog}
                        message="Are you sure you want to delete this address?"
                    />
                }
            </Box>
        </AnimatePresence>
    );
};

export default AddressCard;
