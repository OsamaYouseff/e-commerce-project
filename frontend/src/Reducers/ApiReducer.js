/* eslint-disable no-case-declarations */
import { registerACustomer, customerLogin, updateCustomerAccount } from "../API/APIFunctions";

function GoHome() {
    document.querySelector(".go-home").click();
}

const customerApiReducer = async (currentCustomerInfo, action) => {

    let actionSuccess = null;

    switch (action.type) {
        case "REGISTER":
            actionSuccess = await registerACustomer(action.formData);

            if (actionSuccess) GoHome();
            break;

        case "LOGIN":
            actionSuccess = await customerLogin(action.payload.loginData, action.payload.rememberMe);
            if (actionSuccess) GoHome();
            break;
        case "LOGOUT":
            localStorage.removeItem("customerInfo");
            localStorage.removeItem("token");
            sessionStorage.removeItem("customerInfo");
            sessionStorage.removeItem("token");
            break;

        case "UPDATE_USER_DATA":
            await updateCustomerAccount(action.payload);

            break;
        default:
            alert("No case found");
            break;
    }
}

export default customerApiReducer;