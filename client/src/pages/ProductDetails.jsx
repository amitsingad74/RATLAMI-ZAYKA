import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } =
    useWishlist();

  // ===============================
  // FETCH PRODUCT FROM MONGODB
  // ===============================

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/products/${id}`
        );

        if (!response.ok) {
          throw new Error("Product not found");
        }

        const data = await response.json();

        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);

        setError("Unable to load product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ===============================
  // LOADING
  // ===============================

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="products-loading">
          <h2>Loading Product... 🌶️</h2>
        </div>
      </div>
    );
  }

  // ===============================
  // ERROR
  // ===============================

  if (error || !product) {
    return (
      <div className="product-details-page">
        <div className="products-error">
          <h2>Product Not Found 😕</h2>

          <p>{error}</p>

          <Link to="/products" className="back-products">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // ===============================
  // WISHLIST
  // ===============================

  const handleWishlist = () => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="product-details-page">

      {/* ===============================
          BACK BUTTON
      =============================== */}

      <Link to="/products" className="back-products">
        ← Back to Products
      </Link>


      {/* ===============================
          PRODUCT DETAILS
      =============================== */}

      <div className="product-details-container">

        {/* PRODUCT IMAGE */}

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
                {product.emoji}
              </span>
            )}

          </div>

        </div>


        {/* PRODUCT INFORMATION */}

        <div className="product-details-info">

          <span className="product-details-category">
            {product.category}
          </span>

          <h1>{product.name}</h1>

          <div className="product-details-price">
            ₹{product.price}
          </div>

          <div className="product-details-weight">
            Weight: {product.weight}
          </div>

          <p className="product-details-description">
            {product.description}
          </p>


          {/* BUTTONS */}

          <div className="product-details-buttons">

            <button
              className="product-details-cart-btn"
              onClick={() => addToCart(product)}
            >
              Add to Cart 🛒
            </button>

            <button
              className="product-details-wishlist-btn"
              onClick={handleWishlist}
            >
              {isInWishlist(product._id)
                ? "❤️ Remove from Wishlist"
                : "♡ Add to Wishlist"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ProductDetails;