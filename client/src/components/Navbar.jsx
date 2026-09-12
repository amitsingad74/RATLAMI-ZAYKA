import {
  Link,
  NavLink,
  useNavigate,
  useLocation
} from "react-router-dom";

import { useState } from "react";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

import logo from "../assets/logo.png";


function Navbar() {

  // ================= CART =================

  const { cartCount } = useCart();


  // ================= WISHLIST =================

  const { wishlistCount } = useWishlist();


  // ================= NAVIGATION =================

  const navigate = useNavigate();

  useLocation();


  // ================= SEARCH STATE =================

  const [search, setSearch] = useState("");


  // ================= CHECK LOGIN =================

  const token = localStorage.getItem("token");


  // ================= SEARCH FUNCTION =================

  const handleSearch = (e) => {

    e.preventDefault();

    const trimmedSearch = search.trim();


    if (trimmedSearch) {

      navigate(
        `/products?search=${encodeURIComponent(
          trimmedSearch
        )}`
      );

    } else {

      navigate("/products");

    }

  };


  // ================= LOGOUT =================

  const handleLogout = () => {

    // Remove JWT Token
    localStorage.removeItem("token");

    // Remove User Information
    localStorage.removeItem("user");


    alert("Logged out successfully! 👋");


    // Redirect to Login Page
    navigate("/login");

  };


  return (

    <nav className="navbar">


      {/* ================= LOGO ================= */}

      <div className="logo">

        <Link to="/">

          <img
            src={logo}
            alt="Ratlami Zayka"
          />

        </Link>

      </div>


      {/* ================= NAVIGATION LINKS ================= */}

      <div className="nav-links">


        {/* HOME */}

        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "nav-link active"
              : "nav-link"
          }
        >
          Home
        </NavLink>


        {/* PRODUCTS */}

        <NavLink
          to="/products"
          className={({ isActive }) =>
            isActive
              ? "nav-link active"
              : "nav-link"
          }
        >
          Products
        </NavLink>


        {/* CATEGORIES */}

        <a
          href="/#categories"
          className="nav-link"
        >
          Categories
        </a>


        {/* ABOUT US */}

        <a
          href="/#about"
          className="nav-link"
        >
          About Us
        </a>


      </div>


      {/* ================= NAVBAR ACTIONS ================= */}

      <div className="nav-actions">


        {/* ================= SEARCH ================= */}

        <form
          className="search-box"
          onSubmit={handleSearch}
        >

          <input
            type="text"
            placeholder="Search for sweets, namkeen..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />


          <button
            type="submit"
            className="search-btn"
          >
            🔍
          </button>

        </form>


        {/* ================= WISHLIST ================= */}

        <Link
          to="/wishlist"
          className="wishlist-navbar"
          title="Wishlist"
        >

          <span className="wishlist-icon">
            ❤️
          </span>


          {wishlistCount > 0 && (

            <span className="wishlist-count">
              {wishlistCount}
            </span>

          )}

        </Link>


        {/* ================= CART ================= */}

        <Link
          to="/cart"
          className="cart-button"
          title="Cart"
        >

          <span className="cart-icon">
            🛒
          </span>


          {cartCount > 0 && (

            <span className="cart-count">
              {cartCount}
            </span>

          )}

        </Link>


        {/* ================= LOGIN / PROFILE / LOGOUT ================= */}

        {token ? (

          <>

            {/* PROFILE */}

            <Link
              to="/profile"
              className="profile-button"
              title="My Profile"
            >
              👤
            </Link>


            {/* LOGOUT */}

            <button
              onClick={handleLogout}
              className="logout-btn"
            >
              Logout
            </button>

          </>

        ) : (

          /* LOGIN */

          <Link
            to="/login"
            className="profile-button"
            title="Login"
          >
            👤
          </Link>

        )}


      </div>


    </nav>

  );

}


export default Navbar;