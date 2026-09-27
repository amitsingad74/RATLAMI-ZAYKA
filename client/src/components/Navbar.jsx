import {
  Link,
  NavLink,
  useNavigate
} from "react-router-dom";

import { useState } from "react";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

import logo from "../assets/logo.png";


function Navbar() {

  // ================= CART =================

  const { cartCount } = useCart();


  // ================= WISHLIST =================

  const { wishlistCount } =
    useWishlist();


  // ================= NAVIGATION =================

  const navigate = useNavigate();


  // ================= SEARCH STATE =================

  const [search, setSearch] =
    useState("");


  // ================= CHECK LOGIN =================

  const token =
    localStorage.getItem("token");


  // ================= SEARCH FUNCTION =================

  const handleSearch = (e) => {

    e.preventDefault();

    const trimmedSearch =
      search.trim();


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


        {/* ================= PROFILE ================= */}

        {token ? (

          /*
            If logged in:
            Clicking the profile icon directly
            opens the Profile page.
          */

          <Link
            to="/profile"
            className="profile-menu-btn"
            title="My Profile"
          >

            👤

          </Link>

        ) : (

          /*
            If not logged in:
            Clicking the profile icon opens Login.
          */

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