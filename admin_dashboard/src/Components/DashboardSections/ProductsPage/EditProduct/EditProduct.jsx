//// custom components
import ProductForm from "../ProductForm/ProductForm";

///// hooks
import { useEffect, useState } from "react";
import LoaderComponent from "../../../GenericComponents/LoaderComponent/LoaderComponent";
import { SomeThingWrong } from "../../../../General/GeneralComponents"
import toast from "react-hot-toast";

// redux
import { useParams } from "react-router-dom";
import { editProductReducer, getAProductReducer } from "../../../../redux/ProductSlice/ApiProductSlice";
import { useDispatch, useSelector } from "react-redux";
import { PrintErrors, ValidateProductInfoForm } from "../../../../General/GeneralFunctions";



const EditProduct = () => {

    const dispatch = useDispatch();
    const product = useSelector((state) => state.ProductsApiRequest.singleProduct);
    const isLoading = useSelector((state) => state.ProductsApiRequest.isLoading);
    const error = useSelector((state) => state.ProductsApiRequest.error);
    const { productId } = useParams();

    useEffect(() => {
        dispatch(getAProductReducer(productId));
    }, []);


    const handelEditProduct = async (formData) => {

        let errors = await ValidateProductInfoForm(formData);

        if (Object.keys(errors.errors).length > 0) {
            let errorMessage = PrintErrors(errors.errors);
            toast.error(errorMessage)
            return;
        }

        await dispatch(editProductReducer(formData));

        // if (IsUserLoggedIn()) {
        // await dispatch(editProductReducer(formData));
        // } else toast.error("Your not authorized to add new product");
        //// TODO : after error redirect the user to login page

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
