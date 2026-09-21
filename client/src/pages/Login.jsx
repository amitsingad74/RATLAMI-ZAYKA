import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../config/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ===============================
    // FRONTEND VALIDATION
    // ===============================

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    // EMAIL VALIDATION
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // PASSWORD VALIDATION
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      // ===============================
      // SEND LOGIN DATA TO BACKEND
      // ===============================

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      // ===============================
      // LOGIN FAILED
      // ===============================

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      // ===============================
      // LOGIN SUCCESS
      // ===============================

      // Save JWT Token
      localStorage.setItem("token", data.token);

      // Save User Information
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      console.log("Logged in user:", data.user);

      // Show Success Message
      setSuccess(
        data.message || "Login successful!"
      );

      // Clear Form
      setEmail("");
      setPassword("");

      // Redirect to Home
      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (error) {

      console.error("Login Error:", error);

      setError(
        "Cannot connect to server. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="auth-page">

      <div className="auth-container">

        {/* LEFT SIDE */}
        <div className="auth-welcome">

          <div className="auth-brand">
            🌶️ RATLAMI <span>ZAYKA</span>
          </div>

          <h1>
            Welcome Back! 👋
          </h1>

          <p>
            Login to continue your delicious journey with
            authentic flavours of Ratlam.
          </p>

          <div className="auth-decoration">
            🌶️ 🥨 🍬
          </div>

        </div>


        {/* RIGHT SIDE */}
        <div className="auth-form-section">

          <div className="auth-form">

            <p className="section-tag">
              WELCOME BACK
            </p>

            <h2>
              Login to Your Account
            </h2>

            <p className="auth-subtitle">
              Enter your details to continue shopping.
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


            <form onSubmit={handleSubmit}>

              {/* EMAIL */}
              <div className="form-group">

                <label>Email Address</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />

              </div>


              {/* PASSWORD */}
              <div className="form-group">

                <label>Password</label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />

              </div>


              {/* OPTIONS */}
              <div className="form-options">

                <label className="remember-me">

                  <input type="checkbox" />

                  Remember me

                </label>


                <a href="#">
                  Forgot Password?
                </a>

              </div>


              {/* LOGIN BUTTON */}
              <button
                type="submit"
                className="auth-btn"
                disabled={loading}
              >
                {loading
                  ? "LOGGING IN..."
                  : "LOGIN →"}
              </button>

            </form>


            {/* REGISTER LINK */}
            <p className="auth-switch">

              Don't have an account?

              <Link to="/register">
                Create Account
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;