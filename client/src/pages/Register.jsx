import { useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../config/api";

function Register() {
  // ===============================
  // FORM DATA
  // ===============================

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  // ===============================
  // STATES
  // ===============================

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // SHOW / HIDE PASSWORD
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // ===============================
  // HANDLE INPUT CHANGE
  // ===============================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ===============================
  // HANDLE PHONE NUMBER
  // ===============================

  const handlePhoneChange = (e) => {
    // Allow only numbers
    const value = e.target.value.replace(/\D/g, "");

    setFormData({
      ...formData,
      phone: value,
    });
  };

  // ===============================
  // HANDLE REGISTER
  // ===============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setError("");
    setSuccess("");

    // ===============================
    // FRONTEND VALIDATION
    // ===============================

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    // EMAIL VALIDATION
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // PHONE VALIDATION
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(formData.phone)) {
      setError(
        "Please enter a valid 10-digit Indian mobile number."
      );
      return;
    }

    // PASSWORD LENGTH
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // PASSWORD MATCH
    if (
      formData.password !== formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    // TERMS
    if (!formData.terms) {
      setError(
        "Please accept the Terms & Conditions."
      );
      return;
    }

    // ===============================
    // SEND DATA TO BACKEND
    // ===============================

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      // ===============================
      // HANDLE BACKEND ERROR
      // ===============================

      if (!response.ok) {
        setError(
          data.message || "Registration failed."
        );

        setLoading(false);
        return;
      }

      // ===============================
      // SUCCESS
      // ===============================

      setSuccess(data.message);

      console.log("Registered User:", data.user);

      // Clear form
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        terms: false,
      });

    } catch (error) {

      console.error("Registration Error:", error);

      setError(
        "Unable to connect to server. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };

  // ===============================
  // UI
  // ===============================

  return (
    <div className="auth-page">

      <div className="auth-container">

        {/* ===============================
            LEFT SIDE
        =============================== */}

        <div className="auth-welcome">

          <div className="auth-brand">
            🌶️ RATLAMI <span>ZAYKA</span>
          </div>

          <h1>
            Join the Zayka Family! ❤️
          </h1>

          <p>
            Create your account and enjoy authentic
            Ratlami flavours delivered to your doorstep.
          </p>

          <div className="auth-decoration">
            🌶️ 🥨 🍬
          </div>

        </div>


        {/* ===============================
            RIGHT SIDE
        =============================== */}

        <div className="auth-form-section">

          <div className="auth-form">

            <p className="section-tag">
              CREATE ACCOUNT
            </p>

            <h2>
              Join RATLAMI Zayka
            </h2>

            <p className="auth-subtitle">
              Create an account and start shopping.
            </p>


            {/* ERROR MESSAGE */}

            {error && (
              <div className="form-error">
                ⚠️ {error}
              </div>
            )}


            {/* SUCCESS MESSAGE */}

            {success && (
              <div className="form-success">
                ✅ {success}
              </div>
            )}


            {/* ===============================
                REGISTER FORM
            =============================== */}

            <form onSubmit={handleSubmit}>


              {/* FULL NAME */}

              <div className="form-group">

                <label>Full Name</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />

              </div>


              {/* EMAIL */}

              <div className="form-group">

                <label>Email Address</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />

              </div>


              {/* PHONE */}

              <div className="form-group">

                <label>Phone Number</label>

                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  maxLength="10"
                />

              </div>


              {/* PASSWORD */}

              <div className="form-group">

                <label>Password</label>

                <div className="password-input">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>

                </div>

              </div>


              {/* CONFIRM PASSWORD */}

              <div className="form-group">

                <label>Confirm Password</label>

                <div className="password-input">

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword
                      ? "🙈"
                      : "👁️"}
                  </button>

                </div>

              </div>


              {/* TERMS */}

              <label className="terms">

                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                />

                <span>
                  I agree to the Terms & Conditions
                  and Privacy Policy.
                </span>

              </label>


              {/* REGISTER BUTTON */}

              <button
                type="submit"
                className="auth-btn"
                disabled={loading}
              >
                {loading
                  ? "CREATING ACCOUNT..."
                  : "CREATE ACCOUNT →"}
              </button>

            </form>


            {/* LOGIN LINK */}

            <p className="auth-switch">

              Already have an account?

              <Link to="/login">
                Login
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;