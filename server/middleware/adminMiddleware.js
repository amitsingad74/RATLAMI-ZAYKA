const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ===============================
// ADMIN AUTHENTICATION MIDDLEWARE
// ===============================

const adminMiddleware = async (req, res, next) => {
  try {
    // ===============================
    // CHECK JWT SECRET
    // ===============================

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");

      return res.status(500).json({
        message: "Server configuration error.",
      });
    }

    // ===============================
    // GET AUTHORIZATION HEADER
    // ===============================

    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      typeof authHeader !== "string" ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "Not authorized. Please login.",
      });
    }

    // ===============================
    // GET TOKEN
    // ===============================

    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        message: "Not authorized. Please login.",
      });
    }

    // ===============================
    // VERIFY TOKEN
    // ===============================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    // ===============================
    // FIND CURRENT USER
    // ===============================
    // We fetch the user from MongoDB instead of trusting
    // the role stored inside the JWT.

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User not found.",
      });
    }

    // ===============================
    // CHECK ADMIN ROLE
    // ===============================

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin only.",
      });
    }

    // ===============================
    // ATTACH USER
    // ===============================

    req.user = user;

    next();
  } catch (error) {
    console.error(
      "Admin Authentication Error:",
      error.message
    );

    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

module.exports = adminMiddleware;