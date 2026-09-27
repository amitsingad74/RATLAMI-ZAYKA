import { Link } from "react-router-dom";

import { useWishlist } from "../context/WishlistContext";

import { useCart } from "../context/CartContext";


function Wishlist() {

  const {
    wishlist,
    removeFromWishlist
  } = useWishlist();


  const {
    addToCart
  } = useCart();


  return (

    <div className="wishlist-page">


      {/* HEADER */}

      <section className="wishlist-header">

        <p className="section-tag">
          YOUR FAVORITES
        </p>


        <h1>
          My <span>Wishlist ❤️</span>
        </h1>


        <p>
          Save your favorite Ratlami products
          and order them anytime.
        </p>

      </section>


      {/* EMPTY WISHLIST */}

      {wishlist.length === 0 ? (

        <div className="empty-wishlist">

          <h2>
            ❤️ Your Wishlist is Empty
          </h2>


          <p>
            Explore our products and
            add your favorites!
          </p>


          <Link
            to="/products"
            className="continue-shopping-btn"
          >
            Explore Products →
          </Link>

        </div>

      ) : (

        <section className="wishlist-grid">


          {wishlist.map((product) => (

            <div
              className="wishlist-card"
              key={product._id}
            >


              {/* PRODUCT IMAGE */}

              <div
                className="wishlist-image"
                style={{
                  position: "relative",
                  width: "100%",
                  height: "260px",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#fffaf1"
                }}
              >

                {product.image ? (

                  <img
                    src={product.image}
                    alt={product.name}
                    className="wishlist-product-image"
                    style={{
                      width: "230px",
                      height: "230px",
                      maxWidth: "90%",
                      maxHeight: "90%",
                      objectFit: "contain",
                      objectPosition: "center",
                      display: "block",
                      margin: 0,
                      padding: 0
                    }}
                  />

                ) : (

                  <span
                    style={{
                      fontSize: "75px"
                    }}
                  >
                    {product.emoji || "🍬"}
                  </span>

                )}


                {/* PRODUCT WEIGHT */}

                {product.weight && (

                  <div
                    className="product-weight"
                    style={{
                      position: "absolute",
                      top: "15px",
                      right: "15px",
                      zIndex: 5
                    }}
                  >
                    {product.weight}
                  </div>

                )}

              </div>


              {/* PRODUCT INFO */}

              <div className="wishlist-info">


                {/* CATEGORY */}

                <p className="product-category">
                  {product.category}
                </p>


                {/* PRODUCT NAME */}

                <h3>
                  {product.name}
                </h3>


                {/* DESCRIPTION */}

                <p>
                  {product.description}
                </p>


                {/* PRICE */}

                <h2>
                  ₹{product.price}
                </h2>


                {/* BUTTONS */}

                <div className="wishlist-actions">


                  {/* ADD TO CART */}

                  <button
                    type="button"
                    className="wishlist-cart-btn"
                    onClick={() =>
                      addToCart(product)
                    }
                  >
                    Add to Cart 🛒
                  </button>


                  {/* REMOVE */}

                  <button
                    type="button"
                    className="remove-wishlist-btn"
                    onClick={() =>
                      removeFromWishlist(
                        product._id
                      )
                    }
                  >
                    Remove ❤️
                  </button>


                </div>


              </div>


            </div>

          ))}


        </section>

      )}


    </div>

  );

}


export default Wishlist;