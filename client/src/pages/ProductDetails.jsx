import { useParams, Link } from "react-router-dom";

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
    image: "/images/ratlamiSev.png",
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


function ProductDetails() {

  const { id } = useParams();

  const { addToCart } = useCart();

  const {
    toggleWishlist,
    isInWishlist
  } = useWishlist();


  const product = products.find(
    (item) => item.id === Number(id)
  );


  // ================= PRODUCT NOT FOUND =================

  if (!product) {

    return (

      <div className="product-not-found">

        <h1>
          Product Not Found
        </h1>

        <Link to="/products">
          ← Back to Products
        </Link>

      </div>

    );

  }


  return (

    <div className="product-details-page">


      {/* ================= BACK ================= */}

      <Link
        to="/products"
        className="back-products"
      >
        ← Back to Products
      </Link>



      {/* ================= MAIN CONTAINER ================= */}

      <div className="product-details-container">


        {/* ================= PRODUCT IMAGE ================= */}

        <div className="product-details-image">


          {/* WISHLIST BUTTON */}

          <button
            type="button"
            className={
              isInWishlist(product.id)
                ? "wishlist-btn active"
                : "wishlist-btn"
            }
            onClick={() =>
              toggleWishlist(product)
            }
            title="Add to Wishlist"
          >

            {isInWishlist(product.id)
              ? "❤️"
              : "🤍"}

          </button>



          {/* ================= IMAGE WRAPPER ================= */}

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



        {/* ================= PRODUCT INFORMATION ================= */}

        <div className="product-details-info">


          <p className="product-category">
            {product.category}
          </p>


          <h1>
            {product.name}
          </h1>


          <p className="product-details-description">
            {product.description}
          </p>


          <div className="product-details-price">
            ₹{product.price}
          </div>


          <p className="product-details-weight">
            Net Weight: {product.weight}
          </p>



          {/* ================= BUTTONS ================= */}

          <div className="product-details-buttons">


            {/* ADD TO CART */}

            <button
              type="button"
              className="product-details-cart-btn"
              onClick={() =>
                addToCart(product)
              }
            >

              Add to Cart 🛒

            </button>



            {/* WISHLIST */}

            <button
              type="button"
              className="product-details-wishlist-btn"
              onClick={() =>
                toggleWishlist(product)
              }
            >

              {isInWishlist(product.id)
                ? "❤️ Remove from Wishlist"
                : "🤍 Add to Wishlist"}

            </button>


          </div>


        </div>


      </div>


    </div>

  );

}


export default ProductDetails;