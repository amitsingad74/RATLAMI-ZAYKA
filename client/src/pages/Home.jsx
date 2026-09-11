import { Link } from "react-router-dom";

function Home() {
  return (
    <>


      {/* ================= HERO ================= */}

      <section className="hero" id="home">

        <div className="hero-left">

          <p className="hero-tag">
            AUTHENTIC TASTE OF RATLAM
          </p>


          <h1>
            Taste the Tradition,
            <br />

            Feel the <span>Zayka!</span>
          </h1>


          <p className="hero-description">

            Experience the authentic flavours of Ratlam.
            Premium Ratlami Sev, delicious namkeen,
            traditional sweets and much more.

          </p>


          <div className="hero-buttons">

            <Link to="/products" className="shop-btn">
              SHOP NOW
            </Link>


            <a
              href="#categories"
              className="explore-btn"
            >
              EXPLORE PRODUCTS
            </a>

          </div>

        </div>


        <div className="hero-right">

          <div className="hero-circle">

            <span className="hero-chilli">
              🌶️
            </span>

            <h2>
              RATLAMI
              <br />
              SEV
            </h2>

            <p>
              Original • Spicy • Authentic
            </p>

          </div>

        </div>

      </section>


      {/* ================= CATEGORY SECTION ================= */}

      <section className="categories" id="categories">

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

          <div className="category-card">

            <div className="category-icon">🌶️</div>

            <h3>Ratlami Sev</h3>

            <p>
              The original spicy taste of Ratlam.
            </p>

            <Link to="/products">
              Explore →
            </Link>

          </div>


          <div className="category-card">

            <div className="category-icon">🥨</div>

            <h3>Namkeen</h3>

            <p>
              Crispy, crunchy and full of flavour.
            </p>

            <Link to="/products">
              Explore →
            </Link>

          </div>


          <div className="category-card">

            <div className="category-icon">🍬</div>

            <h3>Traditional Sweets</h3>

            <p>
              Sweet memories in every bite.
            </p>

            <Link to="/products">
              Explore →
            </Link>

          </div>


          <div className="category-card">

            <div className="category-icon">🎁</div>

            <h3>Gift Hampers</h3>

            <p>
              Perfect gifts for every occasion.
            </p>

            <Link to="/products">
              Explore →
            </Link>

          </div>

        </div>

      </section>


      {/* ================= POPULAR PRODUCTS ================= */}

      <section className="products" id="products">

        <div className="section-header">

          <p className="section-tag">
            OUR BESTSELLERS
          </p>

          <h2>
            Popular Products
          </h2>

          <p>
            Handpicked favourites loved by our customers.
          </p>

        </div>


        <div className="product-grid">


          <div className="product-card">

            <div className="product-image">
              🌶️
            </div>

            <div className="product-info">

              <p className="product-category">
                RATLAMI SPECIAL
              </p>

              <h3>
                Classic Ratlami Sev
              </h3>

              <p className="product-description">
                Authentic spicy Ratlami Sev with traditional flavours.
              </p>

              <div className="product-bottom">

                <span className="price">
                  ₹120
                </span>

                <button className="add-cart-btn">
                  Add to Cart
                </button>

              </div>

            </div>

          </div>


          <div className="product-card">

            <div className="product-image">
              🥨
            </div>

            <div className="product-info">

              <p className="product-category">
                NAMKEEN
              </p>

              <h3>
                Masala Mixture
              </h3>

              <p className="product-description">
                Crunchy mixture packed with delicious Indian spices.
              </p>

              <div className="product-bottom">

                <span className="price">
                  ₹150
                </span>

                <button className="add-cart-btn">
                  Add to Cart
                </button>

              </div>

            </div>

          </div>


          <div className="product-card">

            <div className="product-image">
              🥜
            </div>

            <div className="product-info">

              <p className="product-category">
                CRUNCHY SNACKS
              </p>

              <h3>
                Spicy Peanut Mix
              </h3>

              <p className="product-description">
                Roasted peanuts with a perfect blend of spices.
              </p>

              <div className="product-bottom">

                <span className="price">
                  ₹180
                </span>

                <button className="add-cart-btn">
                  Add to Cart
                </button>

              </div>

            </div>

          </div>


          <div className="product-card">

            <div className="product-image">
              🍬
            </div>

            <div className="product-info">

              <p className="product-category">
                SWEETS
              </p>

              <h3>
                Traditional Mithai
              </h3>

              <p className="product-description">
                Delicious traditional sweets made with love.
              </p>

              <div className="product-bottom">

                <span className="price">
                  ₹250
                </span>

                <button className="add-cart-btn">
                  Add to Cart
                </button>

              </div>

            </div>

          </div>

        </div>


        <Link
          to="/products"
          className="view-products-btn"
        >
          VIEW ALL PRODUCTS →
        </Link>

      </section>


      {/* ================= SPECIAL OFFER ================= */}

      <section className="special-offer">

        <div className="offer-content">

          <div className="offer-left">

            <p className="offer-tag">
              LIMITED TIME OFFER
            </p>

            <h2>
              Taste More.
              <br />
              Pay Less! 🌶️
            </h2>

            <p className="offer-description">
              Enjoy the authentic taste of Ratlam with our special
              offers and exciting discounts on selected products.
            </p>

            <Link
              to="/products"
              className="offer-btn"
            >
              SHOP THE OFFER →
            </Link>

          </div>


          <div className="offer-right">

            <div className="discount-circle">

              <span className="discount-number">
                20%
              </span>

              <span className="discount-text">
                OFF
              </span>

            </div>

            <p className="offer-small-text">
              On Selected Products
            </p>

          </div>

        </div>

      </section>


      {/* ================= OUR STORY ================= */}

      <section className="our-story" id="about">

        <div className="story-image">

          <div className="story-circle">

            <span>🌶️</span>

            <h3>
              RATLAMI
              <br />
              ZAYKA
            </h3>

          </div>

        </div>


        <div className="story-content">

          <p className="section-tag">
            OUR STORY
          </p>

          <h2>
            A Taste of Ratlam,
            <br />
            Made With Love ❤️
          </h2>

          <p>
            RATLAMI Zayka brings the authentic and unforgettable
            flavours of Ratlam directly to your home.
          </p>

          <p>
            From traditional Ratlami Sev to delicious namkeen and
            sweets, every product is prepared with quality ingredients,
            traditional recipes and a passion for authentic taste.
          </p>


          <div className="story-features">

            <div className="story-feature">

              <div className="feature-icon">⭐</div>

              <div>
                <h4>Premium Quality</h4>

                <p>
                  Made with carefully selected ingredients.
                </p>

              </div>

            </div>


            <div className="story-feature">

              <div className="feature-icon">👨‍🍳</div>

              <div>

                <h4>Traditional Recipes</h4>

                <p>
                  Authentic flavours passed through generations.
                </p>

              </div>

            </div>


            <div className="story-feature">

              <div className="feature-icon">❤️</div>

              <div>

                <h4>Made With Love</h4>

                <p>
                  Every bite is made with passion and care.
                </p>

              </div>

            </div>

          </div>


          <button className="story-btn">
            KNOW MORE ABOUT US →
          </button>

        </div>

      </section>


      {/* ================= NEWSLETTER ================= */}

      <section className="newsletter">

        <div className="newsletter-content">

          <p className="section-tag">
            STAY CONNECTED
          </p>

          <h2>
            Get Delicious Updates! 🌶️
          </h2>

          <p>
            Subscribe to get special offers, new product updates,
            and authentic Ratlami Zayka news directly in your inbox.
          </p>


          <form className="newsletter-form">

            <input
              type="email"
              placeholder="Enter your email address"
            />

            <button type="submit">
              SUBSCRIBE
            </button>

          </form>

        </div>

      </section>


      {/* ================= FOOTER ================= */}

      <footer className="footer">

        <div className="footer-container">

          <div className="footer-column brand-column">

            <h2>
              🌶️ RATLAMI <span>ZAYKA</span>
            </h2>

            <p>
              Bringing the authentic and unforgettable
              taste of Ratlam directly to your home.
            </p>

            <div className="social-icons">

              <span>📘</span>

              <span>📸</span>

              <span>▶️</span>

            </div>

          </div>


          <div className="footer-column">

            <h3>Quick Links</h3>

            <Link to="/">Home</Link>

            <a href="#categories">Categories</a>

            <Link to="/products">Products</Link>

            <a href="#about">About Us</a>

          </div>


          <div className="footer-column">

            <h3>Customer Service</h3>

            <a href="#">Contact Us</a>

            <a href="#">Track Order</a>

            <a href="#">Shipping Policy</a>

            <a href="#">Return Policy</a>

          </div>


          <div className="footer-column">

            <h3>Contact Us</h3>

            <p>📍 Ratlam, Madhya Pradesh</p>

            <p>📞 +91 XXXXX XXXXX</p>

            <p>✉️ support@ratlamizayka.com</p>

          </div>

        </div>


        <div className="footer-bottom">

          <p>
            © 2026 RATLAMI Zayka. All Rights Reserved.
          </p>

        </div>

      </footer>

    </>
  );
}

export default Home;