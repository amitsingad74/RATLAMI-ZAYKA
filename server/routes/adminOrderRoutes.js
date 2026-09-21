const express = require("express");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// =========================================
// ALLOWED ORDER STATUSES
// =========================================

const allowedStatuses = [
  "Order Placed",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

// =========================================
// GET ALL ORDERS - ADMIN ONLY
// =========================================

router.get(
  "/",
  adminMiddleware,
  async (req, res) => {
    try {
      const orders = await Order.find()
        .populate("user", "name email phone")
        .populate("items.product")
        .sort({
          createdAt: -1,
        });

      return res.status(200).json(orders);
    } catch (error) {
      console.error(
        "Admin Orders Error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to fetch orders.",
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
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message: "Invalid order ID.",
        });
      }

      const order = await Order.findById(
        req.params.id
      )
        .populate("user", "name email phone")
        .populate("items.product");

      if (!order) {
        return res.status(404).json({
          message: "Order not found.",
        });
      }

      return res.status(200).json(order);
    } catch (error) {
      console.error(
        "Admin Order Details Error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to fetch order details.",
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
      // =========================================
      // VALIDATE ORDER ID
      // =========================================

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message: "Invalid order ID.",
        });
      }

      // =========================================
      // VALIDATE STATUS
      // =========================================

      const status =
        typeof req.body?.status === "string"
          ? req.body.status.trim()
          : "";

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid order status.",
        });
      }

      // =========================================
      // FIND ORDER
      // =========================================

      const order =
        await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({
          message: "Order not found.",
        });
      }

      // =========================================
      // SAME STATUS
      // =========================================

      if (order.status === status) {
        return res.status(200).json({
          message:
            "Order already has this status.",
          order,
        });
      }

      // =========================================
      // CANCELLED
      // =========================================
      //
      // Keep cancellation/refund handling through
      // the dedicated customer cancellation route.
      //
      // Admin can still update all normal delivery
      // statuses.

      if (status === "Cancelled") {
        return res.status(400).json({
          message:
            "Cancelled orders must go through the refund process.",
        });
      }

      // =========================================
      // PREVENT CHANGING A CANCELLED ORDER
      // =========================================

      if (order.status === "Cancelled") {
        return res.status(400).json({
          message:
            "A cancelled order cannot be updated.",
        });
      }

      // =========================================
      // PREVENT CHANGING A DELIVERED ORDER
      // =========================================

      if (order.status === "Delivered") {
        return res.status(400).json({
          message:
            "A delivered order cannot be changed.",
        });
      }

      // =========================================
      // UPDATE STATUS
      // =========================================

      order.status = status;

      await order.save();

      // =========================================
      // SUCCESS
      // =========================================

      return res.status(200).json({
        message:
          "Order status updated successfully.",
        order,
      });
    } catch (error) {
      console.error(
        "Update Order Status Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to update order status.",
      });
    }
  }
);

module.exports = router;