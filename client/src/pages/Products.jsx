import { useState, useEffect } from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

import API_URL from "../config/api";


function Products() {

  const [products, setProducts] =
    useState([]);

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [stockFilter, setStockFilter] =
    useState("All");

  const [sortOption, setSortOption] =
    useState("Default");

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const { addToCart } =
    useCart();

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist();


  /* =====================================================
     URL SEARCH
     ===================================================== */
const searchQuery =
  searchParams
    .get("search")
    ?.trim()
    .toLowerCase() || "";

const categoryQuery =
  searchParams
    .get("category")
    ?.trim() || "";


/* Scroll to top when search/category changes */
useEffect(() => {

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "instant"
  });

}, [searchQuery, categoryQuery]);

  /* =====================================================
     FETCH PRODUCTS FROM MONGODB
     ===================================================== */

  useEffect(() => {

    const fetchProducts = async () => {

      try {

        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/products`
        );

        if (!response.ok) {

          throw new Error(
            "Failed to fetch products"
          );

        }

        const data =
          await response.json();

        setProducts(data);

      } catch (error) {

        console.error(
          "Error fetching products:",
          error
        );

        setError(
          "Unable to load products. Please make sure the backend is running."
        );

      } finally {

        setLoading(false);

      }

    };

    fetchProducts();

  }, []);


  /* =====================================================
     CATEGORIES
     ===================================================== */

  const categories = [
    "All",

    ...new Set(

      products
        .map((product) =>
          String(
            product.category || ""
          ).trim()
        )
        .filter(Boolean)

    ),
  ];


  /* =====================================================
     NORMALIZE TEXT
     ===================================================== */

  const normalizeText = (value) => {

    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ");

  };


  /* =====================================================
     CATEGORY MATCHING
     ===================================================== */

  const matchesHomeCategory = (
    productName,
    productCategory,
    requestedCategory
  ) => {

    const requested =
      normalizeText(requestedCategory);

    const name =
      normalizeText(productName);

    const category =
      normalizeText(productCategory);


    if (!requested) {
      return true;
    }


    /* --------------------------------
       RATLAMI SEV
       -------------------------------- */

    if (
      requested.includes("ratlami sev") ||
      requested === "sev"
    ) {

      return (
        name.includes("sev") ||
        category.includes("sev") ||
        category.includes("ratlami")
      );

    }


    /* --------------------------------
       MIXTURE
       -------------------------------- */

    if (
      requested.includes("mixture")
    ) {

      return (
        name.includes("mixture") ||
        category.includes("mixture")
      );

    }


    /* --------------------------------
       NAMKEEN
       -------------------------------- */

    if (
      requested.includes("namkeen")
    ) {

      return (
        category.includes("namkeen") ||
        name.includes("namkeen") ||
        name.includes("mixture") ||
        name.includes("sev")
      );

    }


    /* --------------------------------
       TRADITIONAL SWEETS
       -------------------------------- */

    if (
      requested.includes("sweet") ||
      requested.includes("mithai")
    ) {

      return (
        name.includes("sweet") ||
        name.includes("mithai") ||
        name.includes("ladoo") ||
        name.includes("laddu") ||
        name.includes("barfi") ||
        name.includes("burfi") ||
        name.includes("katli") ||
        name.includes("peda") ||
        category.includes("sweet") ||
        category.includes("mithai")
      );

    }


    /* --------------------------------
       GIFT HAMPERS
       -------------------------------- */

    if (
      requested.includes("gift") ||
      requested.includes("hamper")
    ) {

      return (
        name.includes("gift") ||
        name.includes("hamper") ||
        category.includes("gift") ||
        category.includes("hamper")
      );

    }


    /* --------------------------------
       GENERAL CATEGORY
       -------------------------------- */

    return (
      category === requested ||
      category.includes(requested) ||
      name.includes(requested)
    );

  };


  /* =====================================================
     FILTER + SORT PRODUCTS
     ===================================================== */

  const filteredProducts =

    products

      .filter((product) => {

        /* --------------------------------
           PRODUCT TEXT
           -------------------------------- */

        const productName =
          String(
            product.name || ""
          )
            .trim()
            .toLowerCase();


        const productCategory =
          String(
            product.category || ""
          )
            .trim()
            .toLowerCase();


        const productDescription =
          String(
            product.description || ""
          )
            .trim()
            .toLowerCase();


        /* =================================
           SEARCH
           ================================= */

        const matchesSearch =

          !searchQuery ||

          productName.includes(
            searchQuery
          ) ||

          productCategory.includes(
            searchQuery
          ) ||

          productDescription.includes(
            searchQuery
          );


        /* =================================
           CATEGORY
           ================================= */

        let matchesCategory = true;


        /*
          If Home → Shop By Category
          was used, categoryQuery becomes
          the main category filter.
        */

        if (categoryQuery) {

          matchesCategory =
            matchesHomeCategory(
              productName,
              productCategory,
              categoryQuery
            );

        } else {

          matchesCategory =
            selectedCategory === "All" ||
            productCategory ===
              selectedCategory
                .trim()
                .toLowerCase();

        }


        /* =================================
           STOCK
           ================================= */

        const stock =
          Number(
            product.stock ?? 0
          );


        const matchesStock =

          stockFilter === "All" ||

          (
            stockFilter === "In Stock" &&
            stock > 10
          ) ||

          (
            stockFilter === "Low Stock" &&
            stock > 0 &&
            stock <= 10
          ) ||

          (
            stockFilter === "Out of Stock" &&
            stock === 0
          );


        return (
          matchesSearch &&
          matchesCategory &&
          matchesStock
        );

      })


      /* =================================
         SORT
         ================================= */

      .sort((a, b) => {

        /* --------------------------------
           PRICE LOW → HIGH
           -------------------------------- */

        if (
          sortOption ===
          "Price: Low to High"
        ) {

          return (
            Number(a.price || 0) -
            Number(b.price || 0)
          );

        }


        /* --------------------------------
           PRICE HIGH → LOW
           -------------------------------- */

        if (
          sortOption ===
          "Price: High to Low"
        ) {

          return (
            Number(b.price || 0) -
            Number(a.price || 0)
          );

        }


        /* --------------------------------
           NAME A → Z
           -------------------------------- */

        if (
          sortOption ===
          "Name: A to Z"
        ) {

          return String(
            a.name || ""
          ).localeCompare(
            String(b.name || "")
          );

        }


        /* --------------------------------
           NAME Z → A
           -------------------------------- */

        if (
          sortOption ===
          "Name: Z to A"
        ) {

          return String(
            b.name || ""
          ).localeCompare(
            String(a.name || "")
          );

        }


        return 0;

      });


  /* =====================================================
     ACTIVE FILTERS
     ===================================================== */

  const hasActiveFilters =

    selectedCategory !== "All" ||
    stockFilter !== "All" ||
    sortOption !== "Default" ||
    Boolean(categoryQuery) ||
    Boolean(searchQuery);


  /* =====================================================
     CLEAR FILTERS
     ===================================================== */

  const clearFilters = () => {

    setSelectedCategory("All");

    setStockFilter("All");

    setSortOption("Default");

    setSearchParams({});

  };


  /* =====================================================
     WISHLIST
     ===================================================== */

  const handleWishlist = (
    product
  ) => {

    if (
      isInWishlist(product._id)
    ) {

      removeFromWishlist(
        product._id
      );

    } else {

      addToWishlist(product);

    }

  };


  /* =====================================================
     ADD TO CART
     ===================================================== */

  const handleAddToCart = (
    product
  ) => {

    const message =
      addToCart(product);

    if (message) {

      alert(message);

    }

  };


  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {

    return (

      <div className="products-page">

        <div className="products-loading">

          <h2>
            Loading Products...
          </h2>

        </div>

      </div>

    );

  }


  /* =====================================================
     ERROR
     ===================================================== */

  if (error) {

    return (

      <div className="products-page">

        <div className="products-error">

          <h2>
            Something went wrong 😕
          </h2>

          <p>
            {error}
          </p>

        </div>

      </div>

    );

  }


  /* =====================================================
     PAGE
     ===================================================== */

  return (

    <div className="products-page">


      {/* ===============================================
          PAGE HEADER
          =============================================== */}

      <div className="products-header">

        <h1>
          Our Products
        </h1>


        {/* CATEGORY RESULT */}

        {categoryQuery && (

          <p>

            Showing products from:{" "}

            <strong>
              {categoryQuery}
            </strong>

          </p>

        )}


        {/* SEARCH RESULT */}

        {!categoryQuery &&
          searchQuery && (

            <p>

              Search results for:{" "}

              <strong>
                "{searchQuery}"
              </strong>

            </p>

          )}


        {/* DEFAULT DESCRIPTION */}

        {!categoryQuery &&
          !searchQuery && (

            <p>
              Discover our delicious range of
              RATLAMI Zayka products.
            </p>

          )}

      </div>


      {/* ===============================================
          FILTER CONTROLS
          =============================================== */}

      <div className="products-filter-section">


        {/* CATEGORY */}

        <div className="category-filter">

          {categories.map(
            (category) => (

              <button
                key={category}

                className={
                  selectedCategory ===
                  category
                    ? "category-btn active"
                    : "category-btn"
                }

                onClick={() => {

                  setSelectedCategory(
                    category
                  );


                  /*
                    Remove Home category URL
                    when manually selecting
                    a Products-page category.
                  */

                  const newParams =
                    new URLSearchParams(
                      searchParams
                    );


                  newParams.delete(
                    "category"
                  );


                  setSearchParams(
                    newParams
                  );

                }}
              >

                {category}

              </button>

            )
          )}

        </div>


        {/* OTHER FILTERS */}

        <div className="products-sort-filter">


          {/* STOCK */}

          <select
            value={stockFilter}

            onChange={(e) =>
              setStockFilter(
                e.target.value
              )
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
              setSortOption(
                e.target.value
              )
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
              onClick={
                clearFilters
              }
            >

              Clear Filters

            </button>

          )}

        </div>

      </div>


      {/* ===============================================
          PRODUCT COUNT
          =============================================== */}

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


      {/* ===============================================
          PRODUCTS
          =============================================== */}

      {filteredProducts.length === 0 ? (

        <div className="no-products">


          <div className="no-products-icon">
            🔍
          </div>


          <h2>
            No products found 😕
          </h2>


          <p>
            Try another search or change
            your filters.
          </p>


          {hasActiveFilters && (

            <button
              type="button"
              className="clear-product-filters"
              onClick={
                clearFilters
              }
            >

              Clear Filters

            </button>

          )}

        </div>

      ) : (

        <div className="products-grid">

          {filteredProducts.map(
            (product) => {

              const stock =
                Number(
                  product.stock ?? 0
                );


              return (

                <div
                  className="product-card"
                  key={product._id}
                >


                  {/* =================================
                      PRODUCT IMAGE
                      ================================= */}

                  <Link
                    to={`/products/${product._id}`}
                    className="product-image-link"

                    style={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      overflow: "hidden",
                    }}
                  >

                    <div
                      className="product-image"

                      style={{
                        width: "100%",
                        height: "255px",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >

                      {product.image && (

                        <img
                          src={
                            product.image
                          }

                          alt={
                            product.name
                          }

                          className="product-real-image"

                          style={{
                            width: "100%",
                            height: "100%",
                            minWidth: "100%",
                            minHeight: "100%",
                            maxWidth: "none",
                            maxHeight: "none",
                            objectFit: "cover",
                            objectPosition: "center",
                            display: "block",
                            margin: 0,
                            padding: 0,
                          }}
                        />

                      )}

                    </div>

                  </Link>


                  {/* =================================
                      PRODUCT INFO
                      ================================= */}

                  <div className="product-info">


                    <span className="product-category">
                      {product.category}
                    </span>


                    <Link
                      to={`/products/${product._id}`}
                      className="product-name-link"
                    >

                      <h3>
                        {product.name}
                      </h3>

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
                        type="button"
                        className="wishlist-btn"

                        onClick={() =>
                          handleWishlist(
                            product
                          )
                        }
                      >

                        {isInWishlist(
                          product._id
                        )
                          ? "❤️"
                          : "♡"}

                      </button>

                    </div>


                    {/* =================================
                        STOCK STATUS
                        ================================= */}

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
                        : `In Stock (${stock})`}

                    </div>


                    {/* =================================
                        ADD TO CART
                        ================================= */}

                    <button
                      type="button"
                      className="add-to-cart-btn"

                      onClick={() =>
                        handleAddToCart(
                          product
                        )
                      }

                      disabled={
                        stock === 0
                      }
                    >

                      {stock === 0
                        ? "Out of Stock"
                        : "Add to Cart 🛒"}

                    </button>

                  </div>

                </div>

              );

            }
          )}

        </div>

      )}

    </div>

  );

}


export default Products;