import { createCustomerAccount } from "../API/APIFunctions";

const ConnectWithApi = (caseType, FormData) => {
    switch (caseType) {
        case "RegisterCustomer":
            createCustomerAccount(FormData);
            return;

        default:
            alert("No case found");
            return;
    }
}

export default ConnectWithApi;