//// custom components
import ProductForm from "../ProductForm/ProductForm";
import toast from "react-hot-toast";


//// redux
import { useDispatch } from "react-redux";
import { addNewProductReducer } from "../../../../redux/ProductSlice/ApiProductSlice";

//// General functions
import { GoLoginPage, IsUserLoggedIn, ValidateProductInfoForm } from "../../../../General/GeneralFunctions.js";
import { PrintErrors } from "../../../../../../shared_files/General/GeneralFunctions.js";


const AddProduct = () => {

    const formData = {
        title: "",
        desc: "",
        img: "",
        categories: [],
        size: "",
        color: "",
        price: 1,
        rating: 0,
        amount: 1,
        isDeleted: false,
    };

    const dispatch = useDispatch();

    const handelCreateProduct = async (formData) => {

        let errors = await ValidateProductInfoForm(formData);

        if (Object.keys(errors.errors).length > 0) {
            let errorMessage = PrintErrors(errors.errors);
            toast.error(errorMessage)
            return;
        }


        if (IsUserLoggedIn()) {
            await dispatch(addNewProductReducer(formData));
        } else {
            toast.error("Your not authorized to do this action🙂");
            setTimeout(() => {
                GoLoginPage();

            }, 1000);
        }
    };


    return <ProductForm productFrom={formData}
        handelBtnName={"Add"} mainTitle={"Add New Product"}
        handelSubmitForm={handelCreateProduct}
        cancelBtnName={"reset"}
    />
};



export default AddProduct;
