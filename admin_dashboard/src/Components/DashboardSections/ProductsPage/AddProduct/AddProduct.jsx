//// custom components
import ProductForm from "../ProductForm/ProductForm";
import toast from "react-hot-toast";


//// redux
import { useDispatch } from "react-redux";
import { addNewProductReducer } from "../../../../redux/ProductSlice/ApiProductSlice";

//// General functions
import { PrintErrors, ValidateProductInfoForm } from "../../../../General/GeneralFunctions";


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

        await dispatch(addNewProductReducer(formData));

        // if (IsUserLoggedIn()) {
        // await dispatch(addNewProductReducer(formData));
        // } else toast.error("Your not authorized to add new product");
        //// TODO : after error redirect the user to login page

    };


    return <ProductForm productFrom={formData}
        handelBtnName={"Add"} mainTitle={"Add New Product"}
        handelSubmitForm={handelCreateProduct}
        cancelBtnName={"reset"}
    />
};



export default AddProduct;
