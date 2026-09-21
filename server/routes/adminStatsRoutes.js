const express = require("express");

const Product = require("../models/Product");
const Order = require("../models/Order");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// =========================================
// GET ADMIN DASHBOARD STATISTICS
// GET /api/admin/stats
// =========================================

router.get(
  "/",
  adminMiddleware,
  async (req, res) => {
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
      // REVENUE
      // =====================================
      // Cancelled orders are excluded because
      // the payment is refunded.

      const revenueResult =
        await Order.aggregate([
          {
            $match: {
              status: {
                $ne: "Cancelled",
              },
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: {
                $sum: "$total",
              },
            },
          },
        ]);

      const totalRevenue =
        revenueResult.length > 0
          ? Number(
              revenueResult[0].totalRevenue
            ) || 0
          : 0;

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
      // RESPONSE
      // =====================================

      return res.status(200).json({
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
      });
    } catch (error) {
      console.error(
        "Admin Statistics Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to fetch dashboard statistics.",
      });
    }
  }
);

module.exports = router;