import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";

function AdminOrders() {
  const navigate = useNavigate();

  // =========================================
  // STATE
  // =========================================

  const [orders, setOrders] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================
  // USER + TOKEN
  // =========================================

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const token = localStorage.getItem("token");

  // =========================================
  // CHECK ADMIN + LOAD ORDERS
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

    fetchOrders();
  }, []);

  // =========================================
  // FETCH ALL ORDERS
  // =========================================

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
      `${API_URL}/api/admin/orders`,
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
            "Failed to fetch orders."
        );
      }

      if (!Array.isArray(data)) {
        throw new Error(
          "Orders API did not return an order list."
        );
      }

      setOrders(data);
    } catch (error) {
      console.error(
        "Admin Orders Error:",
        error
      );

      setError(
        error.message ||
          "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // UPDATE ORDER STATUS
  // =========================================

  const handleStatusChange = async (
    orderId,
    newStatus
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/orders/${orderId}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update order status."
        );
      }

      alert(
        "Order status updated successfully! ✅"
      );

      fetchOrders();
    } catch (error) {
      console.error(
        "Update Order Status Error:",
        error
      );

      alert(
        error.message ||
          "Failed to update order status."
      );
    }
  };

  // =========================================
  // VIEW ORDER DETAILS
  // =========================================

  const handleViewDetails = (orderId) => {
    navigate(
      `/admin/orders/${orderId}`
    );
  };

  // =========================================
  // RESET SEARCH + FILTER
  // =========================================

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
  };

  // =========================================
  // FILTER ORDERS
  // =========================================

  const filteredOrders = orders.filter(
    (order) => {
      const search =
        searchTerm.trim().toLowerCase();

      const orderId =
        order._id?.toLowerCase() || "";

      const shortOrderId =
        order._id
          ?.slice(-6)
          .toLowerCase() || "";

      const customerName =
        order.customer?.name
          ?.toLowerCase() || "";

      const phone =
        order.customer?.phone
          ?.toLowerCase() || "";

      const email =
        order.user?.email
          ?.toLowerCase() || "";

      const matchesSearch =
        !search ||
        orderId.includes(search) ||
        shortOrderId.includes(search) ||
        customerName.includes(search) ||
        phone.includes(search) ||
        email.includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        order.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    }
  );

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="admin-page">

        <div className="admin-loading">

          <h2>
            Loading Orders... 📦
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
              navigate("/admin")
            }
          >
            ← Dashboard
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
            Order Management 📦
          </h1>

          <p>
            Manage customer orders
          </p>

        </div>

        <button
          className="admin-add-btn"
          onClick={() =>
            navigate("/admin")
          }
        >
          ← Dashboard
        </button>

      </div>

      {/* =====================================
          ORDERS SECTION
      ===================================== */}

      <div className="admin-section">

        <div className="admin-section-header">

          <h2>
            All Orders
          </h2>

          <span>
            {filteredOrders.length} of{" "}
            {orders.length} Orders
          </span>

        </div>

        {/* =====================================
            SEARCH + FILTER
        ===================================== */}

        <div className="admin-order-filters">

          {/* SEARCH */}

          <div className="admin-order-search">

            <span>
              🔎
            </span>

            <input
              type="text"
              placeholder="Search by order ID, name, phone or email..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
            />

          </div>

          {/* STATUS FILTER */}

          <select
            className="admin-order-filter-select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
          >

            <option value="All">
              All Status
            </option>

            <option value="Order Placed">
              Order Placed
            </option>

            <option value="Confirmed">
              Confirmed
            </option>

            <option value="Preparing">
              Preparing
            </option>

            <option value="Out for Delivery">
              Out for Delivery
            </option>

            <option value="Delivered">
              Delivered
            </option>

            <option value="Cancelled">
              Cancelled
            </option>

          </select>

          {/* RESET */}

          <button
            className="admin-reset-filter-btn"
            onClick={
              handleResetFilters
            }
          >
            ↻ Reset
          </button>

        </div>

        {/* =====================================
            NO ORDERS
        ===================================== */}

        {orders.length === 0 ? (

          <div className="admin-empty-orders">

            <h2>
              No Orders Yet 📦
            </h2>

            <p>
              Customer orders will appear here.
            </p>

          </div>

        ) : filteredOrders.length === 0 ? (

          /* =====================================
              NO SEARCH RESULTS
          ===================================== */

          <div className="admin-empty-orders">

            <h2>
              No Matching Orders 🔎
            </h2>

            <p>
              Try changing your search or status filter.
            </p>

            <button
              className="admin-add-btn"
              onClick={
                handleResetFilters
              }
            >
              Reset Filters
            </button>

          </div>

        ) : (

          /* =====================================
              ORDERS LIST
          ===================================== */

          <div className="admin-orders-list">

            {filteredOrders.map(
              (order) => (

                <div
                  className="admin-order-card"
                  key={order._id}
                >

                  {/* =================================
                      ORDER HEADER
                  ================================= */}

                  <div className="admin-order-header">

                    <div>

                      <span className="admin-order-label">
                        ORDER
                      </span>

                      <h3>
                        #
                        {order._id
                          .slice(-6)
                          .toUpperCase()}
                      </h3>

                    </div>

                    {/* STATUS */}

                    <div className="admin-order-status-wrapper">

                      <label>
                        Order Status
                      </label>

                      <select
                        className="admin-order-status-select"
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(
                            order._id,
                            e.target.value
                          )
                        }
                      >

                        <option value="Order Placed">
                          Order Placed
                        </option>

                        <option value="Confirmed">
                          Confirmed
                        </option>

                        <option value="Preparing">
                          Preparing
                        </option>

                        <option value="Out for Delivery">
                          Out for Delivery
                        </option>

                        <option value="Delivered">
                          Delivered
                        </option>

                        <option value="Cancelled">
                          Cancelled
                        </option>

                      </select>

                    </div>

                  </div>

                  {/* =================================
                      ORDER DATE
                  ================================= */}

                  <div className="admin-order-date">

                    {new Date(
                      order.createdAt
                    ).toLocaleString()}

                  </div>

                  {/* =================================
                      CUSTOMER
                  ================================= */}

                  <div className="admin-order-customer">

                    <h4>
                      Customer Details
                    </h4>

                    <p>
                      <strong>
                        Name:
                      </strong>{" "}
                      {order.customer?.name ||
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
                        Email:
                      </strong>{" "}
                      {order.user?.email ||
                        "N/A"}
                    </p>

                    <p>
                      <strong>
                        Address:
                      </strong>{" "}
                      {order.customer?.address ||
                        "N/A"}

                      {order.customer?.city
                        ? `, ${order.customer.city}`
                        : ""}

                      {order.customer?.pincode
                        ? ` - ${order.customer.pincode}`
                        : ""}
                    </p>

                  </div>

                  {/* =================================
                      PRODUCTS
                  ================================= */}

                  <div className="admin-order-items">

                    <h4>
                      Products
                    </h4>

                    {order.items?.map(
                      (item, index) => (

                        <div
                          className="admin-order-item"
                          key={
                            item.product?._id ||
                            index
                          }
                        >

                          <div className="admin-order-item-info">

                            <span className="admin-order-item-emoji">
                              {item.product?.emoji ||
                                "🌶️"}
                            </span>

                            <div>

                              <strong>
                                {item.name}
                              </strong>

                              <p>
                                ₹{item.price} ×{" "}
                                {item.quantity}
                              </p>

                            </div>

                          </div>

                          <strong>
                            ₹
                            {Number(
                              item.price
                            ) *
                              Number(
                                item.quantity
                              )}
                          </strong>

                        </div>

                      )
                    )}

                  </div>

                  {/* =================================
                      TOTAL
                  ================================= */}

                  <div className="admin-order-total">

                    <span>
                      Total Amount
                    </span>

                    <strong>
                      ₹{order.total}
                    </strong>

                  </div>

                  {/* =================================
                      VIEW DETAILS
                  ================================= */}

                  <div className="admin-order-actions">

                    <button
                      className="admin-view-order-btn"
                      onClick={() =>
                        handleViewDetails(
                          order._id
                        )
                      }
                    >
                      👁️ View Details
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default AdminOrders;