import { Link } from "react-router-dom";

import {
  useWishlist
} from "../context/WishlistContext";

import {
  useCart
} from "../context/CartContext";


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
              key={product.id}
            >


              {/* PRODUCT IMAGE */}

              <div className="wishlist-image">

                <span>
                  {product.emoji}
                </span>


                <div className="product-weight">
                  {product.weight}
                </div>

              </div>



              {/* PRODUCT INFO */}

              <div className="wishlist-info">


                <p className="product-category">
                  {product.category}
                </p>


                <h3>
                  {product.name}
                </h3>


                <p>
                  {product.description}
                </p>


                <h2>
                  ₹{product.price}
                </h2>



                {/* BUTTONS */}

                <div className="wishlist-actions">


                  <button
                    className="wishlist-cart-btn"
                    onClick={() =>
                      addToCart(product)
                    }
                  >

                    Add to Cart 🛒

                  </button>



                  <button
                    className="remove-wishlist-btn"
                    onClick={() =>
                      removeFromWishlist(
                        product.id
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