const jwt = require("jsonwebtoken");

const authMiddleware = (
  req,
  res,
  next
) => {
  try {
    // =================================================
    // CHECK JWT SECRET
    // =================================================

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is not configured."
      );

      return res.status(500).json({
        message:
          "Authentication service is not configured.",
      });
    }

    // =================================================
    // GET AUTHORIZATION HEADER
    // =================================================

    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      typeof authHeader !== "string" ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message:
          "Access denied. Authentication required.",
      });
    }

    // =================================================
    // EXTRACT TOKEN
    // =================================================

    const token =
      authHeader
        .slice(7)
        .trim();

    if (!token) {
      return res.status(401).json({
        message:
          "Access denied. Invalid authentication token.",
      });
    }

    // =================================================
    // VERIFY TOKEN
    // =================================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // =================================================
    // BASIC TOKEN VALIDATION
    // =================================================

    if (
      !decoded ||
      !decoded.id
    ) {
      return res.status(401).json({
        message:
          "Invalid authentication token.",
      });
    }

    // =================================================
    // SAVE USER DATA
    // =================================================

    req.user = decoded;

    next();

  } catch (error) {
    console.error(
      "Authentication Error:",
      error.message
    );

    return res.status(401).json({
      message:
        "Invalid or expired token.",
    });
  }
};

module.exports =
  authMiddleware;