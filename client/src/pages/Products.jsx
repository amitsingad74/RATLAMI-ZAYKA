import { useState, useEffect } from "react";

import {
  useSearchParams
} from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";


const products = [

  {
    id: 1,
    name: "Classic Ratlami Sev",
    category: "Ratlami Sev",
    price: 120,
    weight: "250g",
    emoji: "🌶️",
    description:
      "Authentic spicy Ratlami Sev with traditional flavours.",
  },

  {
    id: 2,
    name: "Masala Mixture",
    category: "Namkeen",
    price: 150,
    weight: "250g",
    emoji: "🥨",
    description:
      "Crunchy mixture packed with delicious Indian spices.",
  },

  {
    id: 3,
    name: "Spicy Peanut Mix",
    category: "Namkeen",
    price: 180,
    weight: "250g",
    emoji: "🥜",
    description:
      "Roasted peanuts with a perfect blend of spices.",
  },

  {
    id: 4,
    name: "Traditional Mithai",
    category: "Sweets",
    price: 250,
    weight: "500g",
    emoji: "🍬",
    description:
      "Delicious traditional sweets made with love.",
  },

  {
    id: 5,
    name: "Garlic Sev",
    category: "Ratlami Sev",
    price: 140,
    weight: "250g",
    emoji: "🧄",
    description:
      "Crispy sev with a delicious garlic flavour.",
  },

  {
    id: 6,
    name: "Khatta Meetha Mix",
    category: "Namkeen",
    price: 160,
    weight: "250g",
    emoji: "🥨",
    description:
      "A perfect balance of sweet, spicy and tangy flavours.",
  },

  {
    id: 7,
    name: "Dry Fruit Sweet Box",
    category: "Sweets",
    price: 450,
    weight: "500g",
    emoji: "🎁",
    description:
      "Premium traditional sweets with delicious dry fruits.",
  },

  {
    id: 8,
    name: "Special Gift Hamper",
    category: "Gift Hampers",
    price: 799,
    weight: "1kg",
    emoji: "🎁",
    description:
      "A special collection of authentic Ratlami products.",
  },

];


function Products() {


  // ================= URL SEARCH PARAMS =================

  const [searchParams] = useSearchParams();


  // Get search text from Navbar
  const urlSearch =
    searchParams.get("search") || "";


  // ================= STATE =================

  const [search, setSearch] =
    useState(urlSearch);


  const [selectedCategory, setSelectedCategory] =
    useState("All");


  const { addToCart } = useCart();

  const {
  toggleWishlist,
  isInWishlist
} = useWishlist();


  // Update search when URL changes

  useEffect(() => {

    setSearch(urlSearch);

  }, [urlSearch]);


  // ================= CATEGORIES =================

  const categories = [

    "All",
    "Ratlami Sev",
    "Namkeen",
    "Sweets",
    "Gift Hampers",

  ];


  // ================= FILTER PRODUCTS =================

  const filteredProducts = products.filter(
    (product) => {


      // Search by name
      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );


      // Category filter

      const matchesCategory =

        selectedCategory === "All" ||

        product.category === selectedCategory;


      return (

        matchesSearch &&

        matchesCategory

      );

    }
  );


  return (

    <div className="products-page">


      {/* ================= HERO ================= */}

      <section className="products-hero">


        <p className="section-tag">

          AUTHENTIC TASTE OF RATLAM

        </p>


        <h1>

          Explore Our <span>Products</span>

        </h1>


        <div className="gold-divider">

          ✦

        </div>


        <p>

          Discover the authentic taste of Ratlam with our
          delicious range of sev, namkeen, sweets and more.

        </p>


      </section>


      {/* ================= SEARCH AND FILTER ================= */}

      <section className="products-controls">


        {/* PRODUCT SEARCH */}

        <div className="search-box">


          <span>

            🔍

          </span>


          <input

            type="text"

            placeholder="Search delicious products..."

            value={search}

            onChange={(e) =>

              setSearch(e.target.value)

            }

          />


        </div>


        {/* CATEGORY FILTERS */}

        <div className="category-filters">


          {categories.map((category) => (


            <button

              key={category}

              className={

                selectedCategory === category

                  ? "filter-btn active"

                  : "filter-btn"

              }


              onClick={() =>

                setSelectedCategory(category)

              }

            >

              {category}

            </button>


          ))}


        </div>


      </section>


      {/* ================= PRODUCT COUNT ================= */}

      <div className="product-count">


        <p>

          Showing{" "}

          <strong>

            {filteredProducts.length}

          </strong>

          {" "}products

        </p>


      </div>


      {/* ================= PRODUCTS GRID ================= */}

      <section className="products-grid">


        {filteredProducts.length > 0 ? (


          filteredProducts.map((product) => (


            <div

              className="shop-product-card"

              key={product.id}

            >


              {/* PRODUCT IMAGE */}

             <div className="shop-product-image">

  {/* WISHLIST BUTTON */}

  <button
    className={
      isInWishlist(product.id)
        ? "wishlist-btn active"
        : "wishlist-btn"
    }
    onClick={() => toggleWishlist(product)}
  >
    {isInWishlist(product.id)
      ? "❤️"
      : "🤍"}
  </button>


  <span>
    {product.emoji}
  </span>


  <div className="product-weight">
    {product.weight}
  </div>

</div>


              {/* PRODUCT INFORMATION */}

              <div className="shop-product-info">


                <p className="product-category">

                  {product.category}

                </p>


                <h3>

                  {product.name}

                </h3>


                <p className="shop-product-description">

                  {product.description}

                </p>


                <div className="shop-product-bottom">


                  <span className="shop-price">

                    ₹{product.price}

                  </span>


                  <button

                    className="shop-add-cart-btn"

                    onClick={() =>

                      addToCart(product)

                    }

                  >

                    Add to Cart 🛒

                  </button>


                </div>


              </div>


            </div>


          ))

        ) : (


          /* NO PRODUCTS */

          <div className="no-products">


            <h2>

              No Products Found

            </h2>


            <p>

              Try searching for something else.

            </p>


          </div>


        )}


      </section>


    </div>

  );

}


export default Products;