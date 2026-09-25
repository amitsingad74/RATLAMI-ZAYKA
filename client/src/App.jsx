import { Routes, Route, Link } from "react-router-dom";
import "./App.css";

import { CartProvider } from "./context/CartContext";

import Navbar from "./components/Navbar";

import Wishlist from "./pages/Wishlist";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import ProductDetails from "./pages/ProductDetails";
import ContactUs from "./pages/ContactUs";
import OrderDetails from "./pages/OrderDetails";

import ProtectedRoute from "./components/ProtectedRoute";

import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminUsers from "./pages/AdminUsers";
import AdminOrderDetails from "./pages/AdminOrderDetails";
import AdminContactMessages from "./pages/AdminContactMessages";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundCancellationPolicy from "./pages/RefundCancellationPolicy";
import ShippingDeliveryPolicy from "./pages/ShippingDeliveryPolicy";
import AboutUs from "./pages/AboutUs";


// =====================================================
// FOOTER
// =====================================================

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* LOGO */}
        <div className="footer-logo">
          <div className="footer-brand">
            RATLAMI
            <br />
            <span>ZAYEKA</span>
          </div>
        </div>


        {/* LINKS */}
        <div className="footer-links">

          <Link to="/">
            Home
          </Link>

          <span>|</span>

          <Link to="/products">
            Products
          </Link>

          <span>|</span>

          <a href="#categories">
            Categories
          </a>

          <span>|</span>

          <Link to="/about">
            About Us
          </Link>

          <span>|</span>

          <Link to="/contact">
            Contact
          </Link>

          <span>|</span>

          <Link to="/terms">
            Terms & Conditions
          </Link>

          <span>|</span>

          <Link to="/privacy-policy">
            Privacy Policy
          </Link>

          <span>|</span>

          <Link to="/refund-cancellation">
            Refund & Cancellation
          </Link>

          <span>|</span>

          <Link to="/shipping-delivery">
            Shipping & Delivery
          </Link>

        </div>


        {/* RIGHT SIDE */}
        <div className="footer-right">

          <div className="footer-social">

            <a href="#facebook">
              ●
            </a>

            <a href="#instagram">
              ◎
            </a>

            <a href="#youtube">
              ▶
            </a>

          </div>

          <p>
            © 2026 RATLAMI ZAYEKA. All rights reserved.
          </p>

        </div>

      </div>
    </footer>
  );
}

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <CartProvider>

      {/* NAVBAR HAS ACCESS TO useCart() */}
      <Navbar />

      <Routes>

        {/* =================================================
            HOME
        ================================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* =================================================
            PRODUCTS
        ================================================= */}

        <Route
          path="/products"
          element={<Products />}
        />

        {/* =================================================
            PRODUCT DETAILS
        ================================================= */}

        <Route
          path="/products/:id"
          element={<ProductDetails />}
        />

        {/* =================================================
            CART
        ================================================= */}

        <Route
          path="/cart"
          element={<Cart />}
        />

        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* =================================================
            REGISTER
        ================================================= */}

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =================================================
            WISHLIST
        ================================================= */}

        <Route
          path="/wishlist"
          element={<Wishlist />}
        />

        {/* =================================================
            CONTACT US
        ================================================= */}

        <Route
          path="/contact"
          element={<ContactUs />}
        />

        {/* =================================================
            PROTECTED PROFILE
        ================================================= */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            PROTECTED ORDERS
        ================================================= */}

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            PROTECTED ORDER DETAILS
        ================================================= */}

        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            PROTECTED CHECKOUT
        ================================================= */}

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            ADMIN DASHBOARD
        ================================================= */}

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        {/* =================================================
            ADMIN ORDERS
        ================================================= */}

        <Route
          path="/admin/orders"
          element={<AdminOrders />}
        />

        {/* =================================================
            ADMIN ORDER DETAILS
        ================================================= */}

        <Route
          path="/admin/orders/:id"
          element={<AdminOrderDetails />}
        />

        {/* =================================================
            ADMIN USERS
        ================================================= */}

        <Route
          path="/admin/users"
          element={<AdminUsers />}
        />

        {/* =================================================
            ADMIN CONTACT MESSAGES
        ================================================= */}

        <Route
          path="/admin/contact-messages"
          element={<AdminContactMessages />}
        />

        <Route
  path="/terms"
  element={<TermsAndConditions />}
/>

<Route
  path="/privacy-policy"
  element={<PrivacyPolicy />}
/>

<Route
  path="/refund-cancellation"
  element={<RefundCancellationPolicy />}
/>

<Route
  path="/terms"
  element={<TermsAndConditions />}
/>

<Route
  path="/privacy-policy"
  element={<PrivacyPolicy />}
/>

<Route
  path="/refund-cancellation"
  element={<RefundCancellationPolicy />}
/>

<Route
  path="/shipping-delivery"
  element={<ShippingDeliveryPolicy />}
/>

<Route
  path="/about"
  element={<AboutUs />}
/>

      </Routes>

      {/* FOOTER */}
      <Footer />

    </CartProvider>
  );
}

export default App;