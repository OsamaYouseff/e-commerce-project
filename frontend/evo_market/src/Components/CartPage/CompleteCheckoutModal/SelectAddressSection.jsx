/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { Box, Button } from "@mui/material";
import { useEffect } from "react";

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


/// custom component
import LoaderComponent from "../../../../../shared_files/LoaderComponent/LoaderComponent.jsx";
import AddressCardMin from "./AddressCardMin";
import { SomeThingWrong } from "../../../../../shared_files/SomeThingWrong/SomeThingWrong.jsx";

//// General Vars & Functions
import { IsUserLoggedIn } from "../../../General/GeneralFunctions.js";

// redux
import { useDispatch, useSelector } from "react-redux";
import { getCustomerAddressesReducer, getCustomerAddressReducer } from "../../../redux/AddressSlice/ApiAddressSlice";
import { Link } from "react-router-dom";


const SelectAddressSection = ({ selectedAddressId }) => {
    const dispatch = useDispatch();
    const customerAddresses = useSelector((state) => state.AddressesApiRequest.response);
    const isLoading = useSelector((state) => state.AddressesApiRequest.isLoading);
    const error = useSelector((state) => state.AddressesApiRequest.error);
    const message = useSelector((state) => state.AddressesApiRequest.message);
    // console.log(customerAddresses)

    const handelSelectedAddress = (newSelectedAddressId) => {

        if (IsUserLoggedIn() && newSelectedAddressId !== selectedAddressId) {
            dispatch(getCustomerAddressReducer(newSelectedAddressId))
        }
    }
    const showAddresses = () => {
        if (error) {
            return (
                <SomeThingWrong minHeight={"50vh"} errorMsg={message} />
            );
        }
        else if (customerAddresses) {
            return customerAddresses.map((address) => {
                return (
                    <AddressCardMin
                        key={address._id}
                        address={address}
                        selectedAddressId={selectedAddressId}
                        handelSelectedAddress={handelSelectedAddress}
                    />
                );
            });
        } else {
            return <Box>You do not have any addresses</Box>;
        }
    };

    useEffect(() => {
        if (IsUserLoggedIn()) {
            dispatch(getCustomerAddressesReducer())
        }
    }, []);

    return (
        <Box >

            <Accordion sx={{
                bgcolor: "sectionBgColor.main",
            }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                    sx={{
                        ".MuiAccordionSummary-content": {
                            display: "flex", justifyContent: "space-between ",
                            alignItems: "center"
                        },
                        fontWeight: "bolder",
                        gap: 2,
                    }}
                >
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: "bolder", mr: 1 }}
                    >
                        Change address
                    </Button>
                    <Button size="small" variant="outlined" sx={{ fontWeight: "bolder", "a": { textDecoration: "none", color: "inherit" } }} color="secondary">
                        <Link to="/userInfo/add-address" className="flex-center"  >
                            Add new Address
                        </Link>
                    </Button>


                </AccordionSummary>
                <AccordionDetails className="flex-column-center" sx={{ gap: 2, p: 0 }}>
                    {isLoading ? <LoaderComponent /> : showAddresses()}
                </AccordionDetails>

            </Accordion>

        </Box>
    );
}


export default SelectAddressSection;