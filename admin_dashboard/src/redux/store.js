import { configureStore } from '@reduxjs/toolkit'

import ProductsApiReducer from "./ProductSlice/ApiProductSlice"
import CustomerApiReducer from "./CustomerSlice/ApiCustomerSlice"
import OrdersApiReducer from "./OrdersSlice/ApiOrdersSlice"

export const store = configureStore({
    reducer: {
        ProductsApiRequest: ProductsApiReducer,
        CustomerApiRequest: CustomerApiReducer,
        OrdersApiRequest: OrdersApiReducer,
    },
})

