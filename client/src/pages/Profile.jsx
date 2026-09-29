import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  // =====================================================
  // API URL
  // =====================================================

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  // =====================================================
  // STATES
  // =====================================================

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [editOpen, setEditOpen] = useState(false);

  const [saveMessage, setSaveMessage] = useState("");

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [notifications, setNotifications] = useState(() => {
    return (
      localStorage.getItem("profileNotifications") !==
      "false"
    );
  });

  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // =====================================================
  // FETCH LOGGED-IN USER
  // =====================================================

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      // -------------------------------------------------
      // NO TOKEN
      // -------------------------------------------------

      if (!token) {
        setLoading(false);
        setError("Please login first.");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/auth/profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        // -------------------------------------------------
        // TOKEN INVALID / EXPIRED
        // -------------------------------------------------

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          setLoading(false);
          setError("Your session has expired.");

          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch profile."
          );
        }

        // -------------------------------------------------
        // USER RECEIVED
        // -------------------------------------------------

        if (data.user) {
          setUser(data.user);

          setEditData({
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
          });

          // Keep local user information synchronized.
          localStorage.setItem(
            "user",
            JSON.stringify(data.user)
          );
        } else {
          throw new Error("User information not found.");
        }
      } catch (err) {
        console.error("Profile Error:", err);

        // -------------------------------------------------
        // FALLBACK TO LOCAL USER
        // -------------------------------------------------

        const storedUser =
          localStorage.getItem("user");

        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);

            setUser(parsedUser);

            setEditData({
              name: parsedUser.name || "",
              email: parsedUser.email || "",
              phone: parsedUser.phone || "",
            });

            setError("");
          } catch {
            localStorage.removeItem("user");
            localStorage.removeItem("token");

            setError(
              "Your session is invalid. Please login again."
            );
          }
        } else {
          setError(
            err.message ||
              "Unable to load your profile."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [API_URL]);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  // =====================================================
  // LOGIN PAGE
  // =====================================================

  const handleLogin = () => {
    navigate("/login", {
      replace: true,
    });
  };

  // =====================================================
  // EDIT PROFILE
  // =====================================================

  const handleEditProfile = () => {
    setSaveMessage("");

    setEditData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });

    setEditOpen(true);
  };

  // =====================================================
  // EDIT INPUT
  // =====================================================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const numbersOnly = value.replace(/\D/g, "");

      setEditData((previous) => ({
        ...previous,
        phone: numbersOnly.slice(0, 10),
      }));

      return;
    }

    setEditData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSaveProfile = (e) => {
    e.preventDefault();

    const cleanName = editData.name.trim();
    const cleanEmail = editData.email.trim();
    const cleanPhone = editData.phone.trim();

    // -------------------------------------------------
    // NAME VALIDATION
    // -------------------------------------------------

    if (!cleanName) {
      setSaveMessage("Please enter your name.");
      return;
    }

    // -------------------------------------------------
    // EMAIL VALIDATION
    // -------------------------------------------------

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      setSaveMessage(
        "Please enter a valid email address."
      );
      return;
    }

    // -------------------------------------------------
    // PHONE VALIDATION
    // -------------------------------------------------

    if (
      cleanPhone &&
      !/^[6-9]\d{9}$/.test(cleanPhone)
    ) {
      setSaveMessage(
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    // -------------------------------------------------
    // UPDATED USER
    // -------------------------------------------------

    const updatedUser = {
      ...user,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
    };

    // -------------------------------------------------
    // UPDATE UI
    // -------------------------------------------------

    setUser(updatedUser);

    // -------------------------------------------------
    // SAVE LOCALLY
    // -------------------------------------------------

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    setSaveMessage(
      "Profile updated successfully."
    );

    // Close after short delay
    setTimeout(() => {
      setEditOpen(false);
      setSaveMessage("");
    }, 800);
  };

  // =====================================================
  // CLOSE EDIT
  // =====================================================

  const closeEditProfile = () => {
    setEditOpen(false);
    setSaveMessage("");
  };

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  const handleNotifications = () => {
    setNotificationOpen(true);
  };

  const toggleNotifications = () => {
    const newValue = !notifications;

    setNotifications(newValue);

    localStorage.setItem(
      "profileNotifications",
      String(newValue)
    );
  };

  // =====================================================
  // COMMON NAVIGATION
  // =====================================================

  const goToOrders = () => {
    navigate("/orders");
  };

  const goToWishlist = () => {
    navigate("/wishlist");
  };

  const goToCheckout = () => {
    navigate("/checkout");
  };

  const goToProducts = () => {
    navigate("/products");
  };

  const goToContact = () => {
    navigate("/contact");
  };

  const goToAbout = () => {
    navigate("/about");
  };

  // =====================================================
  // SCROLL TO PROFILE
  // =====================================================

  const scrollToProfile = () => {
    document
      .querySelector(".profile-user-card")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="profile-page">
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "15px",
            color: "#17283b",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              border: "4px solid #ead8b5",
              borderTop: "4px solid #d49a24",
              borderRadius: "50%",
              animation: "profileSpin 0.8s linear infinite",
            }}
          />

          <p
            style={{
              margin: 0,
              fontSize: "16px",
            }}
          >
            Loading your profile...
          </p>

          <style>
            {`
              @keyframes profileSpin {
                from {
                  transform: rotate(0deg);
                }

                to {
                  transform: rotate(360deg);
                }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  // =====================================================
  // NOT LOGGED IN / SESSION ERROR
  // =====================================================

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-not-logged">
          <div className="profile-login-icon">
            👤
          </div>

          <h2>
            {error === "Your session has expired."
              ? "Session Expired"
              : "Please Login First"}
          </h2>

          <p>
            {error ||
              "Login to access your RATLAMI ZAYEKA account."}
          </p>

          <button
            className="profile-login-btn"
            onClick={handleLogin}
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

  const userName =
    user?.name || "RATLAMI Customer";

  const userEmail =
    user?.email || "Email not available";

  const userPhone =
    user?.phone || "Not provided";

  // =====================================================
  // MAIN PROFILE
  // =====================================================

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
            type="button"
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
            type="button"
            className="profile-quick-card"
            onClick={goToOrders}
          >
            <div className="quick-icon">
              ◈
            </div>

            <div className="quick-content">
              <h3>
                My Orders
              </h3>

              <p>
                Track & return orders
              </p>
            </div>

            <span className="quick-arrow">
              ›
            </span>
          </button>


          {/* WISHLIST */}

          <button
            type="button"
            className="profile-quick-card"
            onClick={goToWishlist}
          >
            <div className="quick-icon">
              ♥
            </div>

            <div className="quick-content">
              <h3>
                My Wishlist
              </h3>

              <p>
                Saved products
              </p>
            </div>

            <span className="quick-arrow">
              ›
            </span>
          </button>


          {/* SAVED ADDRESSES */}

          <button
            type="button"
            className="profile-quick-card"
            onClick={goToCheckout}
          >
            <div className="quick-icon">
              ●
            </div>

            <div className="quick-content">
              <h3>
                Saved Addresses
              </h3>

              <p>
                Manage your addresses
              </p>
            </div>

            <span className="quick-arrow">
              ›
            </span>
          </button>


          {/* GIFT CARDS */}

          <button
            type="button"
            className="profile-quick-card"
            onClick={goToProducts}
          >
            <div className="quick-icon">
              ♢
            </div>

            <div className="quick-content">
              <h3>
                Gift Cards
              </h3>

              <p>
                Buy & redeem
              </p>
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
            type="button"
            className="profile-list-item"
            onClick={scrollToProfile}
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
            type="button"
            className="profile-list-item"
            onClick={goToCheckout}
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
            type="button"
            className="profile-list-item"
            onClick={goToOrders}
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
            type="button"
            className="profile-list-item"
            onClick={goToWishlist}
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


          {/* REWARDS & OFFERS */}

          <button
            type="button"
            className="profile-list-item"
            onClick={goToProducts}
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
            type="button"
            className="profile-list-item"
            onClick={goToContact}
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
            type="button"
            className="profile-list-item"
            onClick={goToCheckout}
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
            type="button"
            className="profile-list-item"
            onClick={goToProducts}
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
            type="button"
            className="profile-list-item"
            onClick={goToContact}
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
            type="button"
            className="profile-list-item"
            onClick={handleNotifications}
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
            type="button"
            className="profile-list-item"
            onClick={goToAbout}
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
            <span>
              EMAIL
            </span>

            <strong>
              {userEmail}
            </strong>
          </div>

          <div>
            <span>
              PHONE
            </span>

            <strong>
              {userPhone}
            </strong>
          </div>

        </div>


        {/* =================================================
            LOGOUT
        ================================================= */}

        <button
          type="button"
          className="profile-logout-button"
          onClick={handleLogout}
        >
          <span>
            ↪
          </span>

          Log Out
        </button>

      </section>


      {/* =================================================
          EDIT PROFILE MODAL
      ================================================= */}

      {editOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background:
              "rgba(3, 22, 43, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeEditProfile();
            }
          }}
        >

          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#fffdf9",
              borderRadius: "18px",
              padding: "30px",
              boxSizing: "border-box",
              boxShadow:
                "0 25px 70px rgba(0,0,0,.25)",
              border: "1px solid #ead8b5",
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "25px",
              }}
            >

              <div>
                <p
                  style={{
                    margin: "0 0 5px",
                    color: "#a86d08",
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: "2px",
                  }}
                >
                  MY ACCOUNT
                </p>

                <h2
                  style={{
                    margin: 0,
                    color: "#17283b",
                    fontFamily:
                      'Georgia, "Times New Roman", serif',
                    fontSize: "28px",
                  }}
                >
                  Edit Profile
                </h2>
              </div>

              <button
                type="button"
                onClick={closeEditProfile}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  border:
                    "1px solid #d8b46a",
                  background: "#fff8ea",
                  color: "#17283b",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form onSubmit={handleSaveProfile}>

              {/* NAME */}

              <div
                style={{
                  marginBottom: "17px",
                }}
              >

                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    color: "#17283b",
                    fontWeight: "700",
                    fontSize: "14px",
                  }}
                >
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                  placeholder="Enter your name"
                  style={{
                    width: "100%",
                    height: "48px",
                    boxSizing: "border-box",
                    border:
                      "1px solid #d9c9ad",
                    borderRadius: "9px",
                    padding: "0 14px",
                    outline: "none",
                    fontSize: "15px",
                    color: "#17283b",
                    background: "#ffffff",
                  }}
                />

              </div>


              {/* EMAIL */}

              <div
                style={{
                  marginBottom: "17px",
                }}
              >

                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    color: "#17283b",
                    fontWeight: "700",
                    fontSize: "14px",
                  }}
                >
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleEditChange}
                  placeholder="Enter your email"
                  style={{
                    width: "100%",
                    height: "48px",
                    boxSizing: "border-box",
                    border:
                      "1px solid #d9c9ad",
                    borderRadius: "9px",
                    padding: "0 14px",
                    outline: "none",
                    fontSize: "15px",
                    color: "#17283b",
                    background: "#ffffff",
                  }}
                />

              </div>


              {/* PHONE */}

              <div
                style={{
                  marginBottom: "20px",
                }}
              >

                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    color: "#17283b",
                    fontWeight: "700",
                    fontSize: "14px",
                  }}
                >
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={editData.phone}
                  onChange={handleEditChange}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                  style={{
                    width: "100%",
                    height: "48px",
                    boxSizing: "border-box",
                    border:
                      "1px solid #d9c9ad",
                    borderRadius: "9px",
                    padding: "0 14px",
                    outline: "none",
                    fontSize: "15px",
                    color: "#17283b",
                    background: "#ffffff",
                  }}
                />

              </div>


              {/* MESSAGE */}

              {saveMessage && (
                <div
                  style={{
                    marginBottom: "15px",
                    padding: "11px 13px",
                    borderRadius: "8px",
                    background:
                      saveMessage.includes(
                        "successfully"
                      )
                        ? "#edf8ef"
                        : "#fff1f0",
                    color:
                      saveMessage.includes(
                        "successfully"
                      )
                        ? "#26733a"
                        : "#a33a32",
                    fontSize: "14px",
                  }}
                >
                  {saveMessage}
                </div>
              )}


              {/* BUTTONS */}

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                }}
              >

                <button
                  type="button"
                  onClick={closeEditProfile}
                  style={{
                    flex: 1,
                    height: "48px",
                    borderRadius: "9px",
                    border:
                      "1px solid #d6b46c",
                    background: "#fffdf9",
                    color: "#17283b",
                    fontSize: "15px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    flex: 1,
                    height: "48px",
                    borderRadius: "9px",
                    border: "none",
                    background:
                      "linear-gradient(135deg,#f8c85c,#e9a92f)",
                    color: "#17283b",
                    fontSize: "15px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Save Changes
                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* =================================================
          NOTIFICATION MODAL
      ================================================= */}

      {notificationOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            background:
              "rgba(3, 22, 43, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setNotificationOpen(false);
            }
          }}
        >

          <div
            style={{
              width: "100%",
              maxWidth: "470px",
              background: "#fffdf9",
              borderRadius: "18px",
              padding: "30px",
              boxSizing: "border-box",
              boxShadow:
                "0 25px 70px rgba(0,0,0,.25)",
              border: "1px solid #ead8b5",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "25px",
              }}
            >

              <div>
                <p
                  style={{
                    margin: "0 0 5px",
                    color: "#a86d08",
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: "2px",
                  }}
                >
                  PREFERENCES
                </p>

                <h2
                  style={{
                    margin: 0,
                    color: "#17283b",
                    fontFamily:
                      'Georgia, "Times New Roman", serif',
                    fontSize: "26px",
                  }}
                >
                  Notifications
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setNotificationOpen(false)
                }
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  border:
                    "1px solid #d8b46a",
                  background: "#fff8ea",
                  color: "#17283b",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>

            </div>


            {/* NOTIFICATION OPTION */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "15px",
                padding: "18px",
                borderRadius: "12px",
                background: "#f8f1e5",
                border:
                  "1px solid #ead8b5",
              }}
            >

              <div>
                <strong
                  style={{
                    display: "block",
                    color: "#17283b",
                    marginBottom: "5px",
                    fontSize: "16px",
                  }}
                >
                  Order & Store Notifications
                </strong>

                <span
                  style={{
                    display: "block",
                    color: "#5c6f7b",
                    fontSize: "13px",
                    lineHeight: "1.5",
                  }}
                >
                  Receive important updates about your
                  orders and account.
                </span>
              </div>

              <button
                type="button"
                onClick={toggleNotifications}
                aria-label="Toggle notifications"
                style={{
                  width: "54px",
                  height: "30px",
                  flexShrink: 0,
                  border: "none",
                  borderRadius: "30px",
                  padding: "3px",
                  background: notifications
                    ? "#d99d25"
                    : "#9ba7ad",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    notifications
                      ? "flex-end"
                      : "flex-start",
                }}
              >
                <span
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "#ffffff",
                    display: "block",
                    boxShadow:
                      "0 2px 5px rgba(0,0,0,.2)",
                  }}
                />
              </button>

            </div>


            <button
              type="button"
              onClick={() =>
                setNotificationOpen(false)
              }
              style={{
                width: "100%",
                height: "46px",
                marginTop: "20px",
                border: "none",
                borderRadius: "9px",
                background:
                  "linear-gradient(135deg,#f8c85c,#e9a92f)",
                color: "#17283b",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Done
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default Profile;