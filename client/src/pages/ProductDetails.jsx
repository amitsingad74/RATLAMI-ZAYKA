import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import API_URL from "../config/api";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);

  const { addToCart } = useCart();

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist();

  // =====================================================
  // FETCH PRODUCT
  // =====================================================

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/products/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Product not found."
          );
        }

        setProduct(data);
      } catch (error) {
        console.error(
          "Error fetching product:",
          error
        );

        setError(
          error.message ||
            "Unable to load product. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="products-loading">
          <div className="product-details-loading-icon">
            🌶️
          </div>

          <h2>
            Loading Product...
          </h2>

          <p>
            Please wait while we fetch the product details.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !product) {
    return (
      <div className="product-details-page">
        <div className="products-error">
          <div className="product-details-error-icon">
            😕
          </div>

          <h2>
            Product Not Found
          </h2>

          <p>
            {error ||
              "The product you are looking for does not exist."}
          </p>

          <Link
            to="/products"
            className="back-products"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // =====================================================
  // STOCK
  // =====================================================

  const stock = Number(product.stock ?? 0);

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 10;

  // =====================================================
  // WISHLIST
  // =====================================================

  const wishlistActive = isInWishlist(product._id);

  const handleWishlist = () => {
    if (wishlistActive) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = () => {
    if (isOutOfStock || addingToCart) {
      return;
    }

    setAddingToCart(true);

    const message = addToCart(product);

    if (message) {
      alert(message);
    }

    setTimeout(() => {
      setAddingToCart(false);
    }, 500);
  };

  return (
    <div className="product-details-page">

      {/* =================================================
          BACK TO PRODUCTS
      ================================================= */}

      <div className="product-details-top">
        <Link
          to="/products"
          className="back-products"
        >
          ← Back to Products
        </Link>
      </div>

      {/* =================================================
          PRODUCT DETAILS CONTAINER
      ================================================= */}

      <div className="product-details-container">

        {/* =================================================
            PRODUCT IMAGE
        ================================================= */}

        <div className="product-details-image">

          <div className="product-details-image-wrapper">

            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="product-details-img"
              />
            ) : (
              <span className="product-details-emoji">
                {product.emoji || "🍬"}
              </span>
            )}

          </div>

          {/* STOCK BADGE */}

          <div
            className={
              isOutOfStock
                ? "product-details-image-stock out-of-stock"
                : isLowStock
                ? "product-details-image-stock low-stock"
                : "product-details-image-stock in-stock"
            }
          >
            {isOutOfStock
              ? "Out of Stock"
              : isLowStock
              ? `Only ${stock} Left`
              : "In Stock"}
          </div>

        </div>

        {/* =================================================
            PRODUCT INFORMATION
        ================================================= */}

        <div className="product-details-info">

          {/* CATEGORY */}

          <span className="product-details-category">
            {product.category}
          </span>

          {/* PRODUCT NAME */}

          <h1>
            {product.name}
          </h1>

          {/* RATING / TRUST */}

          <div className="product-details-trust">
            <span>
              ⭐ Authentic Ratlami Taste
            </span>

            <span>
              •
            </span>

            <span>
              Fresh & Quality
            </span>
          </div>

          {/* PRICE */}

          <div className="product-details-price">
            ₹{product.price}
          </div>

          {/* WEIGHT */}

          <div className="product-details-weight">
            <strong>
              Weight:
            </strong>{" "}
            {product.weight}
          </div>

          {/* DESCRIPTION */}

          <div className="product-details-description-box">

            <h3>
              Product Description
            </h3>

            <p className="product-details-description">
              {product.description}
            </p>

          </div>

          {/* =================================================
              STOCK STATUS
          ================================================= */}

          <div
            className={
              isOutOfStock
                ? "product-details-stock out-of-stock"
                : isLowStock
                ? "product-details-stock low-stock"
                : "product-details-stock in-stock"
            }
          >
            {isOutOfStock
              ? "❌ Currently Out of Stock"
              : isLowStock
              ? `⚠️ Hurry! Only ${stock} left in stock`
              : `📦 ${stock} units available`}
          </div>

          {/* =================================================
              ACTION BUTTONS
          ================================================= */}

          <div className="product-details-buttons">

            {/* ADD TO CART */}

            <button
              type="button"
              className="product-details-cart-btn"
              onClick={handleAddToCart}
              disabled={
                isOutOfStock ||
                addingToCart
              }
            >
              {isOutOfStock
                ? "Out of Stock"
                : addingToCart
                ? "Adding..."
                : "Add to Cart 🛒"}
            </button>

            {/* WISHLIST */}

            <button
              type="button"
              className={
                wishlistActive
                  ? "product-details-wishlist-btn active"
                  : "product-details-wishlist-btn"
              }
              onClick={handleWishlist}
              aria-label={
                wishlistActive
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
            >
              {wishlistActive
                ? "❤️ Remove from Wishlist"
                : "♡ Add to Wishlist"}
            </button>

          </div>

          {/* =================================================
              PRODUCT BENEFITS
          ================================================= */}

          <div className="product-details-benefits">

            <div className="product-benefit">
              <span className="product-benefit-icon">
                🚚
              </span>

              <div>
                <strong>
                  Fast Delivery
                </strong>

                <p>
                  Delivered safely to your doorstep.
                </p>
              </div>
            </div>

            <div className="product-benefit">
              <span className="product-benefit-icon">
                🌶️
              </span>

              <div>
                <strong>
                  Authentic Taste
                </strong>

                <p>
                  Traditional Ratlami flavour.
                </p>
              </div>
            </div>

            <div className="product-benefit">
              <span className="product-benefit-icon">
                🛡️
              </span>

              <div>
                <strong>
                  Quality Product
                </strong>

                <p>
                  Carefully selected and packed.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          BOTTOM BACK LINK
      ================================================= */}

      <div className="product-details-bottom-link">

        <Link
          to="/products"
          className="back-products"
        >
          ← Continue Shopping
        </Link>

      </div>

    </div>
  );
}

export default ProductDetails;