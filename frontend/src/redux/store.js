import { configureStore } from '@reduxjs/toolkit'

import ProductsApiReducer from "./ProductSlice/ApiProductSlice"
import CustomerApiReducer from "./CustomerSlice/ApiCustomerSlice"
import CartApiReducer from "./CartSlice/ApiCartSlice"
import AddressesApiReducer from "./AddressSlice/ApiAddressSlice"
import WishlistApiReducer from "./WishlistSlice/ApiWishlistSlice"

export const store = configureStore({
    reducer: {
        ProductsApiRequest: ProductsApiReducer,
        CustomerApiRequest: CustomerApiReducer,
        CartApiRequest: CartApiReducer,
        AddressesApiRequest: AddressesApiReducer,
        WishlistApiRequest: WishlistApiReducer,
    },
})

