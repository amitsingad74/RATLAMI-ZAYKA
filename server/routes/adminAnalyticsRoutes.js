const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// =========================================
// GET ADMIN ANALYTICS
// =========================================

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
        startDate.getDate() - 6
      );
      startDate.setHours(0, 0, 0, 0);
    }

    if (range === "30days") {
      startDate = new Date();
      startDate.setDate(
        startDate.getDate() - 29
      );
      startDate.setHours(0, 0, 0, 0);
    }

    // =========================================
    // PRODUCT COUNT
    // =========================================

    const totalProducts =
      await Product.countDocuments();

    // =========================================
    // ORDER QUERY
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
      createdAt: 1,
    });

    // =========================================
    // TOTAL ORDERS
    // =========================================

    const totalOrders = orders.length;

    // =========================================
    // REVENUE
    // =========================================
    // Cancelled orders are excluded because
    // cancelled orders are refunded.
    // =========================================

    const validRevenueOrders =
      orders.filter(
        (order) =>
          order.status !== "Cancelled"
      );

    const totalRevenue =
      validRevenueOrders.reduce(
        (sum, order) =>
          sum +
          (Number(order.total) || 0),
        0
      );

    // =========================================
    // ACTIVE ORDERS
    // =========================================

    const activeOrders =
      orders.filter(
        (order) =>
          order.status !== "Delivered" &&
          order.status !== "Cancelled"
      ).length;

    // =========================================
    // DELIVERED ORDERS
    // =========================================

    const deliveredOrders =
      orders.filter(
        (order) =>
          order.status === "Delivered"
      ).length;

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
    // REVENUE CHART
    // =========================================

    const revenueData = {};

    validRevenueOrders.forEach(
      (order) => {
        const date = new Date(
          order.createdAt
        );

        let label;

        // -------------------------------
        // TODAY → HOURLY
        // -------------------------------

        if (range === "today") {
          const hour =
            date.getHours();

          const period =
            hour >= 12
              ? "PM"
              : "AM";

          const displayHour =
            hour % 12 || 12;

          label = `${displayHour} ${period}`;
        }

        // -------------------------------
        // 7 DAYS / 30 DAYS → DAILY
        // -------------------------------

        else if (
          range === "7days" ||
          range === "30days"
        ) {
          label =
            date.toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "short",
              }
            );
        }

        // -------------------------------
        // ALL TIME → MONTHLY
        // -------------------------------

        else {
          label =
            date.toLocaleDateString(
              "en-IN",
              {
                month: "short",
                year: "numeric",
              }
            );
        }

        if (!revenueData[label]) {
          revenueData[label] = 0;
        }

        revenueData[label] +=
          Number(order.total) || 0;
      }
    );

    // =========================================
    // TOP SELLING PRODUCTS
    // =========================================

    const productSales = {};

    validRevenueOrders.forEach(
      (order) => {
        if (!order.items) return;

        order.items.forEach(
          (item) => {
            const productName =
              item.name ||
              "Unknown Product";

            const quantity =
              Number(
                item.quantity
              ) || 0;

            const price =
              Number(
                item.price
              ) || 0;

            if (
              !productSales[
                productName
              ]
            ) {
              productSales[
                productName
              ] = {
                name: productName,
                quantity: 0,
                revenue: 0,
              };
            }

            productSales[
              productName
            ].quantity += quantity;

            productSales[
              productName
            ].revenue +=
              quantity * price;
          }
        );
      }
    );

    const topSellingProducts =
      Object.values(
        productSales
      )
        .sort(
          (a, b) =>
            b.quantity -
            a.quantity
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

      deliveredOrders,

      orderStatus,

      revenueData,

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