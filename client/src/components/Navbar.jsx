import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { cartCount } = useCart();

  const navigate = useNavigate();

  // Check if user is logged in
  const token = localStorage.getItem("token");

  // Logout function
  const handleLogout = () => {
    // Remove JWT token
    localStorage.removeItem("token");

    alert("Logged out successfully! 👋");

    // Redirect to login page
    navigate("/login");

    // Refresh page so Navbar updates
    window.location.reload();
  };

  return (
    <nav className="navbar">

      {/* LOGO */}
      <div className="logo">
        🌶️ RATLAMI <span>ZAYKA</span>
      </div>


      {/* NAVIGATION LINKS */}
      <div className="nav-links">

        <Link to="/">
          Home
        </Link>

        <Link to="/products">
          Products
        </Link>

        <Link to="/#categories">
          Categories
        </Link>

        <Link to="/#about">
          About Us
        </Link>

      </div>


      {/* NAV ICONS */}
      <div className="nav-icons">

        {/* Search */}
        <span className="search-icon">
          🔍
        </span>


        {/* Cart */}
        <Link to="/cart" className="cart-icon">
          🛒

          {cartCount > 0 && (
            <span className="cart-count">
              {cartCount}
            </span>
          )}
        </Link>


        {/* Login / Logout */}
        {token ? (
          <button
            onClick={handleLogout}
            className="logout-btn"
          >
            Logout
          </button>
        ) : (
          <Link to="/login">
            👤
          </Link>
        )}

      </div>

    </nav>
  );
}

export default Navbar;