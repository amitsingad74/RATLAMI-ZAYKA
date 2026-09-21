import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import API_URL from "../config/api";

function Products() {
  const [products, setProducts] = useState([]);

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [stockFilter, setStockFilter] =
    useState("All");

  const [sortOption, setSortOption] =
    useState("Default");

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
          `${API_URL}/api/products`
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
    ...new Set(
      products
        .map((product) =>
          String(product.category || "").trim()
        )
        .filter(Boolean)
    ),
  ];

  // ===============================
  // FILTER + SORT PRODUCTS
  // ===============================

  const filteredProducts = products
    .filter((product) => {
      const productName = String(
        product.name || ""
      ).toLowerCase();

      const productCategory = String(
        product.category || ""
      )
        .trim()
        .toLowerCase();

      const productDescription = String(
        product.description || ""
      ).toLowerCase();

      const search = searchQuery
        .trim()
        .toLowerCase();

      // SEARCH
      const matchesSearch =
        !search ||
        productName.includes(search) ||
        productCategory.includes(search) ||
        productDescription.includes(search);

      // CATEGORY
      const matchesCategory =
        selectedCategory === "All" ||
        productCategory ===
          selectedCategory.trim().toLowerCase();

      // STOCK
      const stock = Number(product.stock ?? 0);

      const matchesStock =
        stockFilter === "All" ||
        (stockFilter === "In Stock" && stock > 10) ||
        (stockFilter === "Low Stock" &&
          stock > 0 &&
          stock <= 10) ||
        (stockFilter === "Out of Stock" &&
          stock === 0);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStock
      );
    })
    .sort((a, b) => {
      // PRICE LOW → HIGH
      if (sortOption === "Price: Low to High") {
        return (
          Number(a.price || 0) -
          Number(b.price || 0)
        );
      }

      // PRICE HIGH → LOW
      if (sortOption === "Price: High to Low") {
        return (
          Number(b.price || 0) -
          Number(a.price || 0)
        );
      }

      // NAME A → Z
      if (sortOption === "Name: A to Z") {
        return String(a.name || "").localeCompare(
          String(b.name || "")
        );
      }

      // NAME Z → A
      if (sortOption === "Name: Z to A") {
        return String(b.name || "").localeCompare(
          String(a.name || "")
        );
      }

      return 0;
    });

  // ===============================
  // CLEAR FILTERS
  // ===============================

  const hasActiveFilters =
    selectedCategory !== "All" ||
    stockFilter !== "All" ||
    sortOption !== "Default";

  const clearFilters = () => {
    setSelectedCategory("All");
    setStockFilter("All");
    setSortOption("Default");
  };

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
            Search results for:{" "}
            <strong>{searchQuery}</strong>
          </p>
        )}

        {!searchQuery && (
          <p>
            Discover our delicious range of
            RATLAMI Zayka products.
          </p>
        )}
      </div>

      {/* ===============================
          FILTER CONTROLS
      =============================== */}

      <div className="products-filter-section">
        {/* CATEGORY */}

        <div className="category-filter">
          {categories.map((category) => (
            <button
              key={category}
              className={
                selectedCategory === category
                  ? "category-btn active"
                  : "category-btn"
              }
              onClick={() =>
                setSelectedCategory(category)
              }
            >
              {category}
            </button>
          ))}
        </div>

        {/* OTHER FILTERS */}

        <div className="products-sort-filter">
          {/* STOCK */}

          <select
            value={stockFilter}
            onChange={(e) =>
              setStockFilter(e.target.value)
            }
            className="product-filter-select"
          >
            <option value="All">
              All Stock
            </option>

            <option value="In Stock">
              In Stock
            </option>

            <option value="Low Stock">
              Low Stock
            </option>

            <option value="Out of Stock">
              Out of Stock
            </option>
          </select>

          {/* SORT */}

          <select
            value={sortOption}
            onChange={(e) =>
              setSortOption(e.target.value)
            }
            className="product-filter-select"
          >
            <option value="Default">
              Sort: Default
            </option>

            <option value="Price: Low to High">
              Price: Low to High
            </option>

            <option value="Price: High to Low">
              Price: High to Low
            </option>

            <option value="Name: A to Z">
              Name: A to Z
            </option>

            <option value="Name: Z to A">
              Name: Z to A
            </option>
          </select>

          {/* CLEAR */}

          {hasActiveFilters && (
            <button
              type="button"
              className="clear-product-filters"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ===============================
          PRODUCT COUNT
      =============================== */}

      <div className="products-result-info">
        <span>
          Showing{" "}
          <strong>
            {filteredProducts.length}
          </strong>{" "}
          of{" "}
          <strong>
            {products.length}
          </strong>{" "}
          products
        </span>
      </div>

      {/* ===============================
          PRODUCTS GRID
      =============================== */}

      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <div className="no-products-icon">
            🔍
          </div>

          <h2>No products found 😕</h2>

          <p>
            Try another search or change your
            filters.
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              className="clear-product-filters"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => {
            const stock = Number(
              product.stock ?? 0
            );

            return (
              <div
                className="product-card"
                key={product._id}
              >
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
                      onClick={() =>
                        handleWishlist(product)
                      }
                    >
                      {isInWishlist(product._id)
                        ? "❤️"
                        : "♡"}
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
                    onClick={() =>
                      handleAddToCart(product)
                    }
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