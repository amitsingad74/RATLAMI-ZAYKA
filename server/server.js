// ===============================
// IMPORT PACKAGES
// ===============================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");

require("dotenv").config();


// ===============================
// USE GOOGLE DNS
// ===============================

dns.setServers([
  "8.8.8.8",
  "8.8.4.4"
]);


// ===============================
// IMPORT ROUTES
// ===============================

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const adminProductRoutes =
  require("./routes/adminProductRoutes");

  const adminOrderRoutes =
  require("./routes/adminOrderRoutes");

  const adminStatsRoutes =
  require("./routes/adminStatsRoutes");

  const adminUserRoutes =
  require("./routes/adminUserRoutes");

  const adminAnalyticsRoutes =
  require("./routes/adminAnalyticsRoutes");

// ===============================
// CREATE EXPRESS APP
// ===============================

const app = express();


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());


// ===============================
// TEST ROUTE
// ===============================

app.get("/", (req, res) => {
  res.send("RATLAMI Zayka Backend is Running! 🌶️");
});


// ===============================
// AUTH ROUTES
// ===============================

app.use("/api/auth", authRoutes);


// ===============================
// PRODUCT ROUTES
// ===============================

app.use("/api/products", productRoutes);

// ===============================
// ORDER ROUTES
// ===============================

app.use("/api/orders", orderRoutes);

// ===============================
// ADMIN PRODUCT ROUTES
// ===============================

app.use(
  "/api/admin/products",
  adminProductRoutes
);

app.use(
  "/api/admin/orders",
  adminOrderRoutes
);

app.use(
  "/api/admin/stats",
  adminStatsRoutes
);

app.use(
  "/api/admin/users",
  adminUserRoutes
);

app.use(
  "/api/admin/analytics",
  adminAnalyticsRoutes
);
// ===============================
// PORT
// ===============================

const PORT = process.env.PORT || 5000;


// ===============================
// CONNECT TO MONGODB
// ===============================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully! 🍃");

    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT} 🚀`
      );
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB Connection Error:",
      error.message
    );
  });