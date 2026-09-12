import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

import ratlamiSev from "../assets/ratlami-sev.png";
import heroBg from "../assets/hero.png";
function Home() {

  const { addToCart } = useCart();


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
    `
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


            <p>
              SPICY
            </p>


            <p>
              CRUNCHY
            </p>


            <p>
              AUTHENTIC
            </p>


            <span>
              ⌣
            </span>


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



        <div className="category-grid">


          {/* CATEGORY 1 */}

          <div className="category-card">


            <div className="category-icon">
              🌶️
            </div>


            <h3>
              Ratlami Sev
            </h3>


            <p>
              The original spicy taste of Ratlam.
            </p>


            <Link to="/products">
              Explore →
            </Link>


          </div>



          {/* CATEGORY 2 */}

          <div className="category-card">


            <div className="category-icon">
              🥨
            </div>


            <h3>
              Namkeen
            </h3>


            <p>
              Crispy, crunchy and full of flavour.
            </p>


            <Link to="/products">
              Explore →
            </Link>


          </div>



          {/* CATEGORY 3 */}

          <div className="category-card">


            <div className="category-icon">
              🍬
            </div>


            <h3>
              Traditional Sweets
            </h3>


            <p>
              Sweet memories in every bite.
            </p>


            <Link to="/products">
              Explore →
            </Link>


          </div>



          {/* CATEGORY 4 */}

          <div className="category-card">


            <div className="category-icon">
              🎁
            </div>


            <h3>
              Gift Hampers
            </h3>


            <p>
              Perfect gifts for every occasion.
            </p>


            <Link to="/products">
              Explore →
            </Link>


          </div>


        </div>


      </section>



     {/* =========================================
     POPULAR PRODUCTS
========================================= --> */}

<section class="products">

    <div class="section-header">

        <p class="section-tag">BEST SELLERS</p>

        <h2>Popular Products</h2>

        <p>
            Discover the authentic taste of Ratlam with our most loved products.
        </p>

        <div class="section-decoration">
            <span></span>
            ✦
            <span></span>
        </div>

    </div>


    <div class="product-grid">


        {/* PRODUCT 1 */}

        <div class="product-card">

            <div class="product-image">
                <img src="/images/ratlami-sev.png" alt="Ratlami Sev"/>
            </div>

            <div class="product-info">

                <p class="product-category">
                    RATLAMI SPECIAL
                </p>

                <h3>Ratlami Sev</h3>

                <p class="product-description">
                    The authentic spicy and crunchy taste of Ratlam.
                </p>

                <div class="product-bottom">

                    <span class="price">₹120</span>

                    <button class="add-cart-btn">
                        Add to Cart
                    </button>

                </div>

            </div>

        </div>


        {/* PRODUCT 2 */}

        <div class="product-card">

            <div class="product-image">
                <img src="images/namkeen.png" alt="Garlic Sev"/>
            </div>

            <div class="product-info">

                <p class="product-category">
                    NAMKEEN
                </p>

                <h3>Garlic Sev</h3>

                <p class="product-description">
                    Crispy sev with the rich flavour of garlic.
                </p>

                <div class="product-bottom">

                    <span class="price">₹140</span>

                    <button class="add-cart-btn">
                        Add to Cart
                    </button>

                </div>

            </div>

        </div>


        {/* PRODUCT 3 */}

        <div class="product-card">

            <div class="product-image">
                <img src="images/mixture.png" alt="Khatta Meetha Mix"/>
            </div>

            <div class="product-info">

                <p class="product-category">
                    NAMKEEN
                </p>

                <h3>Khatta Meetha Mix</h3>

                <p class="product-description">
                    A perfect combination of sweet, spicy and crunchy.
                </p>

                <div class="product-bottom">

                    <span class="price">₹150</span>

                    <button class="add-cart-btn">
                        Add to Cart
                    </button>

                </div>

            </div>

        </div>


        {/* PRODUCT 4 */}

        <div class="product-card">

            <div class="product-image">
                <img src="images/ladoo.png" alt="Besan Ladoo"/>
            </div>

            <div class="product-info">

                <p class="product-category">
                    TRADITIONAL SWEETS
                </p>

                <h3>Besan Ladoo</h3>

                <p class="product-description">
                    Traditional homemade sweetness in every bite.
                </p>

                <div class="product-bottom">

                    <span class="price">₹180</span>

                    <button class="add-cart-btn">
                        Add to Cart
                    </button>

                </div>

            </div>

        </div>


    </div>


    <Link to="/products" className="view-all-products">
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

      <button className="story-button">
        Know More <span>→</span>
      </button>

    </div>

  </div>

</section>


    


    


    </>

  );

}


export default Home;