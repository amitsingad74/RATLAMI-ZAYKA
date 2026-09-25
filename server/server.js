// =====================================================
// IMPORT PACKAGES
// =====================================================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");

require("dotenv").config();

// =====================================================
// USE GOOGLE DNS
// =====================================================

dns.setServers([
  "8.8.8.8",
  "8.8.4.4",
]);

// =====================================================
// ENVIRONMENT CHECK
// =====================================================

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is missing in .env");
  process.exit(1);
}

// =====================================================
// IMPORT ROUTES
// =====================================================

const authRoutes =
  require("./routes/authRoutes");

const productRoutes =
  require("./routes/productRoutes");

const orderRoutes =
  require("./routes/orderRoutes");

const adminProductRoutes =
  require("./routes/adminProductRoutes");

const adminOrderRoutes =
  require("./routes/adminOrderRoutes");

const adminCategoryRoutes =
  require("./routes/adminCategoryRoutes");

const categoryRoutes =
  require("./routes/categoryRoutes");

const adminStatsRoutes =
  require("./routes/adminStatsRoutes");

const adminUserRoutes =
  require("./routes/adminUserRoutes");

const adminAnalyticsRoutes =
  require("./routes/adminAnalyticsRoutes");

const paymentRoutes =
  require("./routes/paymentRoutes");

const contactRoutes =
  require("./routes/contactRoutes");

  const adminContactRoutes =
  require("./routes/adminContactRoutes");

// =====================================================
// CREATE EXPRESS APP
// =====================================================

const app = express();

// =====================================================
// CORS
// =====================================================

// Development:
// http://localhost:5173
//
// Production:
// Set CLIENT_URL in .env
//
// Example:
// CLIENT_URL=https://yourdomain.com

const allowedOrigins = (
  process.env.CLIENT_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin header
      // such as server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("CORS policy blocked this origin.")
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// =====================================================
// RAZORPAY WEBHOOK RAW BODY
// =====================================================
//
// IMPORTANT:
// This MUST come before express.json().
//
// Razorpay webhook signature is generated
// from the exact raw request body.
//

app.use(
  (req, res, next) => {
    if (
      req.originalUrl ===
        "/api/payment/webhook" ||
      req.originalUrl.startsWith(
        "/api/payment/webhook?"
      )
    ) {
      return express.raw({
        type: "application/json",
      })(req, res, next);
    }

    next();
  }
);

// =====================================================
// NORMAL JSON BODY PARSER
// =====================================================
//
// Limit request body size to reduce abuse
// from extremely large JSON requests.
//

app.use(
  express.json({
    limit: "1mb",
  })
);

// =====================================================
// TEST ROUTE
// =====================================================

app.get(
  "/",
  (req, res) => {
    res.status(200).send(
      "RATLAMI Zayka Backend is Running! 🌶️"
    );
  }
);

// =====================================================
// AUTH ROUTES
// =====================================================

app.use(
  "/api/auth",
  authRoutes
);

// =====================================================
// PRODUCT ROUTES
// =====================================================

app.use(
  "/api/products",
  productRoutes
);

// =====================================================
// ORDER ROUTES
// =====================================================

app.use(
  "/api/orders",
  orderRoutes
);

// =====================================================
// ADMIN PRODUCT ROUTES
// =====================================================

app.use(
  "/api/admin/products",
  adminProductRoutes
);

// =====================================================
// ADMIN ORDER ROUTES
// =====================================================

app.use(
  "/api/admin/orders",
  adminOrderRoutes
);

// =====================================================
// ADMIN STATS ROUTES
// =====================================================

app.use(
  "/api/admin/stats",
  adminStatsRoutes
);

// =====================================================
// ADMIN USER ROUTES
// =====================================================

app.use(
  "/api/admin/users",
  adminUserRoutes
);

// =====================================================
// ADMIN ANALYTICS ROUTES
// =====================================================

app.use(
  "/api/admin/analytics",
  adminAnalyticsRoutes
);

// =====================================================
// PAYMENT ROUTES
// =====================================================

app.use(
  "/api/payment",
  paymentRoutes
);

// =====================================================
// ADMIN CATEGORY ROUTES
// =====================================================

app.use(
  "/api/admin/categories",
  adminCategoryRoutes
);

// =====================================================
// PUBLIC CATEGORY ROUTES
// =====================================================

app.use(
  "/api/categories",
  categoryRoutes
);

// =====================================================
// CONTACT ROUTES
// =====================================================

app.use(
  "/api/contact",
  contactRoutes
);


app.use(
  "/api/admin/contact",
  adminContactRoutes
);
// =====================================================
// 404 HANDLER
// =====================================================

app.use(
  (req, res) => {
    res.status(404).json({
      message: "API endpoint not found.",
    });
  }
);


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
  (error, req, res, next) => {
    console.error(
      "Server Error:",
      error.message
    );

    // CORS error
    if (
      error.message ===
      "CORS policy blocked this origin."
    ) {
      return res.status(403).json({
        message: "Request origin is not allowed.",
      });
    }

    res.status(500).json({
      message:
        "Internal server error. Please try again.",
    });
  }
);

// =====================================================
// PORT
// =====================================================

const PORT =
  process.env.PORT || 5000;

// =====================================================
// CONNECT TO MONGODB
// =====================================================

mongoose
  .connect(
    process.env.MONGO_URI
  )

  .then(() => {
    console.log(
      "MongoDB Connected Successfully! 🍃"
    );

    // =================================================
    // START SERVER
    // =================================================

    app.listen(
      PORT,
      () => {
        console.log(
          `Server running on port ${PORT} 🚀`
        );

        console.log(
          `Allowed frontend origins: ${allowedOrigins.join(
            ", "
          )}`
        );
      }
    );
  })

  .catch(
    (error) => {
      console.error(
        "MongoDB Connection Error:",
        error.message
      );

      process.exit(1);
    }
  );