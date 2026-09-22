import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

import ratlamiSev from "../assets/ratlami-sev.png";
import heroBg from "../assets/hero.png";
import API_URL from "../config/api";

function Home() {
  const { addToCart } = useCart();

  const [categories, setCategories] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [categoryError, setCategoryError] = useState("");
  const [productError, setProductError] = useState("");

  const [addingProductId, setAddingProductId] = useState(null);

  // =========================================
  // FETCH HOMEPAGE DATA
  // =========================================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        setCategoryError("");

        const response = await fetch(
          `${API_URL}/api/categories`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load categories."
          );
        }

        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Category fetch error:", error);
        setCategoryError("Unable to load categories.");
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchPopularProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductError("");

        const response = await fetch(
          `${API_URL}/api/products`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load products."
          );
        }

        const products = Array.isArray(data) ? data : [];

        // Only products selected from Admin Panel
        const homepageProducts = products.filter(
          (product) =>
            product.showOnHomepage === true
        );

        setPopularProducts(homepageProducts);
      } catch (error) {
        console.error("Product fetch error:", error);
        setProductError("Unable to load popular products.");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchCategories();
    fetchPopularProducts();
  }, []);

  // =========================================
  // ADD PRODUCT TO CART
  // =========================================

  const handleAddToCart = (product) => {
    try {
      setAddingProductId(product._id);

      addToCart(product);

      setTimeout(() => {
        setAddingProductId(null);
      }, 700);
    } catch (error) {
      console.error("Add to cart error:", error);
      setAddingProductId(null);
    }
  };

  // =========================================
  // PRODUCT IMAGE
  // =========================================

  const getProductImage = (image) => {
    if (!image) {
      return "/images/ratlami-sev.png";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("/")
    ) {
      return image;
    }

    return `/${image}`;
  };

  // =========================================
  // CATEGORY IMAGE
  // =========================================

  const getCategoryImage = (image) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("/")
    ) {
      return image;
    }

    return `/${image}`;
  };

  return (
    <>
      {/* ================= HERO ================= */}

      <section
        className="hero"
        id="home"
        style={{
          backgroundImage: `
            linear-gradient(
              90deg,
              rgba(3, 22, 43, 0.98) 0%,
              rgba(3, 22, 43, 0.96) 42%,
              rgba(3, 22, 43, 0.45) 100%
            ),
            url(${heroBg})
          `,
        }}
      >
        {/* Background Overlay */}

        <div className="hero-overlay"></div>

        {/* LEFT SIDE */}

        <div className="hero-left">
          <p className="hero-tag">
            AUTHENTIC TASTE OF RATLAM
          </p>

          <h1>
            Taste the Tradition,
            <br />
            <span>
              Feel the Zayka!
            </span>
          </h1>

          {/* Decorative Line */}

          <div className="hero-decoration">
            <span></span>
            ✦
            <span></span>
          </div>

          <p className="hero-description">
            Experience the authentic flavours of Ratlam.
            <br />
            Premium Ratlami Sev, delicious namkeen,
            <br />
            traditional sweets and much more.
          </p>

          {/* BUTTONS */}

          <div className="hero-buttons">
            <Link
              to="/products"
              className="shop-btn"
            >
              SHOP NOW
              <span>→</span>
            </Link>

            <a
              href="#categories"
              className="explore-btn"
            >
              EXPLORE PRODUCTS
            </a>
          </div>

          <p className="hero-love">
            From Ratlam
            <br />
            With Love ♡
          </p>
        </div>

        {/* RIGHT SIDE */}

        <div className="hero-right">
          {/* Ratlami Sev Image */}

          <img
            src={ratlamiSev}
            alt="Authentic Ratlami Sev"
            className="hero-sev-image"
          />

          {/* Original Tag */}

          <div className="original-tag">
            <span>
              Original
            </span>

            <strong>
              Ratlami Sev
            </strong>

            <small>
              Same Real Taste
            </small>
          </div>

          {/* Spicy Badge */}

          <div className="spicy-badge">
            <p>SPICY</p>
            <p>CRUNCHY</p>
            <p>AUTHENTIC</p>
            <span>⌣</span>
          </div>
        </div>
      </section>

      {/* ================= CATEGORY SECTION ================= */}

      <section
        className="categories"
        id="categories"
      >
        <div className="section-header">
          <p className="section-tag">
            EXPLORE OUR FLAVOURS
          </p>

          <h2>
            Shop By Category
          </h2>

          <p>
            Discover authentic flavours made with tradition and love.
          </p>
        </div>

        {/* CATEGORY LOADING */}

        {loadingCategories && (
          <div className="category-grid">
            {[1, 2, 3, 4].map((item) => (
              <div
                className="category-card"
                key={item}
              >
                <div className="category-icon">
                  🍬
                </div>

                <h3>
                  Loading...
                </h3>

                <p>
                  Please wait...
                </p>
              </div>
            ))}
          </div>
        )}

        {/* CATEGORY ERROR */}

        {!loadingCategories && categoryError && (
          <div className="home-section-message">
            {categoryError}
          </div>
        )}

        {/* NO CATEGORIES */}

        {!loadingCategories &&
          !categoryError &&
          categories.length === 0 && (
            <div className="home-section-message">
              No categories available right now.
            </div>
          )}

        {/* DYNAMIC CATEGORIES */}

        {!loadingCategories &&
          !categoryError &&
          categories.length > 0 && (
            <div className="category-grid">
              {categories.map((category) => {
                const categoryImage = getCategoryImage(
                  category.image
                );

                return (
                  <div
                    className="category-card"
                    key={category._id}
                  >
                    <div className="category-icon">
                      {categoryImage ? (
                        <img
                          src={categoryImage}
                          alt={category.name}
                          className="homepage-category-image"
                        />
                      ) : (
                        "🍬"
                      )}
                    </div>

                    <h3>
                      {category.name}
                    </h3>

                    <p>
                      {category.description ||
                        "Discover delicious flavours from Ratlam."}
                    </p>

                    <Link
                      to={`/products?category=${encodeURIComponent(
                        category.name
                      )}`}
                    >
                      Explore →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
      </section>

      {/* ================= POPULAR PRODUCTS ================= */}

      <section className="products">
        <div className="section-header">
          <p className="section-tag">
            BEST SELLERS
          </p>

          <h2>
            Popular Products
          </h2>

          <p>
            Discover the authentic taste of Ratlam with our most loved products.
          </p>

          <div className="section-decoration">
            <span></span>
            ✦
            <span></span>
          </div>
        </div>

        {/* PRODUCT LOADING */}

        {loadingProducts && (
          <div className="product-grid">
            {[1, 2, 3, 4].map((item) => (
              <div
                className="product-card"
                key={item}
              >
                <div className="product-image">
                  <span>
                    Loading...
                  </span>
                </div>

                <div className="product-info">
                  <p className="product-category">
                    PLEASE WAIT
                  </p>

                  <h3>
                    Loading Product
                  </h3>

                  <p className="product-description">
                    Loading product details...
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PRODUCT ERROR */}

        {!loadingProducts && productError && (
          <div className="home-section-message">
            {productError}
          </div>
        )}

        {/* NO POPULAR PRODUCTS */}

        {!loadingProducts &&
          !productError &&
          popularProducts.length === 0 && (
            <div className="home-section-message">
              No popular products selected yet.
              <br />
              Select products using
              <strong> Show on Homepage </strong>
              from the Admin Panel.
            </div>
          )}

        {/* DYNAMIC POPULAR PRODUCTS */}

        {!loadingProducts &&
          !productError &&
          popularProducts.length > 0 && (
            <div className="product-grid">
              {popularProducts.map((product) => (
                <div
                  className="product-card"
                  key={product._id}
                >
                  <Link
                    to={`/products/${product._id}`}
                    className="product-image"
                  >
                    <img
                      src={getProductImage(product.image)}
                      alt={product.name}
                    />
                  </Link>

                  <div className="product-info">
                    <p className="product-category">
                      {product.category
                        ? product.category.toUpperCase()
                        : "RATLAMI SPECIAL"}
                    </p>

                    <h3>
                      {product.name}
                    </h3>

                    <p className="product-description">
                      {product.description}
                    </p>

                    <div className="product-bottom">
                      <span className="price">
                        ₹{product.price}
                      </span>

                      <button
                        type="button"
                        className="add-cart-btn"
                        onClick={() =>
                          handleAddToCart(product)
                        }
                        disabled={
                          product.stock <= 0 ||
                          addingProductId === product._id
                        }
                      >
                        {product.stock <= 0
                          ? "Out of Stock"
                          : addingProductId === product._id
                          ? "Added ✓"
                          : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        <Link
          to="/products"
          className="view-all-products"
        >
          View All Products →
        </Link>
      </section>

      {/* ================= OUR STORY SECTION ================= */}

      <section className="our-story">
        <div className="our-story-content">
          {/* LEFT SIDE */}

          <div className="our-story-text">
            <p className="story-tag">
              ABOUT RATLAMI ZAYEIKA
            </p>

            <h2>
              Bringing Ratlam's <br />
              Authentic Taste to Your Home
            </h2>

            <div className="story-divider">
              <span></span>
            </div>

            <p className="story-description">
              Ratlami Zayeika brings you the traditional taste of Ratlam
              with carefully prepared namkeen, snacks and sweets.
            </p>

            <p className="story-description">
              Our products are made with love, tradition and the finest
              ingredients.
            </p>

            <button
              type="button"
              className="story-button"
            >
              Know More <span>→</span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;