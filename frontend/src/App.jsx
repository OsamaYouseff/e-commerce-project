/* eslint-disable react-hooks/exhaustive-deps */
/// Components
import { useEffect, useContext } from "react";
import HomePage from "./Components/HomePage/HomePage";
import { CustomerContext } from "./Contexts/CustomerContext";

function App() {
    return (
        <div className="App">
            <HomePage />
        </div>
    );
}
export default App;
