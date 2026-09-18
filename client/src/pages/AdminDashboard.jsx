import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function AdminDashboard() {
  const navigate = useNavigate();

  // =========================================
  // USER + TOKEN
  // =========================================

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const token = localStorage.getItem("token");

  // =========================================
  // PRODUCTS
  // =========================================

  const [products, setProducts] = useState([]);

  // =========================================
  // RECENT ORDERS
  // =========================================

  const [recentOrders, setRecentOrders] = useState([]);

  // =========================================
  // ANALYTICS
  // =========================================

  const [analytics, setAnalytics] = useState({
    orderStatus: {},
    revenueData: {},
    topSellingProducts: [],
    totalOrders: 0,
    totalRevenue: 0,
    activeOrders: 0,
    deliveredOrders: 0,
  });

  const [analyticsRange, setAnalyticsRange] =
    useState("all");

  // =========================================
  // DASHBOARD STATS
  // =========================================

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  // =========================================
  // LOADING + ERROR
  // =========================================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================================
  // PRODUCT FORM
  // =========================================

  const [showForm, setShowForm] = useState(false);

  const [formLoading, setFormLoading] =
    useState(false);

  const [formError, setFormError] = useState("");

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: 0,
    weight: "",
    emoji: "🍬",
    image: "",
    description: "",
  });

  // =========================================
  // FETCH PRODUCTS
  // =========================================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/admin/products",
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
            "Failed to fetch products."
        );
      }

      if (!Array.isArray(data)) {
        throw new Error(
          "Products API did not return a product list."
        );
      }

      console.log(
        "ADMIN PRODUCTS:",
        data
      );

      setProducts(data);

      setStats((previousStats) => ({
        ...previousStats,
        totalProducts: data.length,
      }));
    } catch (error) {
      console.error(
        "Admin Products Error:",
        error
      );

      setError(
        error.message ||
          "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // FETCH RECENT ORDERS
  // =========================================

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/orders",
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
            "Failed to fetch recent orders."
        );
      }

      if (!Array.isArray(data)) {
        throw new Error(
          "Orders API did not return an order list."
        );
      }

      setRecentOrders(
        data.slice(0, 5)
      );
    } catch (error) {
      console.error(
        "Recent Orders Error:",
        error
      );
    }
  };

  // =========================================
  // FETCH ADMIN STATISTICS
  // =========================================

  const fetchStats = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/stats",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(
        "ADMIN STATS DATA:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch dashboard statistics."
        );
      }

      setStats({
        totalProducts:
          Number(data.totalProducts) || 0,

        totalOrders:
          Number(data.totalOrders) || 0,

        totalRevenue:
          Number(data.totalRevenue) || 0,

        pendingOrders:
          Number(data.pendingOrders) || 0,
      });
    } catch (error) {
      console.error(
        "Admin Stats Error:",
        error
      );
    }
  };

  // =========================================
  // FETCH ADMIN ANALYTICS
  // =========================================

  const fetchAnalytics = async (
    range = analyticsRange
  ) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/analytics?range=${range}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(
        "ANALYTICS DATA:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch analytics."
        );
      }

      setAnalytics({
        orderStatus:
          data.orderStatus || {},

        revenueData:
          data.revenueData || {},

        topSellingProducts:
          data.topSellingProducts || [],

        totalOrders:
          Number(data.totalOrders) || 0,

        totalRevenue:
          Number(data.totalRevenue) || 0,

        activeOrders:
          Number(data.activeOrders) || 0,

        deliveredOrders:
          Number(data.deliveredOrders) || 0,
      });
    } catch (error) {
      console.error(
        "Admin Analytics Error:",
        error
      );
    }
  };

  // =========================================
  // CHECK ADMIN + LOAD DATA
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

    fetchProducts();
    fetchStats();
    fetchRecentOrders();
    fetchAnalytics("all");
  }, []);

  // =========================================
  // STATUS CHART DATA
  // =========================================

  const statusChartData = {
    labels: [
      "Order Placed",
      "Confirmed",
      "Preparing",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ],

    datasets: [
      {
        label: "Orders",

        data: [
          analytics.orderStatus[
            "Order Placed"
          ] || 0,

          analytics.orderStatus[
            "Confirmed"
          ] || 0,

          analytics.orderStatus[
            "Preparing"
          ] || 0,

          analytics.orderStatus[
            "Out for Delivery"
          ] || 0,

          analytics.orderStatus[
            "Delivered"
          ] || 0,

          analytics.orderStatus[
            "Cancelled"
          ] || 0,
        ],

        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  // =========================================
  // REVENUE CHART DATA
  // =========================================

  const revenueChartData = {
    labels: Object.keys(
      analytics.revenueData
    ),

    datasets: [
      {
        label: "Revenue (₹)",

        data: Object.values(
          analytics.revenueData
        ),

        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  // =========================================
  // TOP PRODUCTS CHART DATA
  // =========================================

  const topProductsChartData = {
    labels:
      analytics.topSellingProducts.map(
        (product) =>
          product.name
      ),

    datasets: [
      {
        label: "Quantity Sold",

        data:
          analytics.topSellingProducts.map(
            (product) =>
              product.quantity
          ),

        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  // =========================================
  // STATUS CHART OPTIONS
  // =========================================

  const statusChartOptions = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        enabled: true,
      },
    },

    scales: {
      y: {
        beginAtZero: true,

        ticks: {
          precision: 0,
        },
      },
    },
  };

  // =========================================
  // REVENUE CHART OPTIONS
  // =========================================

  const revenueChartOptions = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        enabled: true,

        callbacks: {
          label: (context) =>
            ` ₹${context.raw}`,
        },
      },
    },

    scales: {
      y: {
        beginAtZero: true,

        ticks: {
          callback: (value) =>
            `₹${value}`,
        },
      },
    },
  };

  // =========================================
  // TOP PRODUCTS CHART OPTIONS
  // =========================================

  const topProductsChartOptions = {
    responsive: true,

    maintainAspectRatio: false,

    indexAxis: "y",

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.raw} units sold`,
        },
      },
    },

    scales: {
      x: {
        beginAtZero: true,

        ticks: {
          precision: 0,
        },
      },
    },
  };

  // =========================================
  // HANDLE FORM INPUT
  // =========================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // =========================================
  // OPEN ADD PRODUCT FORM
  // =========================================

  const openAddForm = () => {
    setEditingProduct(null);

    setFormData({
      name: "",
      category: "",
      price: "",
      stock: 0,
      weight: "",
      emoji: "🍬",
      image: "",
      description: "",
    });

    setFormError("");
    setShowForm(true);
  };

  // =========================================
  // OPEN EDIT PRODUCT FORM
  // =========================================

  const handleEditProduct = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name || "",

      category:
        product.category || "",

      price:
        product.price ?? "",

      stock:
        product.stock ?? 0,

      weight:
        product.weight || "",

      emoji:
        product.emoji || "🍬",

      image:
        product.image || "",

      description:
        product.description || "",
    });

    setFormError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================
  // ADD PRODUCT
  // =========================================

  const handleAddProduct = async (e) => {
    e.preventDefault();

    setFormError("");

    if (
      !formData.name.trim() ||
      !formData.category.trim() ||
      formData.price === "" ||
      formData.stock === "" ||
      formData.stock === undefined ||
      !formData.weight.trim() ||
      !formData.description.trim()
    ) {
      setFormError(
        "Please fill all required fields."
      );

      return;
    }

    if (
      Number(formData.price) < 0
    ) {
      setFormError(
        "Price cannot be negative."
      );

      return;
    }

    if (
      Number(formData.stock) < 0
    ) {
      setFormError(
        "Stock cannot be negative."
      );

      return;
    }

    try {
      setFormLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/admin/products",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            name:
              formData.name.trim(),

            category:
              formData.category.trim(),

            price:
              Number(formData.price),

            stock:
              Number(formData.stock),

            weight:
              formData.weight.trim(),

            emoji:
              formData.emoji ||
              "🍬",

            image:
              formData.image.trim(),

            description:
              formData.description.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add product."
        );
      }

      alert(
        "Product added successfully! 🎉"
      );

      setFormData({
        name: "",
        category: "",
        price: "",
        stock: 0,
        weight: "",
        emoji: "🍬",
        image: "",
        description: "",
      });

      setShowForm(false);

      await fetchProducts();
      await fetchStats();
    } catch (error) {
      console.error(
        "Add Product Error:",
        error
      );

      setFormError(
        error.message ||
          "Failed to add product."
      );
    } finally {
      setFormLoading(false);
    }
  };

  // =========================================
  // UPDATE PRODUCT
  // =========================================

  const handleUpdateProduct =
    async (e) => {
      e.preventDefault();

      setFormError("");

      if (
        !formData.name.trim() ||
        !formData.category.trim() ||
        formData.price === "" ||
        formData.stock === "" ||
        formData.stock === undefined ||
        !formData.weight.trim() ||
        !formData.description.trim()
      ) {
        setFormError(
          "Please fill all required fields."
        );

        return;
      }

      if (
        Number(formData.price) < 0
      ) {
        setFormError(
          "Price cannot be negative."
        );

        return;
      }

      if (
        Number(formData.stock) < 0
      ) {
        setFormError(
          "Stock cannot be negative."
        );

        return;
      }

      try {
        setFormLoading(true);

        const response = await fetch(
          `http://localhost:5000/api/admin/products/${editingProduct._id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              name:
                formData.name.trim(),

              category:
                formData.category.trim(),

              price:
                Number(formData.price),

              stock:
                Number(formData.stock),

              weight:
                formData.weight.trim(),

              emoji:
                formData.emoji ||
                "🍬",

              image:
                formData.image.trim(),

              description:
                formData.description.trim(),
            }),
          }
        );

        const data =
          await response.json();

        console.log(
          "UPDATED PRODUCT:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to update product."
          );
        }

        alert(
          "Product updated successfully! ✏️"
        );

        setEditingProduct(null);

        setFormData({
          name: "",
          category: "",
          price: "",
          stock: 0,
          weight: "",
          emoji: "🍬",
          image: "",
          description: "",
        });

        setShowForm(false);

        await fetchProducts();
        await fetchStats();
      } catch (error) {
        console.error(
          "Update Product Error:",
          error
        );

        setFormError(
          error.message ||
            "Failed to update product."
        );
      } finally {
        setFormLoading(false);
      }
    };

  // =========================================
  // DELETE PRODUCT
  // =========================================

  const handleDeleteProduct =
    async (id) => {
      const confirmDelete =
        window.confirm(
          "Are you sure you want to delete this product?"
        );

      if (!confirmDelete) {
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/admin/products/${id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to delete product."
          );
        }

        alert(
          "Product deleted successfully! 🗑️"
        );

        await fetchProducts();
        await fetchStats();
      } catch (error) {
        console.error(
          "Delete Product Error:",
          error
        );

        alert(
          error.message ||
            "Failed to delete product."
        );
      }
    };

  // =========================================
  // CLOSE FORM
  // =========================================

  const handleCancelForm = () => {
    setShowForm(false);

    setEditingProduct(null);

    setFormError("");

    setFormData({
      name: "",
      category: "",
      price: "",
      stock: 0,
      weight: "",
      emoji: "🍬",
      image: "",
      description: "",
    });
  };

  // =========================================
  // CHANGE ANALYTICS RANGE
  // =========================================

  const handleAnalyticsRange =
    (range) => {
      setAnalyticsRange(range);

      fetchAnalytics(range);
    };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <h2>
            Loading Admin Dashboard... 👨‍💼
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

          <p>{error}</p>
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
            Admin Dashboard 👨‍💼
          </h1>

          <p>
            Welcome, {user.name}
          </p>

        </div>

        <div className="admin-header-actions">

          <button
            className="admin-orders-btn"
            onClick={() =>
              navigate(
                "/admin/orders"
              )
            }
          >
            📦 Orders
          </button>

          <button
            className="admin-orders-btn"
            onClick={() =>
              navigate(
                "/admin/users"
              )
            }
          >
            👥 Users
          </button>

          <button
            className="admin-add-btn"
            onClick={() => {
              if (showForm) {
                handleCancelForm();
              } else {
                openAddForm();
              }
            }}
          >
            {showForm
              ? "✕ Close"
              : "+ Add Product"}
          </button>

        </div>

      </div>

      {/* =====================================
          ADD / EDIT FORM
      ===================================== */}

      {showForm && (

        <div className="admin-form-card">

          <div className="admin-form-header">

            <h2>
              {editingProduct
                ? "Edit Product ✏️"
                : "Add New Product ➕"}
            </h2>

            <p>
              {editingProduct
                ? "Update the product details below."
                : "Add a new product to RATLAMI Zayka."}
            </p>

          </div>

          {formError && (
            <div className="admin-form-error">
              {formError}
            </div>
          )}

          <form
            className="admin-product-form"
            onSubmit={
              editingProduct
                ? handleUpdateProduct
                : handleAddProduct
            }
          >

            <div className="admin-form-group">

              <label>
                Product Name *
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Ratlami Sev"
              />

            </div>

            <div className="admin-form-group">

              <label>
                Stock Quantity *
              </label>

              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="50"
                min="0"
              />

              <small>
                Number of units currently available.
              </small>

            </div>

            <div className="admin-form-group">

              <label>
                Category *
              </label>

              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Namkeen"
              />

            </div>

            <div className="admin-form-group">

              <label>
                Price (₹) *
              </label>

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="120"
                min="0"
              />

            </div>

            <div className="admin-form-group">

              <label>
                Weight *
              </label>

              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="250g"
              />

            </div>

            <div className="admin-form-group">

              <label>
                Emoji
              </label>

              <input
                type="text"
                name="emoji"
                value={formData.emoji}
                onChange={handleChange}
                placeholder="🌶️"
              />

            </div>

            <div className="admin-form-group">

              <label>
                Image Path
              </label>

              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="/images/product.png"
              />

              <small>
                Example:
                /images/ratlamiSev.png
              </small>

            </div>

            <div className="admin-form-group admin-form-full">

              <label>
                Description *
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description..."
                rows="4"
              />

            </div>

            <div className="admin-form-actions">

              <button
                type="button"
                className="admin-cancel-btn"
                onClick={
                  handleCancelForm
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-save-btn"
                disabled={formLoading}
              >
                {formLoading
                  ? editingProduct
                    ? "Updating Product..."
                    : "Adding Product..."
                  : editingProduct
                  ? "Update Product ✏️"
                  : "Add Product 🎉"}
              </button>

            </div>

          </form>

        </div>

      )}

      {/* =====================================
          DASHBOARD STATISTICS
      ===================================== */}

      <div className="admin-stats-grid">

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            📦
          </div>

          <div className="admin-stat-info">

            <p>
              Total Products
            </p>

            <h2>
              {stats.totalProducts}
            </h2>

          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            🛒
          </div>

          <div className="admin-stat-info">

            <p>
              Total Orders
            </p>

            <h2>
              {stats.totalOrders}
            </h2>

          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            💰
          </div>

          <div className="admin-stat-info">

            <p>
              Total Revenue
            </p>

            <h2>
              ₹{stats.totalRevenue}
            </h2>

          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            🚚
          </div>

          <div className="admin-stat-info">

            <p>
              Active Orders
            </p>

            <h2>
              {stats.pendingOrders}
            </h2>

          </div>

        </div>

      </div>

      {/* =====================================
          RECENT ORDERS
      ===================================== */}

      <div className="admin-recent-orders">

        <div className="admin-recent-orders-header">

          <div>

            <p className="admin-tag">
              ORDERS
            </p>

            <h2>
              Recent Orders 📦
            </h2>

          </div>

          <button
            className="admin-view-all-btn"
            onClick={() =>
              navigate(
                "/admin/orders"
              )
            }
          >
            View All Orders →
          </button>

        </div>

        {recentOrders.length === 0 ? (

          <div className="admin-no-recent-orders">

            <h3>
              No Orders Yet 📦
            </h3>

            <p>
              Customer orders will appear here.
            </p>

          </div>

        ) : (

          <div className="admin-recent-orders-list">

            {recentOrders.map(
              (order) => (

                <div
                  className="admin-recent-order-row"
                  key={order._id}
                >

                  <div className="admin-recent-order-id">

                    <span>
                      ORDER
                    </span>

                    <strong>
                      #
                      {order._id
                        .slice(-6)
                        .toUpperCase()}
                    </strong>

                  </div>

                  <div className="admin-recent-order-customer">

                    <span>
                      Customer
                    </span>

                    <strong>
                      {order.customer
                        ?.name ||
                        order.user
                          ?.name ||
                        "N/A"}
                    </strong>

                  </div>

                  <div className="admin-recent-order-date">

                    <span>
                      Date
                    </span>

                    <strong>
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString()}
                    </strong>

                  </div>

                  <div className="admin-recent-order-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      ₹{order.total}
                    </strong>

                  </div>

                  <div className="admin-recent-order-status">

                    <span
                      className={
                        order.status ===
                        "Delivered"
                          ? "admin-status-delivered"
                          : order.status ===
                            "Cancelled"
                          ? "admin-status-cancelled"
                          : "admin-status-active"
                      }
                    >
                      {order.status}
                    </span>

                  </div>

                  <button
                    className="admin-recent-view-btn"
                    onClick={() =>
                      navigate(
                        `/admin/orders/${order._id}`
                      )
                    }
                  >
                    👁️
                  </button>

                </div>

              )
            )}

          </div>

        )}

      </div>

      {/* =====================================
          ANALYTICS
      ===================================== */}

      <div className="admin-analytics-section">

        {/* ANALYTICS HEADER */}

        <div className="admin-analytics-header">

          <div>

            <p className="admin-tag">
              ANALYTICS
            </p>

            <h2>
              Store Analytics 📊
            </h2>

            <p>
              Overview of your orders and revenue
            </p>

          </div>

          <div className="admin-analytics-filters">

            <button
              className={
                analyticsRange ===
                "today"
                  ? "active"
                  : ""
              }
              onClick={() =>
                handleAnalyticsRange(
                  "today"
                )
              }
            >
              Today
            </button>

            <button
              className={
                analyticsRange ===
                "7days"
                  ? "active"
                  : ""
              }
              onClick={() =>
                handleAnalyticsRange(
                  "7days"
                )
              }
            >
              7 Days
            </button>

            <button
              className={
                analyticsRange ===
                "30days"
                  ? "active"
                  : ""
              }
              onClick={() =>
                handleAnalyticsRange(
                  "30days"
                )
              }
            >
              30 Days
            </button>

            <button
              className={
                analyticsRange ===
                "all"
                  ? "active"
                  : ""
              }
              onClick={() =>
                handleAnalyticsRange(
                  "all"
                )
              }
            >
              All Time
            </button>

          </div>

        </div>

        {/* =====================================
            ANALYTICS SUMMARY CARDS
        ===================================== */}

        <div className="admin-analytics-summary">

          {/* ORDERS */}

          <div className="admin-analytics-summary-card">

            <div className="admin-analytics-summary-icon">
              🛒
            </div>

            <div>

              <span>
                Orders
              </span>

              <strong>
                {analytics.totalOrders}
              </strong>

            </div>

          </div>

          {/* REVENUE */}

          <div className="admin-analytics-summary-card">

            <div className="admin-analytics-summary-icon">
              💰
            </div>

            <div>

              <span>
                Revenue
              </span>

              <strong>
                ₹{analytics.totalRevenue}
              </strong>

            </div>

          </div>

          {/* ACTIVE */}

          <div className="admin-analytics-summary-card">

            <div className="admin-analytics-summary-icon">
              🚚
            </div>

            <div>

              <span>
                Active Orders
              </span>

              <strong>
                {analytics.activeOrders}
              </strong>

            </div>

          </div>

          {/* DELIVERED */}

          <div className="admin-analytics-summary-card">

            <div className="admin-analytics-summary-icon">
              ✅
            </div>

            <div>

              <span>
                Delivered
              </span>

              <strong>
                {analytics.deliveredOrders}
              </strong>

            </div>

          </div>

        </div>

        {/* =====================================
            ANALYTICS GRID
        ===================================== */}

        <div className="admin-analytics-grid">

          {/* ORDERS BY STATUS */}

          <div className="admin-analytics-card">

            <h3>
              Orders by Status
            </h3>

            <div className="admin-chart-container">

              <Bar
                data={
                  statusChartData
                }
                options={
                  statusChartOptions
                }
              />

            </div>

          </div>

          {/* REVENUE */}

          <div className="admin-analytics-card">

            <h3>
              Revenue Overview 💰
            </h3>

            <div className="admin-chart-container">

              {Object.keys(
                analytics.revenueData
              ).length === 0 ? (

                <div className="admin-no-analytics">
                  No revenue data yet.
                </div>

              ) : (

                <Bar
                  data={
                    revenueChartData
                  }
                  options={
                    revenueChartOptions
                  }
                />

              )}

            </div>

          </div>

          {/* TOP SELLING PRODUCTS */}

          <div className="admin-analytics-card admin-top-products-card">

            <h3>
              Top Selling Products 🏆
            </h3>

            {analytics
              .topSellingProducts
              .length === 0 ? (

              <div className="admin-no-analytics">
                No product sales data yet.
              </div>

            ) : (

              <div className="admin-chart-container">

                <Bar
                  data={
                    topProductsChartData
                  }
                  options={
                    topProductsChartOptions
                  }
                />

              </div>

            )}

          </div>

        </div>

      </div>

      {/* =====================================
          PRODUCTS
      ===================================== */}

      <div className="admin-section">

        <div className="admin-section-header">

          <h2>
            Products
          </h2>

          <span>
            {products.length} Products
          </span>

        </div>

        <div className="admin-products-grid">

          {products.map(
            (product) => (

              <div
                className="admin-product-card"
                key={product._id}
              >

                {/* IMAGE */}

                <div className="admin-product-image">

                  {product.image ? (

                    <img
                      src={
                        product.image
                      }
                      alt={
                        product.name
                      }
                    />

                  ) : (

                    <span>
                      {product.emoji}
                    </span>

                  )}

                </div>

                {/* INFO */}

                <div className="admin-product-info">

                  <span className="admin-product-category">
                    {product.category}
                  </span>

                  <h3>
                    {product.name}
                  </h3>

                  <p>
                    {product.description}
                  </p>

                  <div className="admin-product-price">

                    ₹{product.price}

                    <span>
                      {" "}
                      /{" "}
                      {product.weight}
                    </span>

                  </div>

                  {/* STOCK */}

                  <div
                    className={
                      Number(
                        product.stock || 0
                      ) === 0
                        ? "admin-stock out-of-stock"
                        : Number(
                            product.stock || 0
                          ) <= 10
                        ? "admin-stock low-stock"
                        : "admin-stock in-stock"
                    }
                  >
                    {Number(
                      product.stock || 0
                    ) === 0
                      ? "❌ Out of Stock"
                      : Number(
                          product.stock || 0
                        ) <= 10
                      ? `⚠️ Low Stock: ${Number(
                          product.stock
                        )}`
                      : `📦 Stock: ${Number(
                          product.stock
                        )}`}
                  </div>

                  {/* ACTIONS */}

                  <div className="admin-product-actions">

                    <button
                      className="admin-edit-btn"
                      onClick={() =>
                        handleEditProduct(
                          product
                        )
                      }
                    >
                      ✏️ Edit
                    </button>

                    <button
                      className="admin-delete-btn"
                      onClick={() =>
                        handleDeleteProduct(
                          product._id
                        )
                      }
                    >
                      🗑️ Delete
                    </button>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;