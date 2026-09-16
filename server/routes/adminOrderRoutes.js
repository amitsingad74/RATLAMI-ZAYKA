const express = require("express");
const Order = require("../models/Order");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// =========================================
// GET ALL ORDERS - ADMIN ONLY
// =========================================

router.get(
  "/",
  adminMiddleware,
  async (req, res) => {
    try {
      const orders = await Order.find()
        .populate(
          "user",
          "name email phone"
        )
        .populate("items.product")
        .sort({ createdAt: -1 });

      res.status(200).json(orders);
    } catch (error) {
      console.error(
        "Admin Orders Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch orders.",
      });
    }
  }
);

// =========================================
// GET SINGLE ORDER DETAILS - ADMIN ONLY
// =========================================

router.get(
  "/:id",
  adminMiddleware,
  async (req, res) => {
    try {
      const order = await Order.findById(
        req.params.id
      )
        .populate(
          "user",
          "name email phone"
        )
        .populate("items.product");

      if (!order) {
        return res.status(404).json({
          message: "Order not found.",
        });
      }

      res.status(200).json(order);
    } catch (error) {
      console.error(
        "Admin Order Details Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch order details.",
      });
    }
  }
);

// =========================================
// UPDATE ORDER STATUS - ADMIN ONLY
// =========================================

router.put(
  "/:id/status",
  adminMiddleware,
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatuses = [
        "Order Placed",
        "Confirmed",
        "Preparing",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid order status.",
        });
      }

      const order =
        await Order.findByIdAndUpdate(
          req.params.id,
          {
            status: status,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!order) {
        return res.status(404).json({
          message: "Order not found.",
        });
      }

      res.status(200).json({
        message:
          "Order status updated successfully.",
        order,
      });
    } catch (error) {
      console.error(
        "Update Order Status Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update order status.",
      });
    }
  }
);

module.exports = router;