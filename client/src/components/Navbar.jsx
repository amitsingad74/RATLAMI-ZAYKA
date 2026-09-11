import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
    const { cartCount } = useCart();
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

        <span className="search-icon">
          🔍
        </span>
<Link to="/cart" className="cart-icon">
  🛒

  {cartCount > 0 && (
    <span className="cart-count">
      {cartCount}
    </span>
  )}
</Link>

        <Link to="/login">
          👤
        </Link>

      </div>

    </nav>
  );
}

export default Navbar;