/* eslint-disable react/prop-types */
import { createContext, useReducer } from "react";
export const CustomerContext = createContext({});
export const CartContext = createContext({});

//// Reducers
import CartActionsReducer from "../Reducers/CartActionsReducer";
import customerApiReducer from "../Reducers/ApiReducer";
let customerInfo;

export const CustomerProvider = ({ children }) => {
    const [cartData, cartDataDispatch] = useReducer(CartActionsReducer, {
        cartItems: [
            {
                id: 1,
                imageURL:
                    "https://resource.logitech.com/w_1600,c_limit,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/headsets/zone-300/gallery/zone-300-offwhite-1.png?v=1",
                title: "Fancy Headset",
                price: 130,
                quantity: 2,
            },
        ],
        totalCartPrice: 260,
    });

    if (localStorage.getItem("customerInfo"))
        customerInfo = JSON.parse(localStorage.getItem("customerInfo"));
    else if (sessionStorage.getItem("customerInfo"))
        customerInfo = JSON.parse(sessionStorage.getItem("customerInfo"));
    else {
        customerInfo = {
            id: null,
            firstname: "",
            lastname: "",
            username: "",
            email: "",
            address: "",
            gender: "",
            phone: "",
            createdAt: "",
            updatedAt: "",
        };
    }

    const [customerData, customerDataDispatch] = useReducer(
        customerApiReducer,
        customerInfo
    );

    return (
        <CustomerContext.Provider
            value={{ customerData, customerDataDispatch }}
        >
            <CartContext.Provider value={{ cartData, cartDataDispatch }}>
                {children}
            </CartContext.Provider>
        </CustomerContext.Provider>
    );
};

// id: 2,
// username: "osamayousef",
// email: "osamayousef@gmail.com",
// provider: "local",
// confirmed: true,
// blocked: false,
// createdAt: "2024-07-16T17:52:47.827Z",
// updatedAt: "2024-07-21T15:55:46.098Z",
// Address: null,
// Gender: null,
// PhoneNumber: null,
// FirstName: null,
// LastName: null
// export const CustomerContext = createContext({
//     // personalInfo: null,

//     personalInfo: {
//         Address: "Street 2 on the the city4 ",
//         Email: "Osama@gmail.com",
//         FirstName: "Osama",
//         Gender: "Male",
//         LastName: "Yousef",
//         PhoneNumber: "01234567843",
//         createdAt: "2024-07-11T11:33:34.877Z",
//         locale: "en",
//         publishedAt: "2024-07-11T11:33:34.171Z",
//         updatedAt: "2024-07-11T11:33:34.877Z",
//     },
//     // cartData: [],
//     cartData: [
//         {
//             id: 1,
//             imageURL: "./images/banner-17.jpg",
//             title: "Product 1",
//             price: 80,
//             quantity: 5
//         },
//         {
//             id: 2,
//             imageURL: "./images/banner-17.jpg",
//             title: "Product 1",
//             price: 110,
//             quantity: 2
//         },
//         {
//             id: 3,
//             imageURL: "./images/banner-17.jpg",
//             title: "Product 1",
//             price: 430,
//             quantity: 1
//         },
//         {
//             id: 4,
//             imageURL: "./images/banner-17.jpg",
//             title: "Product 1",
//             price: 200,
//             quantity: 3
//         },
//         {
//             id: 5,
//             imageURL: "./images/banner-17.jpg",
//             title: "Product 1",
//             price: 190,
//             quantity: 2
//         },
//     ],
//     totalCartPrice: 0,
// });
