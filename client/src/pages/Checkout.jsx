import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";


function Checkout() {

  const navigate = useNavigate();


  // ================= CART =================

  const {

    cartItems,

    cartTotal,

    clearCart

  } = useCart();


  // ================= FORM DATA =================

  const [name, setName] = useState("");

  const [phone, setPhone] = useState("");

  const [address, setAddress] = useState("");

  const [city, setCity] = useState("");

  const [pincode, setPincode] = useState("");


  // ================= ERROR =================

  const [error, setError] = useState("");


  // ================= PLACE ORDER =================

 const handlePlaceOrder = (e) => {

  e.preventDefault();

  setError("");


  // ================= CHECK LOGIN =================

  const token = localStorage.getItem("token");

  const loggedInUser = JSON.parse(
    localStorage.getItem("user")
  );


  if (!token || !loggedInUser) {

    alert("Please login before placing an order.");

    navigate("/login");

    return;

  }


  // ================= CHECK EMPTY CART =================

  if (cartItems.length === 0) {

    setError("Your cart is empty.");

    return;

  }


  // ================= FORM VALIDATION =================

  if (

    !name.trim() ||

    !phone.trim() ||

    !address.trim() ||

    !city.trim() ||

    !pincode.trim()

  ) {

    setError(
      "Please fill all delivery details."
    );

    return;

  }


  // ================= PHONE VALIDATION =================

  if (!/^\d{10}$/.test(phone)) {

    setError(
      "Please enter a valid 10 digit phone number."
    );

    return;

  }


  // ================= PINCODE VALIDATION =================

  if (!/^\d{6}$/.test(pincode)) {

    setError(
      "Please enter a valid 6 digit pincode."
    );

    return;

  }


  // ================= CREATE ORDER =================

  const newOrder = {

    id: Date.now(),

    orderDate: new Date().toLocaleString(),

    items: [...cartItems],

    total: cartTotal,

    status: "Order Placed",


    // USER WHO PLACED ORDER

    userEmail: loggedInUser.email,


    customer: {

      name: name.trim(),

      phone: phone,

      address: address.trim(),

      city: city.trim(),

      pincode: pincode

    }

  };


  // ================= USER-SPECIFIC ORDER KEY =================

  const orderKey =
    `orders_${loggedInUser.email}`;


  // ================= GET OLD ORDERS =================

  const savedOrders =

    JSON.parse(
      localStorage.getItem(orderKey)
    ) || [];


  // ================= SAVE ORDER =================

  localStorage.setItem(

    orderKey,

    JSON.stringify([

      newOrder,

      ...savedOrders

    ])

  );


  // ================= CLEAR CART =================

  clearCart();


  // ================= SUCCESS =================

  alert(
    "🎉 Order placed successfully!"
  );


  // ================= GO TO ORDERS =================

  navigate("/orders");

};

  // ================= EMPTY CART =================

  if (!cartItems || cartItems.length === 0) {

    return (

      <div className="checkout-page">

        <div className="empty-checkout">

          <h1>
            Your Cart is Empty 🛒
          </h1>


          <p>
            Add some delicious Ratlami products first!
          </p>


          <button

            onClick={() =>
              navigate("/products")
            }

          >

            Explore Products

          </button>


        </div>

      </div>

    );

  }


  // ================= PAGE =================

  return (

    <div className="checkout-page">


      {/* ================= HEADER ================= */}

      <section className="checkout-header">


        <p className="section-tag">

          COMPLETE YOUR ORDER

        </p>


        <h1>

          Checkout <span>Details</span>

        </h1>


        <div className="gold-divider">

          ✦

        </div>


        <p>

          Fill in your delivery details and
          place your order.

        </p>


      </section>



      {/* ================= CHECKOUT CONTENT ================= */}

      <div className="checkout-container">


        {/* ================= DELIVERY FORM ================= */}

        <form

          className="checkout-form"

          onSubmit={handlePlaceOrder}

        >


          <h2>

            🚚 Delivery Information

          </h2>



          {/* ================= ERROR ================= */}

          {error && (

            <div className="checkout-error">

              ⚠️ {error}

            </div>

          )}



          {/* ================= NAME ================= */}

          <div className="checkout-group">


            <label>

              Full Name

            </label>


            <input

              type="text"

              placeholder="Enter your full name"

              value={name}

              onChange={(e) =>
                setName(e.target.value)
              }

            />


          </div>



          {/* ================= PHONE ================= */}

          <div className="checkout-group">


            <label>

              Phone Number

            </label>


            <input

              type="tel"

              placeholder="Enter 10 digit phone number"

              value={phone}

              maxLength="10"

              onChange={(e) =>

                setPhone(
                  e.target.value.replace(/\D/g, "")
                )

              }

            />


          </div>



          {/* ================= ADDRESS ================= */}

          <div className="checkout-group">


            <label>

              Delivery Address

            </label>


            <textarea

              placeholder="House number, street, area..."

              value={address}

              onChange={(e) =>
                setAddress(e.target.value)
              }

            />


          </div>



          {/* ================= CITY ================= */}

          <div className="checkout-group">


            <label>

              City

            </label>


            <input

              type="text"

              placeholder="Enter your city"

              value={city}

              onChange={(e) =>
                setCity(e.target.value)
              }

            />


          </div>



          {/* ================= PINCODE ================= */}

          <div className="checkout-group">


            <label>

              Pincode

            </label>


            <input

              type="text"

              placeholder="Enter 6 digit pincode"

              value={pincode}

              maxLength="6"

              onChange={(e) =>

                setPincode(
                  e.target.value.replace(/\D/g, "")
                )

              }

            />


          </div>



          {/* ================= PLACE ORDER ================= */}

          <button

            type="submit"

            className="place-order-btn"

          >

            Place Order →

          </button>


        </form>



        {/* ================= ORDER SUMMARY ================= */}

        <div className="checkout-summary">


          <h2>

            📦 Order Summary

          </h2>



          <div className="checkout-items">


            {cartItems.map((item) => (

              <div

                className="checkout-item"

                key={item.id}

              >


                <div className="checkout-item-left">


                  <span className="checkout-item-emoji">

                    {item.emoji}

                  </span>


                  <div>


                    <h4>

                      {item.name}

                    </h4>


                    <p>

                      Quantity: {item.quantity}

                    </p>


                  </div>


                </div>


                <strong>

                  ₹{item.price * item.quantity}

                </strong>


              </div>

            ))}


          </div>



          <div className="checkout-summary-line"></div>



          {/* SUBTOTAL */}

          <div className="checkout-total-row">


            <span>

              Subtotal

            </span>


            <strong>

              ₹{cartTotal}

            </strong>


          </div>



          {/* DELIVERY */}

          <div className="checkout-total-row">


            <span>

              Delivery

            </span>


            <strong>

              FREE

            </strong>


          </div>



          <div className="checkout-summary-line"></div>



          {/* TOTAL */}

          <div className="checkout-grand-total">


            <span>

              Total

            </span>


            <strong>

              ₹{cartTotal}

            </strong>


          </div>


        </div>


      </div>


    </div>

  );

}


export default Checkout;