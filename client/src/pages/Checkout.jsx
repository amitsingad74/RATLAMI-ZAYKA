import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Checkout() {
  const navigate = useNavigate();

  const {
    cartItems,
    cartTotal,
    clearCart,
  } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // ===============================
  // CHECK LOGIN
  // ===============================

  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <div className="checkout-page">
        <div className="checkout-login-message">

          <h2>Please Login First 🔐</h2>

          <p>
            You need to login before placing an order.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="checkout-btn"
          >
            Go to Login
          </button>

        </div>
      </div>
    );
  }


  // ===============================
  // EMPTY CART
  // ===============================

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-login-message">

          <h2>Your Cart is Empty 🛒</h2>

          <p>
            Add some delicious products before checkout.
          </p>

          <button
            onClick={() => navigate("/products")}
            className="checkout-btn"
          >
            Browse Products
          </button>

        </div>
      </div>
    );
  }


  // ===============================
  // PLACE ORDER
  // ===============================

  const handlePlaceOrder = async (e) => {

    e.preventDefault();

    setError("");


    // ===============================
    // VALIDATION
    // ===============================

    if (
      !name.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !city.trim() ||
      !pincode.trim()
    ) {
      setError("Please fill all fields.");
      return;
    }


    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }


    if (!/^\d{6}$/.test(pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }


    try {

      setLoading(true);


      // ===============================
      // ORDER DATA
      // ===============================

      const orderData = {

        items: cartItems,

        total: cartTotal,

        customer: {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
        },

      };


      // ===============================
      // SEND ORDER TO BACKEND
      // ===============================

      const response = await fetch(
        "http://localhost:5000/api/orders",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(orderData),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.message || "Failed to place order."
        );

      }


      // ===============================
      // CLEAR CART
      // ===============================

      clearCart();


      // ===============================
      // SUCCESS
      // ===============================

      alert("Order placed successfully! 🎉");


      navigate("/orders");

    } catch (error) {

      console.error("Place Order Error:", error);

      setError(
        error.message ||
        "Something went wrong while placing your order."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="checkout-page">

      <div className="checkout-container">

        {/* ===============================
            CHECKOUT FORM
        =============================== */}

        <div className="checkout-form-section">

          <h1>Checkout 🛒</h1>

          <p className="checkout-subtitle">
            Enter your delivery details
          </p>


          {error && (
            <div className="checkout-error">
              {error}
            </div>
          )}


          <form onSubmit={handlePlaceOrder}>

            {/* NAME */}

            <div className="checkout-field">

              <label>Full Name</label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />

            </div>


            {/* PHONE */}

            <div className="checkout-field">

              <label>Phone Number</label>

              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit phone number"
                maxLength="10"
              />

            </div>


            {/* ADDRESS */}

            <div className="checkout-field">

              <label>Address</label>

              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your complete address"
                rows="4"
              />

            </div>


            {/* CITY */}

            <div className="checkout-field">

              <label>City</label>

              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter your city"
              />

            </div>


            {/* PINCODE */}

            <div className="checkout-field">

              <label>Pincode</label>

              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="6-digit pincode"
                maxLength="6"
              />

            </div>


            {/* PLACE ORDER */}

            <button
              type="submit"
              className="checkout-btn"
              disabled={loading}
            >

              {loading
                ? "Placing Order..."
                : "Place Order 🎉"}

            </button>

          </form>

        </div>


        {/* ===============================
            ORDER SUMMARY
        =============================== */}

        <div className="checkout-summary">

          <h2>Order Summary</h2>

          {cartItems.map((item) => (

            <div
              className="checkout-item"
              key={item._id}
            >

              <div>

                <h4>{item.name}</h4>

                <p>
                  ₹{item.price} × {item.quantity}
                </p>

              </div>

              <strong>
                ₹{item.price * item.quantity}
              </strong>

            </div>

          ))}


          <div className="checkout-total">

            <span>Total</span>

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