import {
  useEffect,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";

import API_URL from "../config/api";


function Home() {

  const { addToCart } = useCart();


  // =========================================
  // STATE
  // =========================================

  const [categories, setCategories] =
    useState([]);

  const [popularProducts, setPopularProducts] =
    useState([]);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [categoryError, setCategoryError] =
    useState("");

  const [productError, setProductError] =
    useState("");

  const [addingProductId, setAddingProductId] =
    useState(null);


  // =========================================
  // POPULAR PRODUCTS CAROUSEL REF
  // =========================================

  const popularCarouselRef =
    useRef(null);


  // =========================================
  // FETCH HOMEPAGE DATA
  // =========================================

  useEffect(() => {

    // -----------------------------------------
    // FETCH CATEGORIES
    // -----------------------------------------

    const fetchCategories = async () => {

      try {

        setLoadingCategories(true);

        setCategoryError("");

        const response = await fetch(
          `${API_URL}/api/categories`
        );

        const data =
          await response.json();

        if (!response.ok) {

          throw new Error(
            data.message ||
              "Failed to load categories."
          );

        }

        setCategories(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.error(
          "Category fetch error:",
          error
        );

        setCategoryError(
          "Unable to load categories."
        );

      } finally {

        setLoadingCategories(false);

      }

    };


    // -----------------------------------------
    // FETCH POPULAR PRODUCTS
    // -----------------------------------------

    const fetchPopularProducts = async () => {

      try {

        setLoadingProducts(true);

        setProductError("");

        const response = await fetch(
          `${API_URL}/api/products`
        );

        const data =
          await response.json();

        if (!response.ok) {

          throw new Error(
            data.message ||
              "Failed to load products."
          );

        }

        const products =
          Array.isArray(data)
            ? data
            : [];


        // Only products selected from
        // Admin Panel → Show on Homepage

        const homepageProducts =
          products.filter(
            (product) =>
              product.showOnHomepage === true
          );


        setPopularProducts(
          homepageProducts
        );

      } catch (error) {

        console.error(
          "Product fetch error:",
          error
        );

        setProductError(
          "Unable to load popular products."
        );

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

      setAddingProductId(
        product._id
      );

      addToCart(product);

      setTimeout(() => {

        setAddingProductId(null);

      }, 700);

    } catch (error) {

      console.error(
        "Add to cart error:",
        error
      );

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


  // =========================================
  // POPULAR PRODUCTS CAROUSEL
  // =========================================

  const scrollPopularProducts = (
    direction
  ) => {

    const carousel =
      popularCarouselRef.current;

    if (!carousel) {

      return;

    }


    const amount =
      carousel.clientWidth * 0.9;


    carousel.scrollBy({

      left:
        direction === "next"
          ? amount
          : -amount,

      behavior: "smooth",

    });

  };


  // =========================================
  // UI
  // =========================================

  return (

    <>

      {/* =================================================
          HERO SECTION
      ================================================= */}

      <section
        className="hero"
        id="home"
      >

        {/* HERO VIDEO */}

        <div className="hero-video-wrapper">

          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >

            <source
              src="/videos/ratlami-hero.mp4"
              type="video/mp4"
            />

            Your browser does not support
            the video tag.

          </video>

        </div>


        {/* HERO OVERLAY */}

        <div className="hero-video-overlay"></div>


        {/* HERO CONTENT */}

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


          {/* DECORATIVE LINE */}

          <div className="hero-decoration">

            <span></span>

            ✦

            <span></span>

          </div>


          <p className="hero-description">

            Experience the authentic flavours
            of Ratlam.

            <br />

            Premium Ratlami Sev,
            delicious namkeen,

            <br />

            traditional sweets and much more.

          </p>


          {/* HERO BUTTONS */}

          <div className="hero-buttons">

            <Link
              to="/products"
              className="shop-btn"
            >

              SHOP NOW

              <span>
                →
              </span>

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

      </section>


      {/* =================================================
          CATEGORY SECTION
      ================================================= */}

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

            Discover authentic flavours
            made with tradition and love.

          </p>

        </div>


        {/* CATEGORY LOADING */}

        {loadingCategories && (

          <div className="category-grid">

            {[1, 2, 3, 4].map(
              (item) => (

                <div
                  className="category-card"
                  key={item}
                >

                  <div className="category-icon">

                    Loading...

                  </div>


                  <h3>

                    Loading...

                  </h3>


                  <p>

                    Please wait...

                  </p>

                </div>

              )
            )}

          </div>

        )}


        {/* CATEGORY ERROR */}

        {!loadingCategories &&
          categoryError && (

            <div className="home-section-message">

              {categoryError}

            </div>

          )}


        {/* NO CATEGORIES */}

        {!loadingCategories &&
          !categoryError &&
          categories.length === 0 && (

            <div className="home-section-message">

              No categories available
              right now.

            </div>

          )}


        {/* DYNAMIC CATEGORIES */}

        {!loadingCategories &&
          !categoryError &&
          categories.length > 0 && (

            <div className="category-grid">

              {categories.map(
                (category) => {

                  const categoryImage =
                    getCategoryImage(
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

                }
              )}

            </div>

          )}

      </section>


      {/* =================================================
          POPULAR PRODUCTS
      ================================================= */}

      <section
        className="products"
        id="products"
      >

        <div className="section-header">

          <p className="section-tag">

            BEST SELLERS

          </p>


          <h2>

            Popular Products

          </h2>


          <p>

            Discover the authentic taste
            of Ratlam with our most loved
            products.

          </p>


          <div className="section-decoration">

            <span></span>

            ✦

            <span></span>

          </div>

        </div>


        {/* =================================================
            PRODUCT LOADING
        ================================================= */}

        {loadingProducts && (

          <div className="product-grid">

            {[1, 2, 3, 4].map(
              (item) => (

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

                      Loading product
                      details...

                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        )}


        {/* =================================================
            PRODUCT ERROR
        ================================================= */}

        {!loadingProducts &&
          productError && (

            <div className="home-section-message">

              {productError}

            </div>

          )}


        {/* =================================================
            NO POPULAR PRODUCTS
        ================================================= */}

        {!loadingProducts &&
          !productError &&
          popularProducts.length === 0 && (

            <div className="home-section-message">

              No popular products
              selected yet.

              <br />

              Select products using

              <strong>
                {" "}
                Show on Homepage{" "}
              </strong>

              from the Admin Panel.

            </div>

          )}


        {/* =================================================
            POPULAR PRODUCTS CAROUSEL
        ================================================= */}

        {!loadingProducts &&
          !productError &&
          popularProducts.length > 0 && (

            <div className="rz-popular-carousel-wrapper">


              {/* LEFT ARROW */}

              <button
                type="button"
                className="
                  rz-popular-arrow
                  rz-popular-arrow-left
                "
                onClick={() =>
                  scrollPopularProducts(
                    "prev"
                  )
                }
                aria-label="Previous popular products"
              >

                ←

              </button>


              {/* CAROUSEL VIEWPORT */}

              <div
                className="rz-popular-carousel"
                ref={
                  popularCarouselRef
                }
              >

                {/* TRACK */}

                <div className="rz-popular-track">

                  {popularProducts.map(
                    (product) => (

                      <article
                        className="rz-popular-card"
                        key={product._id}
                      >

                        {/* PRODUCT IMAGE */}

                        <Link
                          to={`/products/${product._id}`}
                          className="rz-popular-image"
                        >

                          <img
                            src={getProductImage(
                              product.image
                            )}
                            alt={product.name}
                          />

                        </Link>


                        {/* PRODUCT INFORMATION */}

                        <div className="rz-popular-info">


                          {/* CATEGORY */}

                          <p className="rz-popular-category">

                            {product.category
                              ? product.category.toUpperCase()
                              : "RATLAMI SPECIAL"}

                          </p>


                          {/* NAME */}

                          <h3>

                            {product.name}

                          </h3>


                          {/* DESCRIPTION */}

                          <p className="rz-popular-description">

                            {product.description}

                          </p>


                          {/* PRICE + CART */}

                          <div className="rz-popular-bottom">


                            <span className="rz-popular-price">

                              ₹{product.price}

                            </span>


                            <button
                              type="button"
                              className="rz-popular-cart"
                              onClick={() =>
                                handleAddToCart(
                                  product
                                )
                              }
                              disabled={
                                product.stock <=
                                  0 ||
                                addingProductId ===
                                  product._id
                              }
                            >

                              {product.stock <=
                              0

                                ? "Out of Stock"

                                : addingProductId ===
                                  product._id

                                ? "Added ✓"

                                : "Add to Cart"}

                            </button>

                          </div>

                        </div>

                      </article>

                    )
                  )}

                </div>

              </div>


              {/* RIGHT ARROW */}

              <button
                type="button"
                className="
                  rz-popular-arrow
                  rz-popular-arrow-right
                "
                onClick={() =>
                  scrollPopularProducts(
                    "next"
                  )
                }
                aria-label="Next popular products"
              >

                →

              </button>

            </div>

          )}


        {/* =================================================
            VIEW ALL PRODUCTS
        ================================================= */}

        <Link
          to="/products"
          className="view-all-products"
        >

          View All Products →

        </Link>

      </section>


      {/* =================================================
          ABOUT / STORY SECTION
      ================================================= */}

      <section
        className="our-story"
        id="about"
      >

        <div className="our-story-content">


          {/* LEFT / STORY CONTENT */}

          <div className="our-story-text">

            <p className="story-tag">

              ABOUT RATLAMI ZAYEIKA

            </p>


            <h2>

              Bringing Ratlam's

              <br />

              Authentic Taste to
              Your Home

            </h2>


            <div className="story-divider">

              <span></span>

            </div>


            <p className="story-description">

              Ratlami Zayeika brings you
              the traditional taste of Ratlam
              with carefully prepared
              namkeen, snacks and sweets.

            </p>


            <p className="story-description">

              Our products are made with
              love, tradition and the finest
              ingredients.

            </p>


            <Link
              to="/about"
              className="story-button"
            >

              Know More

              <span>
                →
              </span>

            </Link>

          </div>

        </div>

      </section>


    </>

  );

}


export default Home;