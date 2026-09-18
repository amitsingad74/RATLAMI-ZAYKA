import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function OrderDetails() {

  // ===============================
  // GET ORDER ID FROM URL
  // ===============================

  const { id } = useParams();


  // ===============================
  // GET LOGGED IN USER
  // ===============================

  const loggedInUser = JSON.parse(
    localStorage.getItem("user")
  );

  const token = localStorage.getItem("token");


  // ===============================
  // STATES
  // ===============================

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [cancelling, setCancelling] = useState(false);

  const [cancelMessage, setCancelMessage] = useState("");


  // ===============================
  // ORDER STATUS STEPS
  // ===============================

  const statusSteps = [
    "Order Placed",
    "Confirmed",
    "Preparing",
    "Out for Delivery",
    "Delivered",
  ];


  // ===============================
  // FETCH ORDER
  // ===============================

  useEffect(() => {

    const fetchOrder = async () => {

      if (!token) {

        setLoading(false);

        return;

      }


      try {

        setLoading(true);

        setError("");


        const response = await fetch(
          `http://localhost:5000/api/orders/${id}`,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );


        const data = await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Failed to fetch order."
          );

        }


        setOrder(data);

      } catch (error) {

        console.error(
          "Fetch Order Details Error:",
          error
        );

        setError(
          error.message ||
          "Unable to load order details."
        );

      } finally {

        setLoading(false);

      }

    };


    fetchOrder();

  }, [id, token]);


  // ===============================
  // GET CURRENT STATUS INDEX
  // ===============================

  const currentStatusIndex =
    order
      ? statusSteps.indexOf(order.status)
      : -1;


  // ===============================
  // CANCEL ORDER
  // ===============================

  const handleCancelOrder = async () => {

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order? Your payment will be refunded."
    );


    if (!confirmed) {
      return;
    }


    try {

      setCancelling(true);

      setCancelMessage("");


      const response = await fetch(
        `http://localhost:5000/api/orders/${id}/cancel`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to cancel order."
        );

      }


      // Update order on the page
      setOrder(data.order);


      setCancelMessage(
        "Order cancelled successfully. Refund has been initiated. ✅"
      );


    } catch (error) {

      console.error(
        "Cancel Order Error:",
        error
      );


      setCancelMessage(
        error.message ||
        "Failed to cancel order."
      );


    } finally {

      setCancelling(false);

    }

  };


  // ===============================
  // NOT LOGGED IN
  // ===============================

  if (!loggedInUser || !token) {

    return (

      <div className="orders-page">

        <div className="empty-orders">

          <h1>
            🔒 Please Login
          </h1>

          <p>
            Please login to view this order.
          </p>

          <Link
            to="/login"
            className="explore-products-btn"
          >
            Login
          </Link>

        </div>

      </div>

    );

  }


  // ===============================
  // LOADING
  // ===============================

  if (loading) {

    return (

      <div className="orders-page">

        <div className="empty-orders">

          <h1>
            Loading Order... 📦
          </h1>

          <p>
            Please wait while we load your order.
          </p>

        </div>

      </div>

    );

  }


  // ===============================
  // ERROR
  // ===============================

  if (error) {

    return (

      <div className="orders-page">

        <div className="empty-orders">

          <h1>
            Order Not Found 😕
          </h1>

          <p>
            {error}
          </p>

          <Link
            to="/orders"
            className="explore-products-btn"
          >
            Back to Orders
          </Link>

        </div>

      </div>

    );

  }


  // ===============================
  // ORDER NOT FOUND
  // ===============================

  if (!order) {

    return null;

  }


  // ===============================
  // ORDER DETAILS PAGE
  // ===============================

  return (

    <div className="orders-page">


      {/* ===============================
          HEADER
      =============================== */}

      <div className="orders-header">

        <p className="section-tag">
          ORDER DETAILS
        </p>


        <h1>

          Order{" "}

          <span>
            #{order._id.slice(-6)}
          </span>

        </h1>


        <div className="gold-divider">
          ✦
        </div>


        <p>
          Here are the details of your Ratlami Zayka order.
        </p>

      </div>


      {/* ===============================
          ORDER CONTAINER
      =============================== */}

      <div className="orders-container">

        <div className="order-card">


          {/* ===============================
              ORDER HEADER
          =============================== */}

          <div className="order-card-header">

            <div>

              <h2>
                Order #
                {order._id.slice(-6)}
              </h2>


              <p>

                📅{" "}

                {new Date(
                  order.createdAt
                ).toLocaleString()}

              </p>

            </div>


            <span className="order-status">
              {order.status}
            </span>

          </div>


          {/* ===============================
              ORDER TRACKING
          =============================== */}

          <div className="order-tracking">

            <h2>
              🚚 Order Tracking
            </h2>


            {/* ===============================
                CANCELLED ORDER
            =============================== */}

            {order.status === "Cancelled" ? (

              <div className="cancelled-order">

                <div className="tracking-icon">
                  ❌
                </div>


                <div>

                  <h3>
                    Order Cancelled
                  </h3>


                  <p>
                    This order has been cancelled.
                  </p>

                </div>

              </div>

            ) : (

              /* ===============================
                 NORMAL ORDER TRACKING
              =============================== */

              <div className="tracking-steps">

                {statusSteps.map(
                  (status, index) => {

                    const isCompleted =
                      index <=
                      currentStatusIndex;


                    const isCurrent =
                      index ===
                      currentStatusIndex;


                    return (

                      <div
                        className={`tracking-step ${
                          isCompleted
                            ? "completed"
                            : ""
                        } ${
                          isCurrent
                            ? "current"
                            : ""
                        }`}
                        key={status}
                      >


                        <div className="tracking-circle">

                          {isCompleted
                            ? "✓"
                            : index + 1}

                        </div>


                        <div className="tracking-step-content">

                          <strong>
                            {status}
                          </strong>


                          {isCurrent && (

                            <span>
                              Current Status
                            </span>

                          )}

                        </div>


                        {index <
                          statusSteps.length - 1 && (

                          <div
                            className={`tracking-line ${
                              index <
                              currentStatusIndex
                                ? "completed"
                                : ""
                            }`}
                          />

                        )}

                      </div>

                    );

                  }
                )}

              </div>

            )}

          </div>


          {/* ===============================
              ORDER ITEMS
          =============================== */}

          <div className="order-items">

            <h2 className="order-section-title">
              📦 Ordered Items
            </h2>


            {order.items.map(
              (item, index) => (

                <div
                  className="order-item"
                  key={
                    item.product?._id ||
                    `${order._id}-${index}`
                  }
                >


                  <div className="order-item-left">

                    <span className="order-item-emoji">

                      {item.product?.emoji ||
                        "🌶️"}

                    </span>


                    <div>

                      <h3>
                        {item.name}
                      </h3>


                      <p>
                        ₹{item.price} ×{" "}
                        {item.quantity}
                      </p>


                      <p>
                        Quantity:{" "}
                        {item.quantity}
                      </p>

                    </div>

                  </div>


                  <strong>

                    ₹
                    {Number(item.price) *
                      Number(item.quantity)}

                  </strong>

                </div>

              )
            )}

          </div>


          {/* ===============================
              PAYMENT INFORMATION
          =============================== */}

          <div className="order-details-section">

            <h2>
              💳 Payment Information
            </h2>


            <p>

              <strong>
                Method:
              </strong>{" "}

              {order.payment?.method ||
                "N/A"}

            </p>


            <p>

              <strong>
                Status:
              </strong>{" "}

              {order.payment?.status ||
                "N/A"}

            </p>


            <p>

              <strong>
                Payment ID:
              </strong>{" "}

              {order.payment
                ?.razorpayPaymentId ||
                "N/A"}

            </p>

          </div>


          {/* ===============================
              DELIVERY INFORMATION
          =============================== */}

          <div className="order-details-section">

            <h2>
              📍 Delivery Information
            </h2>


            <p>

              <strong>
                Name:
              </strong>{" "}

              {order.customer?.name ||
                "N/A"}

            </p>


            <p>

              <strong>
                Email:
              </strong>{" "}

              {order.customer?.email ||
                "N/A"}

            </p>


            <p>

              <strong>
                Phone:
              </strong>{" "}

              {order.customer?.phone ||
                "N/A"}

            </p>


            <p>

              <strong>
                Address:
              </strong>{" "}

              {order.customer?.address ||
                "N/A"}

            </p>


            <p>

              <strong>
                City:
              </strong>{" "}

              {order.customer?.city ||
                "N/A"}

            </p>


            <p>

              <strong>
                Pincode:
              </strong>{" "}

              {order.customer?.pincode ||
                "N/A"}

            </p>

          </div>


          {/* ===============================
              TOTAL
          =============================== */}

          <div className="order-card-footer">

            <div>

              <span>
                Total Amount
              </span>


              <h2>
                ₹{order.total}
              </h2>

            </div>


            <span className="order-status">
              {order.status}
            </span>

          </div>


          {/* ===============================
              ACTIONS
          =============================== */}

          <div className="order-bottom-actions">


            {/* ===============================
                CANCEL BUTTON
            =============================== */}

            {[
              "Order Placed",
              "Confirmed",
              "Preparing",
            ].includes(order.status) && (

              <button
                className="cancel-order-btn"
                onClick={handleCancelOrder}
                disabled={cancelling}
              >

                {cancelling
                  ? "Cancelling..."
                  : "✕ Cancel Order"}

              </button>

            )}


            {/* ===============================
                BACK BUTTON
            =============================== */}

            <Link
              to="/orders"
              className="explore-products-btn"
            >
              ← Back to Orders
            </Link>

          </div>


          {/* ===============================
              CANCEL MESSAGE
          =============================== */}

          {cancelMessage && (

            <p
              className={
                cancelMessage.includes(
                  "successfully"
                )
                  ? "cancel-success-message"
                  : "cancel-error-message"
              }
            >
              {cancelMessage}
            </p>

          )}

        </div>

      </div>

    </div>

  );

}


export default OrderDetails;