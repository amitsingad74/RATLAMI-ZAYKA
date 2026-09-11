import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();

  return (
    <div className="cart-page">

      <div className="cart-header">

        <p className="section-tag">
          YOUR SHOPPING BAG
        </p>

        <h1>
          My <span>Cart</span> 🛒
        </h1>

        <p>
          Review your delicious selections before checkout.
        </p>

      </div>


      {cart.length === 0 ? (

        /* EMPTY CART */

        <div className="empty-cart">

          <div className="empty-cart-icon">
            🛒
          </div>

          <h2>Your Cart is Empty</h2>

          <p>
            Looks like you haven't added any delicious
            Ratlami products yet!
          </p>

          <Link
            to="/products"
            className="continue-shopping-btn"
          >
            EXPLORE PRODUCTS →
          </Link>

        </div>

      ) : (

        /* CART WITH PRODUCTS */

        <div className="cart-container">


          {/* CART ITEMS */}

          <div className="cart-items">

            <h2>
              Cart Items ({cart.length})
            </h2>


            {cart.map((item) => (

              <div
                className="cart-item"
                key={item.id}
              >

                {/* PRODUCT IMAGE */}

                <div className="cart-item-image">

                  <span>
                    {item.emoji}
                  </span>

                </div>


                {/* PRODUCT DETAILS */}

                <div className="cart-item-info">

                  <p className="product-category">
                    {item.category}
                  </p>

                  <h3>
                    {item.name}
                  </h3>

                  <p>
                    {item.weight}
                  </p>

                  <span className="cart-item-price">
                    ₹{item.price}
                  </span>

                </div>


                {/* QUANTITY */}

                <div className="quantity-control">

                  <button
                    onClick={() =>
                      decreaseQuantity(item.id)
                    }
                  >
                    −
                  </button>

                  <span>
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      increaseQuantity(item.id)
                    }
                  >
                    +
                  </button>

                </div>


                {/* ITEM TOTAL */}

                <div className="item-total">

                  ₹{item.price * item.quantity}

                </div>


                {/* REMOVE */}

                <button
                  className="remove-btn"
                  onClick={() =>
                    removeFromCart(item.id)
                  }
                >
                  🗑️
                </button>

              </div>

            ))}

          </div>


          {/* ORDER SUMMARY */}

          <div className="order-summary">

            <h2>
              Order Summary
            </h2>


            <div className="summary-row">

              <span>Subtotal</span>

              <span>
                ₹{cartTotal}
              </span>

            </div>


            <div className="summary-row">

              <span>Delivery</span>

              <span className="free-delivery">
                FREE
              </span>

            </div>


            <div className="summary-total">

              <span>Total</span>

              <span>
                ₹{cartTotal}
              </span>

            </div>


            <button className="checkout-btn">

              PROCEED TO CHECKOUT →

            </button>


            <Link
              to="/products"
              className="continue-shopping"
            >

              ← Continue Shopping

            </Link>

          </div>

        </div>

      )}

    </div>
  );
}

export default Cart;