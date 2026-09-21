import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import API_URL from "../config/api";

function Orders() {
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

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ===============================
  // FETCH ORDERS
  // ===============================

  const fetchOrders = useCallback(
    async (showLoading = true) => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        if (showLoading) {
          setLoading(true);
        }

        setError("");

        const response = await fetch(
          `${API_URL}/api/orders/my-orders`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,

            },
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch orders."
          );
        }

        setOrders(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Fetch Orders Error:",
          error
        );

        setError(
          error.message ||
            "Unable to load orders."
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [token]
  );

  // ===============================
  // INITIAL FETCH
  // ===============================

  useEffect(() => {
    fetchOrders(true);
  }, [fetchOrders]);

  // ===============================
  // AUTO REFRESH
  // ===============================
  // Checks for updated order status
  // every 10 seconds.

  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      fetchOrders(false);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [token, fetchOrders]);

  // ===============================
  // REFRESH WHEN USER RETURNS
  // ===============================

  useEffect(() => {
    const handleFocus = () => {
      fetchOrders(false);
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [fetchOrders]);

  // ===============================
  // NOT LOGGED IN
  // ===============================

  if (!loggedInUser || !token) {
    return (
      <div className="orders-page">
        <div className="empty-orders">
          <h1>🔒 Please Login</h1>

          <p>
            Please login to view your orders.
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
            Loading Orders... 📦
          </h1>

          <p>
            Please wait while we load your
            orders.
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
            Something went wrong 😕
          </h1>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => fetchOrders(true)}
            className="explore-products-btn"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ===============================
  // EMPTY ORDERS
  // ===============================

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="empty-orders">
          <h1>📦 No Orders Yet</h1>

          <p>
            You haven't placed any orders yet.
          </p>

          <Link
            to="/products"
            className="explore-products-btn"
          >
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  // ===============================
  // ORDERS PAGE
  // ===============================

  return (
    <div className="orders-page">
      {/* ===============================
          HEADER
      =============================== */}

      <div className="orders-header">
        <p className="section-tag">
          YOUR PURCHASE HISTORY
        </p>

        <h1>
          My <span>Orders</span>
        </h1>

        <div className="gold-divider">
          ✦
        </div>

        <p>
          View all your delicious Ratlami Zayka
          orders.
        </p>
      </div>

      {/* ===============================
          ORDERS LIST
      =============================== */}

      <div className="orders-container">
        {orders.map((order) => (
          <div
            className="order-card"
            key={order._id}
          >
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
                ORDER ITEMS
            =============================== */}

            <div className="order-items">
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
                          Quantity:{" "}
                          {item.quantity}
                        </p>
                      </div>
                    </div>

                    <strong>
                      ₹
                      {item.price *
                        item.quantity}
                    </strong>
                  </div>
                )
              )}
            </div>

            {/* ===============================
                ORDER FOOTER
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

              <Link
                to={`/orders/${order._id}`}
                className="view-order-btn"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;
