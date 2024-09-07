import { configureStore } from '@reduxjs/toolkit'

import ProductsApiReducer from "./ProductSlice/ApiProductSlice"
import AdminApiReducer from "./AdminSlice/ApiAdminSlice.js"
import OrdersApiReducer from "./OrdersSlice/ApiOrdersSlice"

export const store = configureStore({
    reducer: {
        ProductsApiRequest: ProductsApiReducer,
        AdminApiRequest: AdminApiReducer,
        OrdersApiRequest: OrdersApiReducer,
    },
})

