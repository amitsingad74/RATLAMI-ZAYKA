import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {

  // ===============================
  // LOAD CART FROM LOCALSTORAGE
  // ===============================

  const [cartItems, setCartItems] = useState(() => {

    const savedCart = localStorage.getItem("cart");

    return savedCart ? JSON.parse(savedCart) : [];

  });


  // ===============================
  // SAVE CART TO LOCALSTORAGE
  // ===============================

  useEffect(() => {

    localStorage.setItem(
      "cart",
      JSON.stringify(cartItems)
    );

  }, [cartItems]);


  // ===============================
  // ADD TO CART
  // ===============================

  const addToCart = (product) => {

    setCartItems((previousItems) => {

      // Check if product already exists
      const existingProduct = previousItems.find(
        (item) => item.id === product.id
      );


      // If product exists → increase quantity
      if (existingProduct) {

        return previousItems.map((item) =>

          item.id === product.id

            ? {
                ...item,
                quantity: item.quantity + 1
              }

            : item

        );

      }


      // Add new product
      return [

        ...previousItems,

        {
          ...product,
          quantity: 1
        }

      ];

    });

  };


  // ===============================
  // REMOVE FROM CART
  // ===============================

  const removeFromCart = (productId) => {

    setCartItems((previousItems) =>

      previousItems.filter(
        (item) => item.id !== productId
      )

    );

  };


  // ===============================
  // INCREASE QUANTITY
  // ===============================

  const increaseQuantity = (productId) => {

    setCartItems((previousItems) =>

      previousItems.map((item) =>

        item.id === productId

          ? {
              ...item,
              quantity: item.quantity + 1
            }

          : item

      )

    );

  };


  // ===============================
  // DECREASE QUANTITY
  // ===============================

  const decreaseQuantity = (productId) => {

    setCartItems((previousItems) =>

      previousItems
        .map((item) =>

          item.id === productId

            ? {
                ...item,
                quantity: item.quantity - 1
              }

            : item

        )
        .filter(
          (item) => item.quantity > 0
        )

    );

  };


  // ===============================
  // CLEAR CART
  // ===============================

  const clearCart = () => {

    setCartItems([]);

  };


  // ===============================
  // CART COUNT
  // ===============================

  const cartCount = cartItems.reduce(

    (total, item) =>

      total + item.quantity,

    0

  );


  // ===============================
  // CART TOTAL
  // ===============================

  const cartTotal = cartItems.reduce(

    (total, item) =>

      total + item.price * item.quantity,

    0

  );


  return (

    <CartContext.Provider

      value={{

        cartItems,

        addToCart,

        removeFromCart,

        increaseQuantity,

        decreaseQuantity,

        clearCart,

        cartCount,

        cartTotal

      }}

    >

      {children}

    </CartContext.Provider>

  );

}


// ===============================
// CUSTOM HOOK
// ===============================

export function useCart() {

  return useContext(CartContext);

}