const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ===============================
// ADMIN AUTHENTICATION MIDDLEWARE
// ===============================

const adminMiddleware = async (req, res, next) => {
  try {

    // ===============================
    // GET TOKEN
    // ===============================

    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "Not authorized. Please login.",
      });
    }


    const token = authHeader.split(" ")[1];


    // ===============================
    // VERIFY TOKEN
    // ===============================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );


    // ===============================
    // FIND USER
    // ===============================

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