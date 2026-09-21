import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import API_URL from "../config/api";

function Checkout() {
  const navigate = useNavigate();

  const {
    cartItems,
    cartTotal,
    clearCart,
  } = useCart();

  // =====================================================
  // CUSTOMER DETAILS
  // =====================================================

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // =====================================================
  // STOCK CHECK
  // =====================================================

  const hasStockProblem = cartItems.some((item) => {
    const stock = Number(item.stock ?? 0);
    const quantity = Number(item.quantity ?? 0);

    return stock <= 0 || quantity > stock;
  });

  // =====================================================
  // LOGIN CHECK
  // =====================================================

  if (!token) {
    return (
      <div className="checkout-page">
        <div className="checkout-message-card">
          <div className="checkout-message-icon">
            🔐
          </div>

          <h2>Please Login First</h2>

          <p>
            You need to login before placing an order.
          </p>

          <button
            type="button"
            className="checkout-primary-btn"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>

          <button
            type="button"
            className="checkout-secondary-btn"
            onClick={() => navigate("/cart")}
          >
            ← Back to Cart
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // EMPTY CART
  // =====================================================

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-message-card">
          <div className="checkout-message-icon">
            🛒
          </div>

          <h2>Your Cart is Empty</h2>

          <p>
            Add some delicious products before checkout.
          </p>

          <button
            type="button"
            className="checkout-primary-btn"
            onClick={() => navigate("/products")}
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateCustomerDetails = () => {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanAddress = address.trim();
    const cleanCity = city.trim();
    const cleanPincode = pincode.trim();

    if (
      !cleanName ||
      !cleanPhone ||
      !cleanAddress ||
      !cleanCity ||
      !cleanPincode
    ) {
      setError("Please fill all delivery details.");
      return false;
    }

    if (cleanName.length < 2) {
      setError("Please enter a valid full name.");
      return false;
    }

    if (!/^\d{10}$/.test(cleanPhone)) {
      setError(
        "Please enter a valid 10-digit phone number."
      );
      return false;
    }

    if (cleanAddress.length < 10) {
      setError(
        "Please enter your complete delivery address."
      );
      return false;
    }

    if (cleanCity.length < 2) {
      setError("Please enter a valid city.");
      return false;
    }

    if (!/^\d{6}$/.test(cleanPincode)) {
      setError(
        "Please enter a valid 6-digit pincode."
      );
      return false;
    }

    if (hasStockProblem) {
      setError(
        "Some products have insufficient stock. Please review your cart."
      );
      return false;
    }

    return true;
  };

  // =====================================================
  // INPUT HANDLERS
  // =====================================================

  const handlePhoneChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 10);

    setPhone(value);
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setPincode(value);
  };

  // =====================================================
  // PAYMENT
  // =====================================================

  const handlePayment = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setError("");

    if (!validateCustomerDetails()) {
      return;
    }

    try {
      setLoading(true);

      // =================================================
      // CREATE RAZORPAY ORDER
      // =================================================

      const createOrderResponse = await fetch(
        `${API_URL}/api/payment/create-order`,
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

      const razorpayOrder = orderData.order;

      // =================================================
      // RAZORPAY
      // =================================================

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

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
          color: "#d4a43b",
        },

        // ===============================================
        // PAYMENT SUCCESS
        // ===============================================

        handler: async function (response) {
          try {
            // =============================================
            // VERIFY PAYMENT
            // =============================================

            const verifyResponse = await fetch(
            `${API_URL}/api/payment/verify`,
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

            if (!verifyData.verified) {
              throw new Error(
                "Payment could not be verified."
              );
            }

            // =============================================
            // CREATE ORDER
            // =============================================

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

            let orderResponse;

            try {
              orderResponse = await fetch(
              `${API_URL}/api/orders`,
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

            // =============================================
            // ORDER CREATION FAILED
            // =============================================

            if (!orderResponse.ok) {
              console.error(
                "Order Creation Failed:",
                createdOrder
              );

              try {
                const refundResponse =
                  await fetch(
                    `${API_URL}/api/payment/refund`,
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
                  `${
                    createdOrder.message ||
                    "Order creation failed."
                  } Your payment refund has been initiated. Refund ID: ${refundData.refundId}`
                );
              } catch (refundError) {
                console.error(
                  "Refund Error:",
                  refundError
                );

                throw new Error(
                  `${
                    createdOrder.message ||
                    "Order creation failed."
                  } Payment was successful, but the automatic refund could not be initiated. Please contact support.`
                );
              }
            }

            // =============================================
            // SUCCESS
            // =============================================

            clearCart();

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

        // ===============================================
        // MODAL CLOSED
        // ===============================================

        modal: {
          ondismiss: function () {
            setLoading(false);

            setError(
              "Payment was cancelled."
            );
          },
        },
      };

      // =================================================
      // OPEN RAZORPAY
      // =================================================

      if (!window.Razorpay) {
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

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="checkout-page">

      {/* =================================================
          CHECKOUT HEADER
      ================================================= */}

      <div className="checkout-hero">

        <div className="checkout-title-area">

          <button
            type="button"
            className="checkout-icon-box"
            onClick={() => navigate("/cart")}
            title="Back to Cart"
          >
            🛍️
          </button>

          <div className="checkout-title-divider" />

          <div>
            <span className="checkout-eyebrow">
              Secure & Easy
            </span>

            <h1>
              Check<span>out</span>
            </h1>

            <p>
              Complete your order and bring home
              the authentic taste of Ratlam.
            </p>

            <div className="checkout-title-line" />
          </div>

        </div>

        {/* =================================================
            STEPPER
        ================================================= */}

        <div className="checkout-stepper">

          <div className="checkout-step active">
            <div className="checkout-step-circle">
              🛒
            </div>

            <span>
              Cart
            </span>
          </div>

          <div className="checkout-step-line" />

          <div className="checkout-step active">
            <div className="checkout-step-circle">
              🏠
            </div>

            <span>
              Address
            </span>
          </div>

          <div className="checkout-step-line" />

          <div className="checkout-step">
            <div className="checkout-step-circle">
              💳
            </div>

            <span>
              Payment
            </span>
          </div>

        </div>

      </div>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="checkout-layout">

        {/* =================================================
            LEFT CARD
        ================================================= */}

        <div className="checkout-main-card">

          {/* YOUR ORDER */}

          <section className="checkout-order-section">

            <div className="checkout-section-title">

              <span className="checkout-section-icon">
                🛒
              </span>

              <div>
                <h2>
                  Your Order
                </h2>

                <p>
                  Review your items before proceeding
                  to checkout.
                </p>
              </div>

            </div>

            <div className="checkout-product-list">

              {cartItems.map((item) => {
                const productId =
                  item._id || item.id;

                return (
                  <div
                    className="checkout-product-row"
                    key={productId}
                  >

                    <div className="checkout-product-image">

                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                        />
                      ) : (
                        <span>
                          {item.emoji || "🍬"}
                        </span>
                      )}

                    </div>

                    <div className="checkout-product-info">

                      <h3>
                        {item.name}
                      </h3>

                      <p>
                        {item.weight}
                      </p>

                      <span className="checkout-product-tag">
                        ★ Traditional
                      </span>

                      <strong>
                        ₹{item.price}
                      </strong>

                    </div>

                    <div className="checkout-product-quantity">

                      <button
                        type="button"
                        disabled
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        disabled
                      >
                        +
                      </button>

                    </div>

                    <div className="checkout-product-total">
                      ₹{item.price * item.quantity}
                    </div>

                  </div>
                );
              })}

            </div>

          </section>

          {/* =================================================
              DELIVERY ADDRESS
          ================================================= */}

          <section className="checkout-address-section">

            <div className="checkout-section-title">

              <span className="checkout-section-icon">
                🚚
              </span>

              <div>
                <h2>
                  Delivery Address
                </h2>

                <p>
                  Add your delivery address to continue
                </p>
              </div>

            </div>

            {error && (
              <div className="checkout-error">
                ⚠️ {error}
              </div>
            )}

            <form
              className="checkout-address-form"
              onSubmit={handlePayment}
            >

              <div className="checkout-input-grid">

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
                    autoComplete="name"
                    disabled={loading}
                  />
                </div>

                <div className="checkout-field">
                  <label>
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    inputMode="numeric"
                    autoComplete="tel"
                    disabled={loading}
                  />
                </div>

              </div>

              <div className="checkout-field">
                <label>
                  Complete Address
                </label>

                <textarea
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  placeholder="House / Flat No., Street, Area..."
                  rows="3"
                  autoComplete="street-address"
                  disabled={loading}
                />
              </div>

              <div className="checkout-input-grid">

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
                    placeholder="Enter city"
                    autoComplete="address-level2"
                    disabled={loading}
                  />
                </div>

                <div className="checkout-field">
                  <label>
                    Pincode
                  </label>

                  <input
                    type="text"
                    value={pincode}
                    onChange={handlePincodeChange}
                    placeholder="6-digit pincode"
                    maxLength="6"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    disabled={loading}
                  />
                </div>

              </div>

              {hasStockProblem && (
                <div className="checkout-stock-warning">
                  ⚠️ Some products in your cart have
                  insufficient stock.
                  <button
                    type="button"
                    onClick={() => navigate("/cart")}
                  >
                    Review Cart
                  </button>
                </div>
              )}

              {/* Hidden submit button */}
              <button
                type="submit"
                className="checkout-hidden-submit"
              >
                Submit
              </button>

            </form>

          </section>

          {/* =================================================
              BENEFITS
          ================================================= */}

          <div className="checkout-benefits-row">

            <div className="checkout-benefit">

              <span>
                🛡️
              </span>

              <div>
                <strong>
                  100% Secure Payment
                </strong>

                <p>
                  Your data is safe with us
                </p>
              </div>

            </div>

            <div className="checkout-benefit">

              <span>
                🚚
              </span>

              <div>
                <strong>
                  Fast & Reliable Delivery
                </strong>

                <p>
                  Across India
                </p>
              </div>

            </div>

            <div className="checkout-benefit">

              <span>
                🌿
              </span>

              <div>
                <strong>
                  Fresh & Authentic
                </strong>

                <p>
                  Ratlami Speciality
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            RIGHT SUMMARY
        ================================================= */}

        <aside className="checkout-summary-card">

          <div className="checkout-summary-title">

            <span>
              📄
            </span>

            <h2>
              Order Summary
            </h2>

          </div>

          <div className="checkout-summary-content">

            <div className="checkout-summary-count">
              {cartItems.length}{" "}
              {cartItems.length === 1
                ? "item"
                : "items"}
            </div>

            {cartItems.map((item) => (
              <div
                className="checkout-summary-item"
                key={item._id || item.id}
              >

                <span>
                  {item.name} ({item.weight})
                </span>

                <strong>
                  ₹{item.price * item.quantity}
                </strong>

              </div>
            ))}

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-row">
              <span>
                Subtotal
              </span>

              <strong>
                ₹{cartTotal}
              </strong>
            </div>

            <div className="checkout-summary-delivery">

              <div>
                <span>
                  Delivery Charges
                </span>

                <small>
                  (On orders above ₹499)
                </small>
              </div>

              <strong>
                🚚 FREE
              </strong>

            </div>

            <div className="checkout-grand-total">

              <span>
                Total
              </span>

              <strong>
                ₹{cartTotal}
              </strong>

            </div>

            <div className="checkout-confirmation-note">
              <span>
                🛡️
              </span>

              <p>
                Your order will be confirmed after
                successful payment.
              </p>
            </div>

            <button
              type="button"
              className="checkout-final-payment-btn"
              onClick={handlePayment}
              disabled={
                loading ||
                hasStockProblem
              }
            >
              {loading
                ? "Processing Payment..."
                : (
                  <>
                    🔒 &nbsp; Proceed to Payment →
                  </>
                )}
            </button>

            <button
              type="button"
              className="checkout-summary-back"
              onClick={() => navigate("/cart")}
              disabled={loading}
            >
              ← Back to Cart
            </button>

          </div>

        </aside>

      </div>

    </div>
  );
}

export default Checkout;