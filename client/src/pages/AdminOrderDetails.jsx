import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import API_URL from "../config/api";

function AdminOrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const token = localStorage.getItem("token");

  // =========================================
  // CHECK ADMIN + FETCH ORDER
  // =========================================

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    if (user.role !== "admin") {
      navigate("/");
      return;
    }

    fetchOrder();
  }, [id]);

  // =========================================
  // FETCH ORDER DETAILS
  // =========================================

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/orders/${id}`,
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
            "Failed to fetch order details."
        );
      }

      setOrder(data);
    } catch (error) {
      console.error(
        "Admin Order Details Error:",
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

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <h2>
            Loading Order Details... 📦
          </h2>
        </div>
      </div>
    );
  }

  // =========================================
  // ERROR
  // =========================================

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <h2>
            Something went wrong 😕
          </h2>

          <p>
            {error}
          </p>

          <button
            className="admin-add-btn"
            onClick={() =>
              navigate("/admin/orders")
            }
          >
            ← Back to Orders
          </button>
        </div>
      </div>
    );
  }

  // =========================================
  // NO ORDER
  // =========================================

  if (!order) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <h2>
            Order Not Found
          </h2>

          <button
            className="admin-add-btn"
            onClick={() =>
              navigate("/admin/orders")
            }
          >
            ← Back to Orders
          </button>
        </div>
      </div>
    );
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div className="admin-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="admin-header">

        <div>

          <p className="admin-tag">
            ADMIN PANEL
          </p>

          <h1>
            Order Details 📦
          </h1>

          <p>
            Order #
            {order._id.slice(-6).toUpperCase()}
          </p>

        </div>

        <button
          className="admin-add-btn"
          onClick={() =>
            navigate("/admin/orders")
          }
        >
          ← Back to Orders
        </button>

      </div>

      {/* =====================================
          ORDER INFORMATION
      ===================================== */}

      <div className="admin-order-details-grid">

        {/* CUSTOMER */}

        <div className="admin-details-card">

          <h2>
            👤 Customer Information
          </h2>

          <div className="admin-detail-row">

            <span>
              Name
            </span>

            <strong>
              {order.customer?.name ||
                order.user?.name ||
                "N/A"}
            </strong>

          </div>

          <div className="admin-detail-row">

            <span>
              Email
            </span>

            <strong>
              {order.user?.email ||
                "N/A"}
            </strong>

          </div>

          <div className="admin-detail-row">

            <span>
              Phone
            </span>

            <strong>
              {order.customer?.phone ||
                order.user?.phone ||
                "N/A"}
            </strong>

          </div>

        </div>

        {/* DELIVERY */}

        <div className="admin-details-card">

          <h2>
            📍 Delivery Address
          </h2>

          <div className="admin-detail-row">

            <span>
              Address
            </span>

            <strong>
              {order.customer?.address ||
                "N/A"}
            </strong>

          </div>

          <div className="admin-detail-row">

            <span>
              City
            </span>

            <strong>
              {order.customer?.city ||
                "N/A"}
            </strong>

          </div>

          <div className="admin-detail-row">

            <span>
              Pincode
            </span>

            <strong>
              {order.customer?.pincode ||
                "N/A"}
            </strong>

          </div>

        </div>

      </div>

      {/* =====================================
          ORDER META
      ===================================== */}

      <div className="admin-details-card admin-order-meta-card">

        <div className="admin-order-meta">

          <div>

            <span>
              Order Date
            </span>

            <strong>
              {new Date(
                order.createdAt
              ).toLocaleString()}
            </strong>

          </div>

          <div>

            <span>
              Status
            </span>

            <strong className="admin-detail-status">
              {order.status}
            </strong>

          </div>

          <div>

            <span>
              Total
            </span>

            <strong className="admin-detail-total">
              ₹{order.total}
            </strong>

          </div>

        </div>

      </div>

      {/* =====================================
          ORDER ITEMS
      ===================================== */}

      <div className="admin-details-card">

        <h2>
          🛍️ Ordered Products
        </h2>

        <div className="admin-order-items">

          {order.items?.map(
            (item, index) => (

              <div
                className="admin-order-detail-item"
                key={
                  item.product?._id ||
                  index
                }
              >

                <div className="admin-detail-item-image">

                  {item.product?.image ? (
                    <img
                      src={
                        item.product.image
                      }
                      alt={item.name}
                    />
                  ) : (
                    <span>
                      {item.product?.emoji ||
                        "🍬"}
                    </span>
                  )}

                </div>

                <div className="admin-detail-item-info">

                  <h3>
                    {item.name}
                  </h3>

                  <p>
                    Weight:{" "}
                    {item.weight}
                  </p>

                  <p>
                    Quantity:{" "}
                    {item.quantity}
                  </p>

                </div>

                <div className="admin-detail-item-price">

                  <span>
                    ₹{item.price} ×{" "}
                    {item.quantity}
                  </span>

                  <strong>
                    ₹
                    {Number(item.price) *
                      Number(item.quantity)}
                  </strong>

                </div>

              </div>

            )
          )}

        </div>

        {/* TOTAL */}

        <div className="admin-detail-final-total">

          <span>
            Order Total
          </span>

          <strong>
            ₹{order.total}
          </strong>

        </div>

      </div>

    </div>
  );
}

export default AdminOrderDetails;