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
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // ===============================
  // ADD TO CART
  // ===============================

  const addToCart = (product) => {
    let message = "";

    setCartItems((previousItems) => {
      const productId = product._id || product.id;

      const existingProduct = previousItems.find(
        (item) => (item._id || item.id) === productId
      );

      const stock = Number(product.stock ?? 0);

      // Product is completely out of stock
      if (stock <= 0) {
        message = `"${product.name}" is out of stock.`;
        return previousItems;
      }

      // Product already exists in cart
      if (existingProduct) {
        const currentQuantity = Number(
          existingProduct.quantity || 0
        );

        // Don't allow quantity above stock
        if (currentQuantity >= stock) {
          message = `Only ${stock} available for "${product.name}".`;
          return previousItems;
        }

        return previousItems.map((item) =>
          (item._id || item.id) === productId
            ? {
                ...item,
                quantity: currentQuantity + 1,
                stock: stock,
              }
            : item
        );
      }

      // Add new product
      return [
        ...previousItems,
        {
          ...product,
          quantity: 1,
          stock: stock,
        },
      ];
    });

    return message;
  };

  // ===============================
  // REMOVE FROM CART
  // ===============================

  const removeFromCart = (productId) => {
    setCartItems((previousItems) =>
      previousItems.filter(
        (item) => (item._id || item.id) !== productId
      )
    );
  };

  // ===============================
  // INCREASE QUANTITY
  // ===============================

  const increaseQuantity = (productId) => {
    let message = "";

    setCartItems((previousItems) =>
      previousItems.map((item) => {
        if ((item._id || item.id) !== productId) {
          return item;
        }

        const stock = Number(item.stock ?? 0);
        const currentQuantity = Number(item.quantity || 0);

        if (stock <= 0) {
          message = `"${item.name}" is out of stock.`;
          return item;
        }

        if (currentQuantity >= stock) {
          message = `Only ${stock} available for "${item.name}".`;
          return item;
        }

        return {
          ...item,
          quantity: currentQuantity + 1,
        };
      })
    );

    return message;
  };

  // ===============================
  // DECREASE QUANTITY
  // ===============================

  const decreaseQuantity = (productId) => {
    setCartItems((previousItems) =>
      previousItems
        .map((item) =>
          (item._id || item.id) === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
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
    (total, item) => total + item.quantity,
    0
  );

  // ===============================
  // CART TOTAL
  // ===============================

  const cartTotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.price || 0) * item.quantity,
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
        cartTotal,
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