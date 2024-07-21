/* eslint-disable react-hooks/exhaustive-deps */
/// Components
import { useEffect, useContext } from "react";
import HomePage from "./Components/HomePage/HomePage";
import { getCustomer } from "./API/APIFunctions";
import { CustomerContext } from "./Contexts/CustomerContext";


let personalInfo = {};

async function getCustomerInfo(customerId) {
    const data = await getCustomer(customerId).then((data) => data);
    personalInfo = data;
    console.log(personalInfo);
    return data;
}


function App() {
    // personalInfo = useContext(CustomerContext);

    // useEffect(() => {
    //     getCustomerInfo(4);
    // }, [])

    return (
        <div className="App">
            <HomePage />
        </div>
    );
}
export default App;
