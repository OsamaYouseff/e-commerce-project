/* eslint-disable react/prop-types */
import { createContext, useReducer, useState } from "react";
export const CustomerContext = createContext({});
export const CartContext = createContext({});

//// Reducers
import CartActionsReducer from "../Reducers/CartActionsReducer";

export const CustomerProvider = ({ children }) => {
    const [cartData, cartDataDispatch] = useReducer(CartActionsReducer, {
        cartItems: [
            {
                id: 1,
                image: "./images/banner-17.jpg",
                title: "Product 1",
                price: 20,
                quantity: 5,
            },
            {
                id: 2,
                image: "./images/banner-17.jpg",
                title: "Product 2",
                price: 30,
                quantity: 2,
            },
            {
                id: 3,
                image: "./images/banner-17.jpg",
                title: "Product 3",
                price: 40,
                quantity: 1,
            },
            {
                id: 4,
                image: "./images/banner-17.jpg",
                title: "Product 4",
                price: 50,
                quantity: 4,
            },
            {
                id: 5,
                image: "./images/banner-17.jpg",
                title: "Product 5",
                price: 100,
                quantity: 2,
            },
        ],
        totalCartPrice: 600,
    });

    const [customerData, setCustomerData] = useState({
        Address: "Street 2 on the the city4 ",
        Email: "Osama@gmail.com",
        FirstName: "Osama",
        Gender: "Male",
        LastName: "Yousef",
        PhoneNumber: "01234567843",
        createdAt: "2024-07-11T11:33:34.877Z",
        locale: "en",
        publishedAt: "2024-07-11T11:33:34.171Z",
        updatedAt: "2024-07-11T11:33:34.877Z",
        personalInfo: {},
    });

    return (
        <CustomerContext.Provider value={{ customerData, setCustomerData }}>
            <CartContext.Provider value={{ cartData, cartDataDispatch }}>
                {children}
            </CartContext.Provider>
        </CustomerContext.Provider>
    );
};

// Address: "Street 2 on the the city4 ",
// Email: "Osama@gmail.com",
// FirstName: "Osama",
// Gender: "Male",
// LastName: "Yousef",
// PhoneNumber: "01234567843",
// createdAt: "2024-07-11T11:33:34.877Z",
// locale: "en",
// publishedAt: "2024-07-11T11:33:34.171Z",
// updatedAt: "2024-07-11T11:33:34.877Z",

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
//             image: "./images/banner-17.jpg",
//             title: "Product 1",
//             price: 80,
//             quantity: 5
//         },
//         {
//             id: 2,
//             image: "./images/banner-17.jpg",
//             title: "Product 1",
//             price: 110,
//             quantity: 2
//         },
//         {
//             id: 3,
//             image: "./images/banner-17.jpg",
//             title: "Product 1",
//             price: 430,
//             quantity: 1
//         },
//         {
//             id: 4,
//             image: "./images/banner-17.jpg",
//             title: "Product 1",
//             price: 200,
//             quantity: 3
//         },
//         {
//             id: 5,
//             image: "./images/banner-17.jpg",
//             title: "Product 1",
//             price: 190,
//             quantity: 2
//         },
//     ],
//     totalCartPrice: 0,
// });
