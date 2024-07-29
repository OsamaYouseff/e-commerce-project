import { configureStore } from '@reduxjs/toolkit'

import ProductsApiReducer from "./ApiProductSlice"
import CustomerApiReducer from "./ApiCustomerSlice"

export const store = configureStore({
    reducer: {
        ProductsApiRequest: ProductsApiReducer,
        CustomerApiRequest: CustomerApiReducer,
    },
})

