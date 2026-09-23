import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";

const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

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

  const [productImageUploading, setProductImageUploading] =
    useState(false);

  const [categoryImageUploading, setCategoryImageUploading] =
    useState(false);

  // =========================================
  // PRODUCTS
  // =========================================

  const [products, setProducts] = useState([]);

  // =========================================
  // CATEGORIES
  // =========================================

  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    image: "",
    description: "",
    displayOrder: 0,
    active: true,
  });

  // =========================================
  // PRODUCT FILTERS + SORTING
  // =========================================

  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [productSort, setProductSort] = useState("default");

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
    showOnHomepage: false,
  });

  // =========================================
  // CLOUDINARY IMAGE UPLOAD
  // =========================================

  const uploadImageToCloudinary = async (file) => {
    if (!file) {
      return "";
    }

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error(
        "Image upload is not configured. Please contact the website administrator."
      );
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("Please select a valid image file.");
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new Error("Image size must be 5 MB or less.");
    }

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: uploadData,
      }
    );

    const data = await response.json();

    if (!response.ok || !data.secure_url) {
      throw new Error(
        data.error?.message || "Image upload failed. Please try again."
      );
    }

    return data.secure_url;
  };

  const handleProductImageUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setFormError("");
    setProductImageUploading(true);

    try {
      const imageUrl = await uploadImageToCloudinary(file);

      setFormData((previous) => ({
        ...previous,
        image: imageUrl,
      }));
    } catch (error) {
      console.error("Product Image Upload Error:", error);
      setFormError(error.message || "Failed to upload product image.");
    } finally {
      setProductImageUploading(false);
      e.target.value = "";
    }
  };

  const handleCategoryImageUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setCategoryError("");
    setCategoryImageUploading(true);

    try {
      const imageUrl = await uploadImageToCloudinary(file);

      setCategoryForm((previous) => ({
        ...previous,
        image: imageUrl,
      }));
    } catch (error) {
      console.error("Category Image Upload Error:", error);
      setCategoryError(
        error.message || "Failed to upload category image."
      );
    } finally {
      setCategoryImageUploading(false);
      e.target.value = "";
    }
  };

  // =========================================
  // FETCH PRODUCTS
  // =========================================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/products`,
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
  // FETCH CATEGORIES
  // =========================================

  const fetchCategories = async () => {
    try {
      setCategoryLoading(true);
      setCategoryError("");

      const response = await fetch(
        `${API_URL}/api/admin/categories`,
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
          data.message || "Failed to fetch categories."
        );
      }

      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Admin Categories Error:", error);
      setCategoryError(
        error.message || "Unable to load categories."
      );
    } finally {
      setCategoryLoading(false);
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      image: "",
      description: "",
      displayOrder: 0,
      active: true,
    });
    setEditingCategory(null);
    setShowCategoryForm(false);
    setCategoryError("");
  };

  const handleCategoryChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategoryForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setCategoryError("");

    if (!categoryForm.name.trim()) {
      setCategoryError("Category name is required.");
      return;
    }

    if (Number(categoryForm.displayOrder) < 0) {
      setCategoryError("Display order cannot be negative.");
      return;
    }

    try {
      setCategoryLoading(true);

      const url = editingCategory
        ? `${API_URL}/api/admin/categories/${editingCategory._id}`
        : `${API_URL}/api/admin/categories`;

      const response = await fetch(url, {
        method: editingCategory ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: categoryForm.name.trim(),
          image: categoryForm.image.trim(),
          description: categoryForm.description.trim(),
          displayOrder: Number(categoryForm.displayOrder) || 0,
          active: Boolean(categoryForm.active),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save category."
        );
      }

      alert(
        editingCategory
          ? "Category updated successfully! ✏️"
          : "Category added successfully! 🎉"
      );

      resetCategoryForm();
      await fetchCategories();
    } catch (error) {
      console.error("Save Category Error:", error);
      setCategoryError(
        error.message || "Failed to save category."
      );
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name || "",
      image: category.image || "",
      description: category.description || "",
      displayOrder: category.displayOrder ?? 0,
      active: category.active !== false,
    });
    setCategoryError("");
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      setCategoryLoading(true);
      const response = await fetch(
        `${API_URL}/api/admin/categories/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete category."
        );
      }

      alert("Category deleted successfully! 🗑️");
      await fetchCategories();
    } catch (error) {
      console.error("Delete Category Error:", error);
      setCategoryError(
        error.message || "Failed to delete category."
      );
    } finally {
      setCategoryLoading(false);
    }
  };

  // =========================================
  // FETCH RECENT ORDERS
  // =========================================

  const fetchRecentOrders = async () => {
    try {
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
        `${API_URL}/api/admin/stats`,
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
        `${API_URL}/api/admin/analytics?range=${range}`,
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
    fetchCategories();
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
      showOnHomepage: false,
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

      showOnHomepage:
        Boolean(product.showOnHomepage),
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
        `${API_URL}/api/admin/products`,
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

            showOnHomepage:
              Boolean(formData.showOnHomepage),
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
          `${API_URL}/api/admin/products/${editingProduct._id}`,
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

              showOnHomepage:
                Boolean(formData.showOnHomepage),
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
          showOnHomepage: false,
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
          `${API_URL}/api/admin/products/${id}`,
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
      showOnHomepage: false,
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
  // FILTERED + SORTED PRODUCTS
  // =========================================

  const productCategories = [
    ...new Set(
      products
        .map((product) => String(product.category || "").trim())
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b));

  const normalizedSearch = productSearch.trim().toLowerCase();

  const filteredProducts = products
    .filter((product) => {
      const name = String(product.name || "").toLowerCase();
      const category = String(product.category || "").trim().toLowerCase();
      const description = String(product.description || "").toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        name.includes(normalizedSearch) ||
        category.includes(normalizedSearch) ||
        description.includes(normalizedSearch);

      const matchesCategory =
        productCategory === "all" ||
        category === productCategory.toLowerCase();

      const stock = Number(product.stock) || 0;

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "out" && stock === 0) ||
        (stockFilter === "low" && stock > 0 && stock <= 10) ||
        (stockFilter === "in" && stock > 10);

      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      if (productSort === "price-low") {
        return (Number(a.price) || 0) - (Number(b.price) || 0);
      }

      if (productSort === "price-high") {
        return (Number(b.price) || 0) - (Number(a.price) || 0);
      }

      if (productSort === "stock-low") {
        return (Number(a.stock) || 0) - (Number(b.stock) || 0);
      }

      if (productSort === "stock-high") {
        return (Number(b.stock) || 0) - (Number(a.stock) || 0);
      }

      return 0;
    });

  const hasActiveProductFilters =
    productSearch.trim() !== "" ||
    productCategory !== "all" ||
    stockFilter !== "all" ||
    productSort !== "default";

  const clearProductFilters = () => {
    setProductSearch("");
    setProductCategory("all");
    setStockFilter("all");
    setProductSort("default");
  };

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

            <div className="admin-form-group admin-image-upload-group">

              <label>
                Product Image
              </label>

              {formData.image && (
                <div className="admin-image-preview">
                  <img
                    src={formData.image}
                    alt="Product preview"
                  />
                </div>
              )}

              <label className="admin-upload-btn">
                {productImageUploading
                  ? "Uploading Image..."
                  : formData.image
                  ? "Replace Image"
                  : "Choose Image"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleProductImageUpload}
                  disabled={productImageUploading}
                  hidden
                />
              </label>

              {formData.image && (
                <button
                  type="button"
                  className="admin-remove-image-btn"
                  onClick={() =>
                    setFormData((previous) => ({
                      ...previous,
                      image: "",
                    }))
                  }
                  disabled={productImageUploading}
                >
                  Remove Image
                </button>
              )}

              <small>
                JPG, PNG, WEBP or GIF. Maximum 5 MB.
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

            <div className="admin-form-group admin-form-full admin-homepage-checkbox">
              <label>
                <input
                  type="checkbox"
                  name="showOnHomepage"
                  checked={Boolean(formData.showOnHomepage)}
                  onChange={(e) =>
                    setFormData((previous) => ({
                      ...previous,
                      showOnHomepage: e.target.checked,
                    }))
                  }
                />
                Show this product in Popular Products on homepage
              </label>
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
                disabled={formLoading || productImageUploading}
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
          CATEGORIES
      ===================================== */}

      <div className="admin-section admin-category-manager">
        <div className="admin-section-header">
          <div>
            <h2>Categories</h2>
            <span>{categories.length} Categories</span>
          </div>

          <button
            className="admin-add-btn"
            onClick={() => {
              if (showCategoryForm) {
                resetCategoryForm();
              } else {
                setEditingCategory(null);
                setCategoryError("");
                setShowCategoryForm(true);
              }
            }}
          >
            {showCategoryForm ? "✕ Close" : "+ Add Category"}
          </button>
        </div>

        {showCategoryForm && (
          <form
            className="admin-product-form admin-category-form"
            onSubmit={handleSaveCategory}
          >
            {categoryError && (
              <div className="admin-form-error admin-form-full">
                {categoryError}
              </div>
            )}

            <div className="admin-form-group">
              <label>Category Name *</label>
              <input
                type="text"
                name="name"
                value={categoryForm.name}
                onChange={handleCategoryChange}
                placeholder="e.g. Namkeen"
              />
            </div>

            <div className="admin-form-group">
              <label>Display Order</label>
              <input
                type="number"
                name="displayOrder"
                min="0"
                value={categoryForm.displayOrder}
                onChange={handleCategoryChange}
              />
            </div>

            <div className="admin-form-group admin-form-full admin-image-upload-group">
              <label>Category Image</label>

              {categoryForm.image && (
                <div className="admin-image-preview admin-category-image-preview">
                  <img
                    src={categoryForm.image}
                    alt="Category preview"
                  />
                </div>
              )}

              <label className="admin-upload-btn">
                {categoryImageUploading
                  ? "Uploading Image..."
                  : categoryForm.image
                  ? "Replace Image"
                  : "Choose Image"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleCategoryImageUpload}
                  disabled={categoryImageUploading}
                  hidden
                />
              </label>

              {categoryForm.image && (
                <button
                  type="button"
                  className="admin-remove-image-btn"
                  onClick={() =>
                    setCategoryForm((previous) => ({
                      ...previous,
                      image: "",
                    }))
                  }
                  disabled={categoryImageUploading}
                >
                  Remove Image
                </button>
              )}

              <small>
                JPG, PNG, WEBP or GIF. Maximum 5 MB.
              </small>
            </div>

            <div className="admin-form-group admin-form-full">
              <label>Description</label>
              <textarea
                name="description"
                value={categoryForm.description}
                onChange={handleCategoryChange}
                placeholder="Short category description..."
                rows="3"
              />
            </div>

            <div className="admin-form-group admin-category-checkbox">
              <label>
                <input
                  type="checkbox"
                  name="active"
                  checked={categoryForm.active}
                  onChange={handleCategoryChange}
                />
                Show category on homepage
              </label>
            </div>

            <div className="admin-form-actions admin-form-full">
              <button
                type="button"
                className="admin-cancel-btn"
                onClick={resetCategoryForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-save-btn"
                disabled={categoryLoading || categoryImageUploading}
              >
                {categoryLoading
                  ? "Saving Category..."
                  : editingCategory
                  ? "Update Category ✏️"
                  : "Add Category 🎉"}
              </button>
            </div>
          </form>
        )}

        {categoryLoading && categories.length === 0 ? (
          <div className="admin-no-analytics">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="admin-no-analytics">No categories yet. Add your first category.</div>
        ) : (
          <div className="admin-category-grid">
            {categories.map((category) => (
              <div className="admin-category-card" key={category._id}>
                <div className="admin-category-image">
                  {category.image ? (
                    <img src={category.image} alt={category.name} />
                  ) : (
                    <span>🍽️</span>
                  )}
                </div>
                <div className="admin-category-info">
                  <span className="admin-product-category">Order: {category.displayOrder}</span>
                  <h3>{category.name}</h3>
                  <p>{category.description || "No description added."}</p>
                  <span className={category.active ? "admin-category-active" : "admin-category-inactive"}>
                    {category.active ? "✓ Homepage Active" : "○ Hidden"}
                  </span>
                  <div className="admin-product-actions">
                    <button className="admin-edit-btn" onClick={() => handleEditCategory(category)}>✏️ Edit</button>
                    <button className="admin-delete-btn" onClick={() => handleDeleteCategory(category._id)}>🗑️ Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =====================================
          PRODUCTS
      ===================================== */}

      <div className="admin-section">

        <div className="admin-section-header">

          <div>
            <h2>
              Products
            </h2>

            <span>
              {filteredProducts.length} of {products.length} Products
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                placeholder="🔍 Search products..."
                value={productSearch}
                onChange={(e) =>
                  setProductSearch(e.target.value)
                }
                style={{
                  width: "230px",
                  padding: "11px 38px 11px 13px",
                  border: "1px solid #ddd5c8",
                  borderRadius: "10px",
                  background: "#fff",
                  fontSize: "14px",
                  outline: "none",
                }}
              />

              {productSearch && (
                <button
                  type="button"
                  onClick={() => setProductSearch("")}
                  style={{
                    position: "absolute",
                    right: "9px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "15px",
                    color: "#777",
                  }}
                  aria-label="Clear product search"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={productCategory}
              onChange={(e) =>
                setProductCategory(e.target.value)
              }
              style={{
                padding: "11px 12px",
                border: "1px solid #ddd5c8",
                borderRadius: "10px",
                background: "#fff",
                fontSize: "14px",
                cursor: "pointer",
                outline: "none",
              }}
              aria-label="Filter by category"
            >
              <option value="all">
                All Categories
              </option>

              {productCategories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) =>
                setStockFilter(e.target.value)
              }
              style={{
                padding: "11px 12px",
                border: "1px solid #ddd5c8",
                borderRadius: "10px",
                background: "#fff",
                fontSize: "14px",
                cursor: "pointer",
                outline: "none",
              }}
              aria-label="Filter by stock"
            >
              <option value="all">
                All Stock
              </option>
              <option value="in">
                In Stock (&gt; 10)
              </option>
              <option value="low">
                Low Stock (1-10)
              </option>
              <option value="out">
                Out of Stock
              </option>
            </select>

            <select
              value={productSort}
              onChange={(e) =>
                setProductSort(e.target.value)
              }
              style={{
                padding: "11px 12px",
                border: "1px solid #ddd5c8",
                borderRadius: "10px",
                background: "#fff",
                fontSize: "14px",
                cursor: "pointer",
                outline: "none",
              }}
              aria-label="Sort products"
            >
              <option value="default">
                Sort: Default
              </option>
              <option value="price-low">
                Price: Low to High
              </option>
              <option value="price-high">
                Price: High to Low
              </option>
              <option value="stock-low">
                Stock: Low to High
              </option>
              <option value="stock-high">
                Stock: High to Low
              </option>
            </select>

            {hasActiveProductFilters && (
              <button
                type="button"
                onClick={clearProductFilters}
                style={{
                  padding: "11px 13px",
                  border: "1px solid #e0b34f",
                  borderRadius: "10px",
                  background: "#fff8e8",
                  color: "#9a6800",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            )}
          </div>

        </div>

        {filteredProducts.length === 0 ? (

          <div
            style={{
              padding: "50px 20px",
              textAlign: "center",
              background: "#fff",
              border: "1px solid #e8e2d8",
              borderRadius: "16px",
              marginTop: "20px",
            }}
          >
            <div
              style={{
                fontSize: "42px",
                marginBottom: "10px",
              }}
            >
              🔍
            </div>

            <h3
              style={{
                margin: "0 0 8px",
                color: "#17324d",
              }}
            >
              No products found
            </h3>

            <p
              style={{
                margin: "0 0 18px",
                color: "#777",
              }}
            >
              Try changing your search or filters.
            </p>

            {hasActiveProductFilters && (
              <button
                type="button"
                onClick={clearProductFilters}
                className="admin-view-all-btn"
              >
                Clear Filters
              </button>
            )}
          </div>

        ) : (

          <div className="admin-products-grid">

            {filteredProducts.map(
              (product) => (

                <div
                  className="admin-product-card"
                  key={product._id}
                >

                  {/* IMAGE */}

                  <div className="admin-product-image">

                    {product.image ? (

                      <img
                        src={product.image}
                        alt={product.name}
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
                        Number(product.stock || 0) === 0
                          ? "admin-stock out-of-stock"
                          : Number(product.stock || 0) <= 10
                          ? "admin-stock low-stock"
                          : "admin-stock in-stock"
                      }
                    >
                      {Number(product.stock || 0) === 0
                        ? "❌ Out of Stock"
                        : Number(product.stock || 0) <= 10
                        ? `⚠️ Low Stock: ${Number(
                            product.stock
                          )}`
                        : `📦 Stock: ${Number(
                            product.stock
                          )}`}
                    </div>

                    {product.showOnHomepage && (
                      <div className="admin-homepage-badge">
                        ⭐ Popular on Homepage
                      </div>
                    )}

                    {/* ACTIONS */}

                    <div className="admin-product-actions">

                      <button
                        className="admin-edit-btn"
                        onClick={() =>
                          handleEditProduct(product)
                        }
                      >
                        ✏️ Edit
                      </button>

                      <button
                        className="admin-delete-btn"
                        onClick={() =>
                          handleDeleteProduct(product._id)
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

        )}

      </div>

    </div>
  );
}

export default AdminDashboard;