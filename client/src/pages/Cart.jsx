import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";


function Cart() {

  // ================= NAVIGATION =================

  const navigate = useNavigate();


  // ================= CART CONTEXT =================

  const {

    cartItems,

    removeFromCart,

    increaseQuantity,

    decreaseQuantity,

    clearCart,

    cartTotal,

  } = useCart();


  // ===============================
  // EMPTY CART
  // ===============================

  if (cartItems.length === 0) {

    return (

      <div className="cart-page">

        <div className="empty-cart">

          <h1>
            🛒 Your Cart is Empty
          </h1>


          <p>
            Looks like you haven't added any delicious
            products yet!
          </p>


          <Link
            to="/products"
            className="continue-shopping-btn"
          >

            Explore Products

          </Link>


        </div>

      </div>

    );

  }


  // ===============================
  // CART WITH PRODUCTS
  // ===============================

  return (

    <div className="cart-page">


      {/* ================= HEADER ================= */}

      <div className="cart-header">


        <p className="section-tag">

          YOUR SHOPPING CART

        </p>


        <h1>

          Shopping <span>Cart</span>

        </h1>


      </div>



      {/* ================= CART CONTENT ================= */}

      <div className="cart-container">


        {/* ================= CART ITEMS ================= */}

        <div className="cart-items">


          <h2>

            Cart Items ({cartItems.length})

          </h2>



          {cartItems.map((item) => (


            <div
              className="cart-item"
              key={item.id}
            >


              {/* ================= PRODUCT IMAGE ================= */}

              <div className="cart-item-image">

                <span>

                  {item.emoji}

                </span>

              </div>



              {/* ================= PRODUCT DETAILS ================= */}

              <div className="cart-item-details">


                <p className="cart-category">

                  {item.category}

                </p>


                <h3>

                  {item.name}

                </h3>


                <p>

                  {item.weight}

                </p>


                <span className="cart-price">

                  ₹{item.price}

                </span>


              </div>



              {/* ================= QUANTITY ================= */}

              <div className="quantity-controls">


                {/* DECREASE */}

                <button
                  onClick={() =>
                    decreaseQuantity(item.id)
                  }
                >

                  −

                </button>



                {/* QUANTITY */}

                <span>

                  {item.quantity}

                </span>



                {/* INCREASE */}

                <button
                  onClick={() =>
                    increaseQuantity(item.id)
                  }
                >

                  +

                </button>


              </div>



              {/* ================= ITEM TOTAL ================= */}

              <div className="cart-item-total">

                ₹{item.price * item.quantity}

              </div>



              {/* ================= REMOVE ================= */}

              <button
                className="remove-item-btn"
                onClick={() =>
                  removeFromCart(item.id)
                }
                title="Remove Item"
              >

                🗑️

              </button>


            </div>


          ))}


        </div>



        {/* ================= ORDER SUMMARY ================= */}

        <div className="cart-summary">


          <h2>

            Order Summary

          </h2>



          {/* ================= SUBTOTAL ================= */}

          <div className="summary-row">


            <span>

              Subtotal

            </span>


            <span>

              ₹{cartTotal}

            </span>


          </div>



          {/* ================= DELIVERY ================= */}

          <div className="summary-row">


            <span>

              Delivery

            </span>


            <span>

              FREE

            </span>


          </div>



          <hr />



          {/* ================= TOTAL ================= */}

          <div className="summary-total">


            <span>

              Total

            </span>


            <strong>

              ₹{cartTotal}

            </strong>


          </div>



          {/* ================= CHECKOUT ================= */}

          <button
            className="checkout-btn"
            onClick={() =>
              navigate("/checkout")
            }
          >

            Proceed to Checkout →

          </button>



          {/* ================= CONTINUE SHOPPING ================= */}

          <Link
            to="/products"
            className="continue-shopping"
          >

            ← Continue Shopping

          </Link>



          {/* ================= CLEAR CART ================= */}

          <button
            className="clear-cart-btn"
            onClick={clearCart}
          >

            Clear Cart

          </button>


        </div>


      </div>


    </div>

  );

}


export default Cart;