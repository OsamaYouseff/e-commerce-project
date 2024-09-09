//// custom components
import ProductForm from "../ProductForm/ProductForm";

///// hooks
import { useEffect, useState } from "react";
import LoaderComponent from "../../../../../../shared_files/LoaderComponent/LoaderComponent.jsx";
import { SomeThingWrong } from "../../../../../../shared_files/SomeThingWrong/SomeThingWrong.jsx";
import toast from "react-hot-toast";

// redux
import { useParams } from "react-router-dom";
import { editProductReducer, getAProductReducer } from "../../../../redux/ProductSlice/ApiProductSlice";
import { useDispatch, useSelector } from "react-redux";
import { PrintErrors } from "../../../../../../shared_files/General/GeneralFunctions.js";
import { IsUserLoggedIn, ValidateProductInfoForm } from "../../../../General/GeneralFunctions.js";



const EditProduct = () => {

    const dispatch = useDispatch();
    const product = useSelector((state) => state.ProductsApiRequest.singleProduct);
    const isLoading = useSelector((state) => state.ProductsApiRequest.isLoading);
    const error = useSelector((state) => state.ProductsApiRequest.error);
    const { elementId } = useParams();

    useEffect(() => {
        dispatch(getAProductReducer(elementId));
    }, []);

    const handelEditProduct = async (formData) => {

        let errors = await ValidateProductInfoForm(formData);

        if (Object.keys(errors.errors).length > 0) {
            let errorMessage = PrintErrors(errors.errors);
            toast.error(errorMessage)
            return;
        }


        if (IsUserLoggedIn()) {
            await dispatch(editProductReducer(formData));
        } else {
            toast.error("Your not authorized to do this action🙂");
            setTimeout(() => {
                GoLoginPage();

            }, 1000);
        }
    };



    if (isLoading || product._id === null) return (<LoaderComponent />)
    if (error) return <SomeThingWrong />

    return <ProductForm productFrom={product}
        handelBtnName="Update"
        mainTitle="Edit Product"
        handelSubmitForm={handelEditProduct}
        cancelBtnName={"cancel"}

    />

};



export default EditProduct;
