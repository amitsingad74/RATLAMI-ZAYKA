const express = require("express");
const Product = require("../models/Product");
const Order = require("../models/Order");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// =========================================
// GET ADMIN DASHBOARD STATISTICS
// =========================================

router.get(
  "/",
  adminMiddleware,
  async (req, res) => {
    console.log("🔥 ADMIN STATS API CALLED");

    try {
      // =====================================
      // TOTAL PRODUCTS
      // =====================================

      const totalProducts =
        await Product.countDocuments();

      // =====================================
      // TOTAL ORDERS
      // =====================================

      const totalOrders =
        await Order.countDocuments();

      // =====================================
      // GET ORDERS FOR REVENUE
      // =====================================

      const orders = await Order.find(
        {},
        "total status"
      );

      // =====================================
      // TOTAL REVENUE
      // =====================================

      const totalRevenue = orders.reduce(
        (sum, order) => {
          return (
            sum +
            (Number(order.total) || 0)
          );
        },
        0
      );

      // =====================================
      // ACTIVE / PENDING ORDERS
      // =====================================

      const pendingOrders =
        await Order.countDocuments({
          status: {
            $nin: [
              "Delivered",
              "Cancelled",
            ],
          },
        });

      // =====================================
      // CONSOLE OUTPUT
      // =====================================

      console.log(
        "📊 Admin Stats:",
        {
          totalProducts,
          totalOrders,
          totalRevenue,
          pendingOrders,
        }
      );

      // =====================================
      // SEND RESPONSE
      // =====================================

      res.status(200).json({
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
      });

    } catch (error) {
      console.error(
        "❌ Admin Statistics Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch dashboard statistics.",

        error: error.message,
      });
    }
  }
);

module.exports = router;