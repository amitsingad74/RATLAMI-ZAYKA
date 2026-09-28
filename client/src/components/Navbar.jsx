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

  const { cartCount } = useCart();

  const { wishlistCount } =
    useWishlist();

  const navigate = useNavigate();

  const [search, setSearch] =
    useState("");

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [mobileSearchOpen, setMobileSearchOpen] =
    useState(false);

  const token =
    localStorage.getItem("token");


  /* =====================================================
     SEARCH
     ===================================================== */

  const handleSearch = (e) => {

    e.preventDefault();

    const trimmedSearch =
      search.trim();

    if (!trimmedSearch) {
      return;
    }

    setMobileSearchOpen(false);

    navigate(
      `/products?search=${encodeURIComponent(
        trimmedSearch
      )}`
    );

  };


  /* =====================================================
     MOBILE SEARCH TOGGLE
     ===================================================== */

  const toggleMobileSearch = () => {

    setMobileSearchOpen(
      (previous) => !previous
    );

    setMobileMenuOpen(false);

  };


  /* =====================================================
     MOBILE MENU
     ===================================================== */

  const closeMobileMenu = () => {

    setMobileMenuOpen(false);

  };


  return (
    <>
      <nav className="rz-navbar">


        {/* =================================================
            MOBILE MENU BUTTON
            ================================================= */}

        <button
          type="button"
          className="rz-mobile-menu-btn"

          onClick={() => {

            setMobileMenuOpen(
              (previous) => !previous
            );

            setMobileSearchOpen(false);

          }}

          aria-label={
            mobileMenuOpen
              ? "Close menu"
              : "Open menu"
          }
        >
          {mobileMenuOpen
            ? "✕"
            : "☰"}
        </button>


        {/* =================================================
            LOGO
            ================================================= */}

        <div className="rz-logo">

          <Link
            to="/"
            onClick={() => {
              closeMobileMenu();
              setMobileSearchOpen(false);
            }}
          >

            <img
              src={logo}
              alt="Ratlami Zayka"
            />

          </Link>

        </div>


        {/* =================================================
            DESKTOP NAV LINKS
            ================================================= */}

        <div className="rz-nav-links">

          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "rz-nav-link active"
                : "rz-nav-link"
            }
          >
            Home
          </NavLink>


          <NavLink
            to="/products"
            className={({ isActive }) =>
              isActive
                ? "rz-nav-link active"
                : "rz-nav-link"
            }
          >
            Products
          </NavLink>


          <a
            href="/#categories"
            className="rz-nav-link"
          >
            Categories
          </a>


          <a
            href="/#about"
            className="rz-nav-link"
          >
            About Us
          </a>

        </div>


        {/* =================================================
            ACTIONS
            ================================================= */}

        <div className="rz-nav-actions">


          {/* ===============================================
              DESKTOP SEARCH
              =============================================== */}

          <form
            className="rz-search-box rz-desktop-search"

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
              className="rz-search-btn"
              aria-label="Search"
            >
              🔍
            </button>

          </form>


          {/* ===============================================
              MOBILE SEARCH BUTTON
              =============================================== */}

          <button
            type="button"
            className="rz-mobile-search-btn"

            onClick={
              toggleMobileSearch
            }

            aria-label="Search"
          >
            🔍
          </button>


          {/* ===============================================
              WISHLIST
              =============================================== */}

          <Link
            to="/wishlist"
            className="rz-wishlist"
            title="Wishlist"
          >

            <span>
              ❤️
            </span>

            {wishlistCount > 0 && (

              <span className="rz-count rz-wishlist-count">
                {wishlistCount}
              </span>

            )}

          </Link>


          {/* ===============================================
              CART
              =============================================== */}

          <Link
            to="/cart"
            className="rz-cart"
            title="Cart"
          >

            <span>
              🛒
            </span>

            {cartCount > 0 && (

              <span className="rz-count rz-cart-count">
                {cartCount}
              </span>

            )}

          </Link>


          {/* ===============================================
              PROFILE
              =============================================== */}

          {token ? (

            <Link
              to="/profile"
              className="rz-profile"
              title="My Profile"
            >
              👤
            </Link>

          ) : (

            <Link
              to="/login"
              className="rz-profile"
              title="Login"
            >
              👤
            </Link>

          )}

        </div>

      </nav>


      {/* ===================================================
          MOBILE SEARCH PANEL
          =================================================== */}

      {mobileSearchOpen && (

        <div className="rz-mobile-search-panel">

          <form
            onSubmit={handleSearch}
          >

            <input
              type="text"
              placeholder="Search for sweets, namkeen..."

              value={search}

              onChange={(e) =>
                setSearch(e.target.value)
              }

              autoFocus
            />

            <button
              type="submit"
              aria-label="Search"
            >
              🔍
            </button>

          </form>

        </div>

      )}


      {/* ===================================================
          MOBILE MENU
          =================================================== */}

      {mobileMenuOpen && (

        <div className="rz-mobile-menu">

          <NavLink
            to="/"

            className={({ isActive }) =>
              isActive
                ? "rz-mobile-menu-link active"
                : "rz-mobile-menu-link"
            }

            onClick={
              closeMobileMenu
            }
          >

            <span>
              Home
            </span>

            <span>
              ›
            </span>

          </NavLink>


          <NavLink
            to="/products"

            className={({ isActive }) =>
              isActive
                ? "rz-mobile-menu-link active"
                : "rz-mobile-menu-link"
            }

            onClick={
              closeMobileMenu
            }
          >

            <span>
              Products
            </span>

            <span>
              ›
            </span>

          </NavLink>


          <a
            href="/#categories"
            className="rz-mobile-menu-link"

            onClick={
              closeMobileMenu
            }
          >

            <span>
              Categories
            </span>

            <span>
              ›
            </span>

          </a>


          <a
            href="/#about"
            className="rz-mobile-menu-link"

            onClick={
              closeMobileMenu
            }
          >

            <span>
              About Us
            </span>

            <span>
              ›
            </span>

          </a>

        </div>

      )}

    </>
  );
}


export default Navbar;