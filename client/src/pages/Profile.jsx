import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  // =====================================================
  // GET USER
  // =====================================================

  const userData = localStorage.getItem("user");

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // =====================================================
  // CHECK LOGIN
  // =====================================================

  if (!userData) {
    return (
      <div className="profile-page">
        <div className="profile-not-logged">
          <div className="profile-login-icon">👤</div>

          <h2>Please Login First</h2>

          <p>
            Login to access your RATLAMI ZAYEKA account.
          </p>

          <button
            className="profile-login-btn"
            onClick={() => navigate("/login")}
          >
            Go to Login →
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // PARSE USER
  // =====================================================

  let user;

  try {
    user = JSON.parse(userData);
  } catch (error) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    return (
      <div className="profile-page">
        <div className="profile-not-logged">
          <div className="profile-login-icon">👤</div>

          <h2>Session Expired</h2>

          <p>
            Please login again to continue.
          </p>

          <button
            className="profile-login-btn"
            onClick={() => navigate("/login")}
          >
            Go to Login →
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // USER DATA
  // =====================================================

  const userName = user?.name || "RATLAMI Customer";
  const userEmail = user?.email || "Email not available";
  const userPhone = user?.phone || "Not provided";

  // =====================================================
  // EDIT PROFILE
  // =====================================================

  const handleEditProfile = () => {
    alert("Edit Profile feature will be added next.");
  };

  return (
    <div className="profile-page">

      {/* =================================================
          PROFILE HERO
      ================================================= */}

      <section className="profile-header">

        <p className="section-tag">
          MY ACCOUNT
        </p>

        <h1>
          My <span>Profile</span>
        </h1>

        <div className="gold-divider">
          <span></span>
          ✦
          <span></span>
        </div>

        <p className="profile-subtitle">
          Manage your account information.
        </p>

      </section>


      {/* =================================================
          MAIN PROFILE CONTAINER
      ================================================= */}

      <section className="profile-container">

        {/* =================================================
            USER CARD
        ================================================= */}

        <div className="profile-user-card">

          <div className="profile-user-left">

            <div className="profile-avatar">
              <span>♟</span>
            </div>

            <div className="profile-user-info">

              <h2>
                {userName}
              </h2>

              <p>
                {userEmail}
              </p>

            </div>

          </div>

          <button
            className="edit-profile-btn"
            onClick={handleEditProfile}
          >
            <span>✎</span>
            Edit Profile
          </button>

        </div>


        {/* =================================================
            QUICK ACTION CARDS
        ================================================= */}

        <div className="profile-quick-grid">

          {/* MY ORDERS */}

          <button
            className="profile-quick-card"
            onClick={() => navigate("/orders")}
          >
            <div className="quick-icon">
              ◈
            </div>

            <div className="quick-content">
              <h3>My Orders</h3>
              <p>Track & return orders</p>
            </div>

            <span className="quick-arrow">
              ›
            </span>
          </button>


          {/* WISHLIST */}

          <button
            className="profile-quick-card"
            onClick={() => navigate("/wishlist")}
          >
            <div className="quick-icon">
              ♥
            </div>

            <div className="quick-content">
              <h3>My Wishlist</h3>
              <p>Saved products</p>
            </div>

            <span className="quick-arrow">
              ›
            </span>
          </button>


          {/* SAVED ADDRESSES */}

          <button
            className="profile-quick-card"
            onClick={() => alert("Saved Addresses will be added with checkout address management.")}
          >
            <div className="quick-icon">
              ●
            </div>

            <div className="quick-content">
              <h3>Saved Addresses</h3>
              <p>Manage your addresses</p>
            </div>

            <span className="quick-arrow">
              ›
            </span>
          </button>


          {/* GIFT CARDS */}

          <button
            className="profile-quick-card"
            onClick={() => alert("Gift Cards feature will be added later.")}
          >
            <div className="quick-icon">
              ♢
            </div>

            <div className="quick-content">
              <h3>Gift Cards</h3>
              <p>Buy & redeem</p>
            </div>

            <span className="quick-arrow">
              ›
            </span>
          </button>

        </div>


        {/* =================================================
            ACCOUNT INFORMATION
        ================================================= */}

        <div className="profile-section-card">

          <div className="profile-section-heading">
            <h2>
              Account Information
            </h2>

            <div></div>
          </div>


          {/* PROFILE INFORMATION */}

          <button
            className="profile-list-item"
            onClick={() => {
              document
                .querySelector(".profile-user-card")
                ?.scrollIntoView({
                  behavior: "smooth",
                });
            }}
          >

            <span className="profile-list-icon">
              ♙
            </span>

            <span className="profile-list-text">
              <strong>
                Profile Information
              </strong>

              <small>
                Name, phone, email and personal details
              </small>
            </span>

            <span className="profile-list-arrow">
              ›
            </span>

          </button>


          {/* MANAGE ADDRESSES */}

          <button
            className="profile-list-item"
            onClick={() =>
              alert("Address management will be connected to checkout.")
            }
          >

            <span className="profile-list-icon">
              ◉
            </span>

            <span className="profile-list-text">
              <strong>
                Manage Addresses
              </strong>

              <small>
                Home, work and other addresses
              </small>
            </span>

            <span className="profile-list-arrow">
              ›
            </span>

          </button>


          {/* ORDERS */}

          <button
            className="profile-list-item"
            onClick={() => navigate("/orders")}
          >

            <span className="profile-list-icon">
              ◈
            </span>

            <span className="profile-list-text">
              <strong>
                My Orders
              </strong>

              <small>
                View, track or return orders
              </small>
            </span>

            <span className="profile-list-arrow">
              ›
            </span>

          </button>


          {/* WISHLIST */}

          <button
            className="profile-list-item"
            onClick={() => navigate("/wishlist")}
          >

            <span className="profile-list-icon">
              ♡
            </span>

            <span className="profile-list-text">
              <strong>
                My Wishlist
              </strong>

              <small>
                Your saved products
              </small>
            </span>

            <span className="profile-list-arrow">
              ›
            </span>

          </button>


          {/* REWARDS */}

          <button
            className="profile-list-item"
            onClick={() =>
              alert("Rewards & Offers will be added later.")
            }
          >

            <span className="profile-list-icon">
              ♢
            </span>

            <span className="profile-list-text">
              <strong>
                Rewards & Offers
              </strong>

              <small>
                Your points, coupons and special offers
              </small>
            </span>

            <span className="profile-list-arrow">
              ›
            </span>

          </button>


          {/* SUGGEST PRODUCTS */}

          <button
            className="profile-list-item"
            onClick={() => navigate("/contact")}
          >

            <span className="profile-list-icon">
              ☆
            </span>

            <span className="profile-list-text">
              <strong>
                Suggest Products
              </strong>

              <small>
                Help us improve our selection
              </small>
            </span>

            <span className="profile-list-arrow">
              ›
            </span>

          </button>

        </div>


        {/* =================================================
            PAYMENTS & SUPPORT
        ================================================= */}

        <div className="profile-section-card">

          <div className="profile-section-heading">
            <h2>
              Payments & Support
            </h2>

            <div></div>
          </div>


          {/* PAYMENT MANAGEMENT */}

          <button
            className="profile-list-item"
            onClick={() =>
              alert("Payment management will be available after payment gateway integration.")
            }
          >

            <span className="profile-list-icon">
              ▣
            </span>

            <span className="profile-list-text">
              <strong>
                Payment Management
              </strong>

              <small>
                Cards, UPI, wallets and more
              </small>
            </span>

            <span className="profile-list-arrow">
              ›
            </span>

          </button>


          {/* E-GIFT CARDS */}

          <button
            className="profile-list-item"
            onClick={() =>
              alert("E-Gift Cards will be added later.")
            }
          >

            <span className="profile-list-icon">
              ♢
            </span>

            <span className="profile-list-text">
              <strong>
                E-Gift Cards
              </strong>

              <small>
                Buy, send and manage gift cards
              </small>
            </span>

            <span className="profile-list-arrow">
              ›
            </span>

          </button>


          {/* HELP */}

          <button
            className="profile-list-item"
            onClick={() => navigate("/contact")}
          >

            <span className="profile-list-icon">
              ▢
            </span>

            <span className="profile-list-text">
              <strong>
                Help & Support
              </strong>

              <small>
                FAQs, returns and customer support
              </small>
            </span>

            <span className="profile-list-arrow">
              ›
            </span>

          </button>


          {/* NOTIFICATIONS */}

          <button
            className="profile-list-item"
            onClick={() =>
              alert("Notification preferences will be added later.")
            }
          >

            <span className="profile-list-icon">
              ♧
            </span>

            <span className="profile-list-text">
              <strong>
                Notifications
              </strong>

              <small>
                Manage your preferences
              </small>
            </span>

            <span className="profile-list-arrow">
              ›
            </span>

          </button>


          {/* ABOUT */}

          <button
            className="profile-list-item"
            onClick={() => navigate("/about")}
          >

            <span className="profile-list-icon">
              ⓘ
            </span>

            <span className="profile-list-text">
              <strong>
                About Us
              </strong>

              <small>
                Our story, policies and more
              </small>
            </span>

            <span className="profile-list-arrow">
              ›
            </span>

          </button>

        </div>


        {/* =================================================
            USER DETAILS
        ================================================= */}

        <div className="profile-contact-info">

          <div>
            <span>EMAIL</span>
            <strong>{userEmail}</strong>
          </div>

          <div>
            <span>PHONE</span>
            <strong>{userPhone}</strong>
          </div>

        </div>


        {/* =================================================
            LOGOUT
        ================================================= */}

        <button
          className="profile-logout-button"
          onClick={handleLogout}
        >
          <span>↪</span>
          Log Out
        </button>

      </section>

    </div>
  );
}

export default Profile;