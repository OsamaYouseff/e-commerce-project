import { configureStore } from '@reduxjs/toolkit'

import ProductsApiReducer from "./ApiProductSlice"
import CustomerApiReducer from "./ApiCustomerSlice"
import CartApiReducer from "./ApiCartSlice"

export const store = configureStore({
    reducer: {
        ProductsApiRequest: ProductsApiReducer,
        CustomerApiRequest: CustomerApiReducer,
        CartApiRequest: CartApiReducer,
    },
})

