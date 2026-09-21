import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  // =====================================================
  // LOAD CART FROM LOCAL STORAGE
  // =====================================================

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cart");

      if (!savedCart) {
        return [];
      }

      const parsedCart = JSON.parse(savedCart);

      if (!Array.isArray(parsedCart)) {
        return [];
      }

      return parsedCart.map((item) => ({
        ...item,
        quantity: Math.max(
          1,
          Number(item.quantity) || 1
        ),
        stock: Number(item.stock) || 0,
      }));
    } catch (error) {
      console.error(
        "Error loading cart:",
        error
      );

      return [];
    }
  });

  // =====================================================
  // SAVE CART TO LOCAL STORAGE
  // =====================================================

  useEffect(() => {
    localStorage.setItem(
      "cart",
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  // =====================================================
  // GET PRODUCT ID
  // =====================================================

  const getProductId = (item) => {
    return String(item._id || item.id || "");
  };

  // =====================================================
  // ADD TO CART
  // =====================================================

  const addToCart = (product) => {
    let message = "";

    const productId = String(
      product._id || product.id || ""
    );

    const stock = Number(product.stock ?? 0);

    if (!productId) {
      return "Unable to add this product to cart.";
    }

    setCartItems((previousItems) => {
      const existingProduct =
        previousItems.find(
          (item) =>
            getProductId(item) === productId
        );

      // -----------------------------------------------
      // OUT OF STOCK
      // -----------------------------------------------

      if (stock <= 0) {
        message = `"${product.name}" is out of stock.`;

        return previousItems;
      }

      // -----------------------------------------------
      // PRODUCT ALREADY EXISTS
      // -----------------------------------------------

      if (existingProduct) {
        const currentQuantity = Math.max(
          0,
          Number(existingProduct.quantity) || 0
        );

        if (currentQuantity >= stock) {
          message = `Only ${stock} available for "${product.name}".`;

          return previousItems;
        }

        return previousItems.map((item) => {
          if (getProductId(item) !== productId) {
            return item;
          }

          return {
            ...item,
            quantity: currentQuantity + 1,
            stock: stock,
          };
        });
      }

      // -----------------------------------------------
      // NEW PRODUCT
      // -----------------------------------------------

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

  // =====================================================
  // REMOVE FROM CART
  // =====================================================

  const removeFromCart = (productId) => {
    const id = String(productId);

    setCartItems((previousItems) =>
      previousItems.filter(
        (item) =>
          getProductId(item) !== id
      )
    );
  };

  // =====================================================
  // INCREASE QUANTITY
  // =====================================================

  const increaseQuantity = (productId) => {
    const id = String(productId);

    setCartItems((previousItems) =>
      previousItems.map((item) => {
        if (getProductId(item) !== id) {
          return item;
        }

        const stock = Number(item.stock ?? 0);

        const currentQuantity = Math.max(
          1,
          Number(item.quantity) || 1
        );

        // ---------------------------------------------
        // OUT OF STOCK
        // ---------------------------------------------

        if (stock <= 0) {
          return item;
        }

        // ---------------------------------------------
        // STOCK LIMIT
        // ---------------------------------------------

        if (currentQuantity >= stock) {
          return item;
        }

        // ---------------------------------------------
        // INCREASE
        // ---------------------------------------------

        return {
          ...item,
          quantity: currentQuantity + 1,
        };
      })
    );
  };

  // =====================================================
  // DECREASE QUANTITY
  // =====================================================

  const decreaseQuantity = (productId) => {
    const id = String(productId);

    setCartItems((previousItems) =>
      previousItems
        .map((item) => {
          if (getProductId(item) !== id) {
            return item;
          }

          const currentQuantity = Math.max(
            1,
            Number(item.quantity) || 1
          );

          // -------------------------------------------
          // DECREASE
          // -------------------------------------------

          return {
            ...item,
            quantity: currentQuantity - 1,
          };
        })
        .filter(
          (item) =>
            Number(item.quantity) > 0
        )
    );
  };

  // =====================================================
  // CLEAR CART
  // =====================================================

  const clearCart = () => {
    setCartItems([]);
  };

  // =====================================================
  // CART COUNT
  // =====================================================

  const cartCount = cartItems.reduce(
    (total, item) =>
      total +
      (Number(item.quantity) || 0),
    0
  );

  // =====================================================
  // CART TOTAL
  // =====================================================

  const cartTotal = cartItems.reduce(
    (total, item) => {
      const price =
        Number(item.price) || 0;

      const quantity =
        Number(item.quantity) || 0;

      return total + price * quantity;
    },
    0
  );

  // =====================================================
  // CONTEXT
  // =====================================================

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

// =====================================================
// CUSTOM HOOK
// =====================================================

export function useCart() {
  return useContext(CartContext);
}