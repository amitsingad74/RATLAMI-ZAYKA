const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", adminMiddleware, async (req, res) => {
  try {
    // =========================================
    // DATE FILTER
    // =========================================

    const { range = "all" } = req.query;

    let startDate = null;
    const now = new Date();

    if (range === "today") {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
    }

    if (range === "7days") {
      startDate = new Date();
      startDate.setDate(
        startDate.getDate() - 7
      );
    }

    if (range === "30days") {
      startDate = new Date();
      startDate.setDate(
        startDate.getDate() - 30
      );
    }

    // =========================================
    // PRODUCT COUNT
    // =========================================

    const totalProducts =
      await Product.countDocuments();

    // =========================================
    // GET ORDERS
    // =========================================

    const query = {};

    if (startDate) {
      query.createdAt = {
        $gte: startDate,
        $lte: now,
      };
    }

    const orders = await Order.find(
      query,
      "total status createdAt items"
    ).sort({
      createdAt: -1,
    });

    // =========================================
    // TOTAL ORDERS
    // =========================================

    const totalOrders = orders.length;

    // =========================================
    // TOTAL REVENUE
    // =========================================

    const totalRevenue = orders.reduce(
      (sum, order) =>
        sum + (Number(order.total) || 0),
      0
    );

    // =========================================
    // ORDER STATUS
    // =========================================

    const orderStatus = {
      "Order Placed": 0,
      Confirmed: 0,
      Preparing: 0,
      "Out for Delivery": 0,
      Delivered: 0,
      Cancelled: 0,
    };

    orders.forEach((order) => {
      if (
        Object.prototype.hasOwnProperty.call(
          orderStatus,
          order.status
        )
      ) {
        orderStatus[order.status]++;
      }
    });

    // =========================================
    // ACTIVE ORDERS
    // =========================================

    const activeOrders = orders.filter(
      (order) =>
        order.status !== "Delivered" &&
        order.status !== "Cancelled"
    ).length;

    // =========================================
    // MONTHLY REVENUE
    // =========================================

    const monthlyRevenue = {};

    orders.forEach((order) => {
      const date = new Date(order.createdAt);

      const month = date.toLocaleString(
        "en-IN",
        {
          month: "short",
          year: "numeric",
        }
      );

      if (!monthlyRevenue[month]) {
        monthlyRevenue[month] = 0;
      }

      monthlyRevenue[month] +=
        Number(order.total) || 0;
    });

    // =========================================
    // TOP SELLING PRODUCTS
    // =========================================

    const productSales = {};

    orders.forEach((order) => {
      if (!order.items) return;

      order.items.forEach((item) => {
        const productName =
          item.name || "Unknown Product";

        const quantity =
          Number(item.quantity) || 0;

        const price =
          Number(item.price) || 0;

        if (!productSales[productName]) {
          productSales[productName] = {
            name: productName,
            quantity: 0,
            revenue: 0,
          };
        }

        productSales[productName].quantity +=
          quantity;

        productSales[productName].revenue +=
          quantity * price;
      });
    });

    const topSellingProducts =
      Object.values(productSales)
        .sort(
          (a, b) =>
            b.quantity - a.quantity
        )
        .slice(0, 5);

    // =========================================
    // RESPONSE
    // =========================================

    res.status(200).json({
      range,
      totalProducts,
      totalOrders,
      totalRevenue,
      activeOrders,
      orderStatus,
      monthlyRevenue,
      topSellingProducts,
    });
  } catch (error) {
    console.error(
      "Admin Analytics Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch analytics.",
      error: error.message,
    });
  }
});

module.exports = router;