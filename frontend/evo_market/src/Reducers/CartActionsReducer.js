const CartActionsReducer = (CurrentCart, action) => {
    const targetID = action.payload.id;
    let updatedCartItem = [], updatedTotalCartPrice = 0, newItem = {};

    switch (action.type) {
        case "ADD_TO_CART":
            newItem = action.payload;

            return { ...CurrentCart, cartItems: [...CurrentCart.cartItems, newItem] }

        case "REMOVE_FROM_CART":
            CurrentCart.cartItems.forEach(item => {
                if (item.id !== targetID) {
                    updatedCartItem.push(item);
                    updatedTotalCartPrice += item.price * item.quantity;
                }
            });
            return {
                cartItems: updatedCartItem,
                totalCartPrice: updatedTotalCartPrice
            };


        case "CHANGE_QUANTITY":
            CurrentCart.cartItems.forEach(item => {
                if (item.id === targetID) {
                    item.quantity = action.payload.quantity;
                }
                updatedCartItem.push(item);
                updatedTotalCartPrice += item.price * item.quantity;
            });
            return {
                cartItems: updatedCartItem,
                totalCartPrice: updatedTotalCartPrice
            };


        case "INCREASE_QUANTITY":
            CurrentCart.cartItems.forEach(item => {
                if (item.id === targetID) {
                    item.quantity += 1;
                }
                updatedCartItem.push(item);
            });

            return {
                cartItems: updatedCartItem,
                totalCartPrice: CurrentCart.totalCartPrice + action.payload.price
            };


        case "DECREASE_QUANTITY":
            if (action.payload.quantity === 1) {
                return CurrentCart;
            }

            CurrentCart.cartItems.forEach(item => {
                if (item.id === targetID && item.quantity > 1) {
                    item.quantity -= 1;
                }
                updatedCartItem.push(item);
            });

            return {
                ...CurrentCart, cartItems: updatedCartItem,
                totalCartPrice: CurrentCart.totalCartPrice - action.payload.price
            };
        default:
            return CurrentCart;
    }



    //// Call API to Update Cart Data



}

export default CartActionsReducer;