import { Routes, Route, Link } from "react-router-dom";
import "./App.css";

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

import ProtectedRoute from "./components/ProtectedRoute";
import ProductDetails from "./pages/ProductDetails";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* LOGO */}
        <div className="footer-logo">
          <div className="footer-brand">
            RATLAMI<br />
            <span>ZAYKA</span>
          </div>
        </div>


        {/* LINKS */}
        <div className="footer-links">
          <Link to="/">Home</Link>
          <span>|</span>

          <Link to="/products">Products</Link>
          <span>|</span>

          <a href="#categories">Categories</a>
          <span>|</span>

          <a href="#about">About Us</a>
          <span>|</span>

          <a href="#contact">Contact</a>
        </div>


        {/* RIGHT SIDE */}
        <div className="footer-right">

          <div className="footer-social">
            <a href="#facebook">●</a>
            <a href="#instagram">◎</a>
            <a href="#youtube">▶</a>
          </div>

          <p>
            © 2026 RATLAMI ZAYKA. All rights reserved.
          </p>

        </div>

      </div>
    </footer>
  );
}


function App() {
  return (
    <>
      <Navbar />

      <Routes>

  <Route
    path="/"
    element={<Home />}
  />

  <Route
    path="/products"
    element={<Products />}
  />

  <Route
    path="/cart"
    element={<Cart />}
  />

  <Route
    path="/login"
    element={<Login />}
  />

  <Route
    path="/register"
    element={<Register />}
  />


  {/* WISHLIST */}

  <Route
    path="/wishlist"
    element={<Wishlist />}
  />


  {/* PROTECTED PROFILE */}

  <Route
    path="/profile"
    element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    }
  />


  {/* PROTECTED ORDERS */}

  <Route
    path="/orders"
    element={
      <ProtectedRoute>
        <Orders />
      </ProtectedRoute>
    }
  />


  {/* PROTECTED CHECKOUT */}

  <Route
    path="/checkout"
    element={
      <ProtectedRoute>
        <Checkout />
      </ProtectedRoute>
    }
  />

  <Route
  path="/products/:id"
  element={<ProductDetails />}
/>

</Routes>
      {/* FOOTER */}
      <Footer />
    </>
  );
}

export default App;