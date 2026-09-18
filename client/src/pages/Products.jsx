import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

function Products() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } =
    useWishlist();

  const searchQuery = searchParams.get("search") || "";

  // ===============================
  // FETCH PRODUCTS FROM MONGODB
  // ===============================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/products"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);

        setError(
          "Unable to load products. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ===============================
  // CATEGORIES
  // ===============================

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  // ===============================
  // FILTER PRODUCTS
  // ===============================

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    const matchesSearch =
      product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      product.category
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // ===============================
  // WISHLIST TOGGLE
  // ===============================

  const handleWishlist = (product) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  // ===============================
  // ADD TO CART
  // ===============================

  const handleAddToCart = (product) => {
    const message = addToCart(product);

    if (message) {
      alert(message);
    }
  };

  // ===============================
  // LOADING
  // ===============================

  if (loading) {
    return (
      <div className="products-page">
        <div className="products-loading">
          <h2>Loading Products... 🌶️</h2>
        </div>
      </div>
    );
  }

  // ===============================
  // ERROR
  // ===============================

  if (error) {
    return (
      <div className="products-page">
        <div className="products-error">
          <h2>Something went wrong 😕</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      {/* ===============================
          PAGE HEADER
      =============================== */}

      <div className="products-header">
        <h1>Our Products 🌶️</h1>

        {searchQuery && (
          <p>
            Search results for: <strong>{searchQuery}</strong>
          </p>
        )}
      </div>

      {/* ===============================
          CATEGORY FILTER
      =============================== */}

      <div className="category-filter">
        {categories.map((category) => (
          <button
            key={category}
            className={
              selectedCategory === category
                ? "category-btn active"
                : "category-btn"
            }
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* ===============================
          PRODUCTS GRID
      =============================== */}

      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <h2>No products found 😕</h2>
          <p>Try another search or category.</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => {
            const stock = Number(product.stock ?? 0);

            return (
              <div className="product-card" key={product._id}>
                {/* PRODUCT IMAGE */}

                <Link
                  to={`/products/${product._id}`}
                  className="product-image-link"
                >
                  <div className="product-image">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-real-image"
                      />
                    ) : (
                      <span className="product-emoji">
                        {product.emoji}
                      </span>
                    )}
                  </div>
                </Link>

                {/* PRODUCT INFO */}

                <div className="product-info">
                  <span className="product-category">
                    {product.category}
                  </span>

                  <Link
                    to={`/products/${product._id}`}
                    className="product-name-link"
                  >
                    <h3>{product.name}</h3>
                  </Link>

                  <p className="product-description">
                    {product.description}
                  </p>

                  <div className="product-bottom">
                    <div>
                      <span className="product-price">
                        ₹{product.price}
                      </span>

                      <span className="product-weight">
                        / {product.weight}
                      </span>
                    </div>

                    {/* WISHLIST */}

                    <button
                      className="wishlist-btn"
                      onClick={() => handleWishlist(product)}
                    >
                      {isInWishlist(product._id) ? "❤️" : "♡"}
                    </button>
                  </div>

                  {/* ===============================
                      STOCK STATUS
                  =============================== */}

                  <div
                    className={
                      stock === 0
                        ? "product-stock out-of-stock"
                        : stock <= 10
                        ? "product-stock low-stock"
                        : "product-stock in-stock"
                    }
                  >
                    {stock === 0
                      ? "❌ Out of Stock"
                      : stock <= 10
                      ? `⚠️ Only ${stock} left`
                      : `📦 In Stock (${stock})`}
                  </div>

                  {/* ===============================
                      ADD TO CART
                  =============================== */}

                  <button
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product)}
                    disabled={stock === 0}
                  >
                    {stock === 0
                      ? "Out of Stock"
                      : "Add to Cart 🛒"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Products;