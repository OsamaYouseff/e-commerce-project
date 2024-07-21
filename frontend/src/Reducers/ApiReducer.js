import { createCustomerAccount } from "../API/APIFunctions";
import { customerLogin } from "../API/APIFunctions";

function GoHome() {
    document.querySelector(".go-home").click();
}

const ConnectWithApiReducer = async (currentCustomerInfo, action) => {

    let RegistrationSuccess = null;
    switch (action.type) {
        case "REGISTER":
            RegistrationSuccess = await createCustomerAccount(action.formData);

            if (RegistrationSuccess) GoHome();
            return;

        case "LOGIN":
            RegistrationSuccess = await customerLogin(action.payload.loginData, action.payload.rememberMe);

            if (RegistrationSuccess) GoHome();
            return;
        case "LOGOUT":
            localStorage.removeItem("customerInfo");
            localStorage.removeItem("token");
            sessionStorage.removeItem("customerInfo");
            sessionStorage.removeItem("token");
            return;
        default:
            alert("No case found");
            return;
    }
}

export default ConnectWithApiReducer;