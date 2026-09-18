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
  // VALIDATE CUSTOMER DETAILS
  // ===============================

  const validateCustomerDetails = () => {
    if (
      !name.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !city.trim() ||
      !pincode.trim()
    ) {
      setError("Please fill all fields.");
      return false;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError(
        "Please enter a valid 10-digit phone number."
      );
      return false;
    }

    if (!/^\d{6}$/.test(pincode)) {
      setError(
        "Please enter a valid 6-digit pincode."
      );
      return false;
    }

    return true;
  };

  // ===============================
  // PAY WITH RAZORPAY
  // ===============================

  const handlePayment = async (e) => {
    e.preventDefault();

    setError("");

    // Validate customer information
    if (!validateCustomerDetails()) {
      return;
    }

    try {
      setLoading(true);

      // ===============================
      // CREATE RAZORPAY ORDER
      // ===============================

      const createOrderResponse = await fetch(
        "http://localhost:5000/api/payment/create-order",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            items: cartItems.map((item) => ({
              _id: item._id || item.id,
              quantity: item.quantity,
            })),
          }),
        }
      );

      const orderData =
        await createOrderResponse.json();

      if (!createOrderResponse.ok) {
        throw new Error(
          orderData.message ||
            "Failed to create payment order."
        );
      }

      const razorpayOrder =
        orderData.order;

      // ===============================
      // RAZORPAY CHECKOUT OPTIONS
      // ===============================

      const options = {
        key: "rzp_test_Td847Mn5K37KmV",

        amount: razorpayOrder.amount,

        currency: razorpayOrder.currency,

        name: "RATLAMI ZAYKA",

        description: "Food & Namkeen Order",

        order_id: razorpayOrder.id,

        prefill: {
          name: name.trim(),
          contact: phone.trim(),
        },

        notes: {
          address: address.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
        },

        theme: {
          color: "#e67e22",
        },

        handler: async function (response) {
          try {
            // ===============================
            // VERIFY PAYMENT
            // ===============================

            const verifyResponse =
              await fetch(
                "http://localhost:5000/api/payment/verify",
                {
                  method: "POST",

                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },

                  body: JSON.stringify({
                    razorpay_order_id:
                      response.razorpay_order_id,

                    razorpay_payment_id:
                      response.razorpay_payment_id,

                    razorpay_signature:
                      response.razorpay_signature,
                  }),
                }
              );

            const verifyData =
              await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.message ||
                  "Payment verification failed."
              );
            }

            // ===============================
            // PAYMENT VERIFIED
            // ===============================

            if (!verifyData.verified) {
              throw new Error(
                "Payment could not be verified."
              );
            }

            // ===============================
            // CREATE MONGODB ORDER
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

             payment: {
  method: verifyData.paymentMethod,

  status: "Paid",

  razorpayOrderId:
    response.razorpay_order_id,

  razorpayPaymentId:
    response.razorpay_payment_id,
},
            };
// ===============================
// CREATE MONGODB ORDER
// ===============================

let orderResponse;

try {
  orderResponse = await fetch(
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
} catch (networkError) {
  // ===============================
  // NETWORK ERROR
  // ===============================
  //
  // Do NOT automatically refund here.
  // The request may have reached the server
  // even though the browser lost connection.

  console.error(
    "Order request network error:",
    networkError
  );

  throw new Error(
    "Payment succeeded, but we could not confirm the order. Please check your Orders page before trying again."
  );
}

const createdOrder =
  await orderResponse.json();


// ===============================
// ORDER CREATION FAILED
// ===============================

if (!orderResponse.ok) {
  console.error(
    "Order Creation Failed:",
    createdOrder
  );

  // ===============================
  // REFUND SUCCESSFUL PAYMENT
  // ===============================

  try {
    const refundResponse =
      await fetch(
        "http://localhost:5000/api/payment/refund",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            razorpayPaymentId:
              response.razorpay_payment_id,
          }),
        }
      );

    const refundData =
      await refundResponse.json();

    if (!refundResponse.ok) {
      throw new Error(
        refundData.message ||
          "Refund could not be initiated."
      );
    }

    throw new Error(
      `${createdOrder.message || "Order creation failed."} Your payment refund has been initiated. Refund ID: ${refundData.refundId}`
    );

  } catch (refundError) {

    console.error(
      "Refund Error:",
      refundError
    );

    throw new Error(
      `${createdOrder.message || "Order creation failed."} Payment was successful, but the automatic refund could not be initiated. Please contact support.`
    );
  }
}
            // ===============================
            // CLEAR CART
            // ===============================

            clearCart();

            // ===============================
            // SUCCESS
            // ===============================

            alert(
              "Payment successful! Order placed 🎉"
            );

            navigate("/orders");
          } catch (error) {
            console.error(
              "Payment Verification / Order Error:",
              error
            );

            setError(
              error.message ||
                "Payment succeeded but something went wrong."
            );

            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setLoading(false);

            setError(
              "Payment was cancelled."
            );
          },
        },
      };

      // ===============================
      // OPEN RAZORPAY
      // ===============================

      if (
        !window.Razorpay
      ) {
        throw new Error(
          "Razorpay Checkout failed to load. Please refresh the page."
        );
      }

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Razorpay Payment Failed:",
            response
          );

          setError(
            response.error?.description ||
              "Payment failed. Please try again."
          );

          setLoading(false);
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "Payment Error:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while starting payment."
      );

      setLoading(false);
    }
  };

  // ===============================
  // UI
  // ===============================

  return (
    <div className="checkout-page">

      <div className="checkout-container">

        {/* ===============================
            CHECKOUT FORM
        =============================== */}

        <div className="checkout-form-section">

          <h1>
            Checkout 🛒
          </h1>

          <p className="checkout-subtitle">
            Enter your delivery details
          </p>

          {error && (
            <div className="checkout-error">
              {error}
            </div>
          )}

          <form onSubmit={handlePayment}>

            {/* NAME */}

            <div className="checkout-field">

              <label>
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your full name"
              />

            </div>

            {/* PHONE */}

            <div className="checkout-field">

              <label>
                Phone Number
              </label>

              <input
                type="text"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                placeholder="10-digit phone number"
                maxLength="10"
              />

            </div>

            {/* ADDRESS */}

            <div className="checkout-field">

              <label>
                Address
              </label>

              <textarea
                value={address}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
                placeholder="Enter your complete address"
                rows="4"
              />

            </div>

            {/* CITY */}

            <div className="checkout-field">

              <label>
                City
              </label>

              <input
                type="text"
                value={city}
                onChange={(e) =>
                  setCity(e.target.value)
                }
                placeholder="Enter your city"
              />

            </div>

            {/* PINCODE */}

            <div className="checkout-field">

              <label>
                Pincode
              </label>

              <input
                type="text"
                value={pincode}
                onChange={(e) =>
                  setPincode(e.target.value)
                }
                placeholder="6-digit pincode"
                maxLength="6"
              />

            </div>

            {/* PAYMENT BUTTON */}

            <button
              type="submit"
              className="checkout-btn"
              disabled={loading}
            >
              {loading
                ? "Processing Payment..."
                : `Pay ₹${cartTotal} 💳`}
            </button>

          </form>

        </div>

        {/* ===============================
            ORDER SUMMARY
        =============================== */}

        <div className="checkout-summary">

          <h2>
            Order Summary
          </h2>

          {cartItems.map((item) => (

            <div
              className="checkout-item"
              key={item._id || item.id}
            >

              <div>

                <h4>
                  {item.name}
                </h4>

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