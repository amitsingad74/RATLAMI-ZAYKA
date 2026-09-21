const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const Payment = require("../models/Payment");
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");

const router = express.Router();

// ===============================
// AUTHENTICATION MIDDLEWARE
// ===============================

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      typeof authHeader !== "string" ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "Not authorized. Please login.",
      });
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        message: "Not authorized. Please login.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");
      return res.status(500).json({
        message: "Server configuration error.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User not found.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication Error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

// ===============================
// CREATE ORDER
// POST /api/orders
// ===============================

router.post("/", protect, async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      items,
      customer,
      payment,
    } = req.body;

    // ===============================
    // VALIDATE ITEMS
    // ===============================

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "Order must contain at least one product.",
      });
    }

    // Prevent unnecessarily huge orders
    if (items.length > 50) {
      return res.status(400).json({
        message: "Too many products in one order.",
      });
    }

    // ===============================
    // VALIDATE CUSTOMER
    // ===============================

    if (
      !customer ||
      typeof customer !== "object" ||
      !String(customer.name || "").trim() ||
      !String(customer.phone || "").trim() ||
      !String(customer.address || "").trim() ||
      !String(customer.city || "").trim() ||
      !String(customer.pincode || "").trim()
    ) {
      return res.status(400).json({
        message: "Complete customer details are required.",
      });
    }

    // ===============================
    // VALIDATE PAYMENT
    // ===============================

    if (
      !payment ||
      typeof payment !== "object" ||
      !String(payment.razorpayOrderId || "").trim() ||
      !String(payment.razorpayPaymentId || "").trim()
    ) {
      return res.status(400).json({
        message: "Valid payment details are required.",
      });
    }

    // ===============================
    // START TRANSACTION
    // ===============================

    session.startTransaction();

    // ===============================
    // FIND + LOCK VERIFIED PAYMENT
    // ===============================
    // IMPORTANT:
    // Payment is checked inside the transaction.
    // We later mark it as used inside the same transaction.
    // This prevents the same payment from creating
    // multiple orders.

    const paymentRecord = await Payment.findOne({
      razorpayOrderId: String(payment.razorpayOrderId).trim(),
      razorpayPaymentId: String(payment.razorpayPaymentId).trim(),
      user: req.user._id,
      verified: true,
      status: "verified",
      used: false,
    }).session(session);

    if (!paymentRecord) {
      throw new Error("Payment is not verified or has already been used.");
    }

    // ===============================
    // PROCESS PRODUCTS
    // ===============================

    const orderItems = [];
    let calculatedTotal = 0;

    // Prevent duplicate product IDs inside one order.
    const requestedProductIds = new Set();

    for (const item of items) {
      // ===============================
      // VALIDATE PRODUCT ID
      // ===============================

      if (
        !item?._id ||
        !mongoose.Types.ObjectId.isValid(item._id)
      ) {
        throw new Error("Invalid product ID.");
      }

      const productId = String(item._id);

      if (requestedProductIds.has(productId)) {
        throw new Error(
          "Duplicate product detected in the order."
        );
      }

      requestedProductIds.add(productId);

      // ===============================
      // VALIDATE QUANTITY
      // ===============================

      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0 ||
        quantity > 100
      ) {
        throw new Error(
          `Invalid quantity for ${item.name || "product"}.`
        );
      }

      // ===============================
      // FIND PRODUCT
      // ===============================

      const product = await Product.findById(item._id).session(
        session
      );

      if (!product) {
        throw new Error(
          `${item.name || "Product"} is no longer available.`
        );
      }

      // ===============================
      // CHECK STOCK
      // ===============================

      const currentStock = Number(product.stock || 0);

      if (currentStock < quantity) {
        throw new Error(
          `Not enough stock for "${product.name}". Available stock: ${currentStock}, requested: ${quantity}.`
        );
      }

      // ===============================
      // REDUCE STOCK
      // ===============================

      product.stock = currentStock - quantity;

      await product.save({
        session,
      });

      // ===============================
      // USE DATABASE PRICE
      // ===============================

      const productPrice = Number(product.price);

      if (!Number.isFinite(productPrice) || productPrice < 0) {
        throw new Error(
          `Invalid price configured for "${product.name}".`
        );
      }

      calculatedTotal += productPrice * quantity;

      // ===============================
      // CREATE ORDER ITEM
      // ===============================

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        weight: product.weight || "",
        quantity,
        image: product.image || "",
      });
    }

    // ===============================
    // VERIFY PAYMENT AMOUNT
    // ===============================
    // Client-supplied total is deliberately ignored.
    // The server calculates the total from DB prices.

    const paymentAmount = Number(paymentRecord.amount);

    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount !== calculatedTotal
    ) {
      throw new Error(
        "Payment amount does not match order total."
      );
    }

    // ===============================
    // CREATE ORDER
    // ===============================

    const order = await Order.create(
      [
        {
          user: req.user._id,

          items: orderItems,

          total: calculatedTotal,

          status: "Order Placed",

          // ===============================
          // PAYMENT INFORMATION
          // ===============================

          payment: {
            method: paymentRecord.method,
            status: "Paid",
            razorpayOrderId:
              paymentRecord.razorpayOrderId,
            razorpayPaymentId:
              paymentRecord.razorpayPaymentId,
          },

          // ===============================
          // CUSTOMER INFORMATION
          // ===============================

          customer: {
            name: String(customer.name).trim(),
            email:
              String(customer.email || "").trim() ||
              req.user.email,
            phone: String(customer.phone).trim(),
            address: String(customer.address).trim(),
            city: String(customer.city).trim(),
            pincode: String(customer.pincode).trim(),
          },
        },
      ],
      {
        session,
      }
    );

    // ===============================
    // MARK PAYMENT AS USED
    // ===============================
    // IMPORTANT:
    // This now happens BEFORE transaction commit.
    // Therefore order creation + payment consumption
    // succeed or fail together.

    paymentRecord.used = true;

    await paymentRecord.save({
      session,
    });

    // ===============================
    // COMMIT TRANSACTION
    // ===============================

    await session.commitTransaction();

    // ===============================
    // SUCCESS RESPONSE
    // ===============================

    return res.status(201).json({
      message: "Order placed successfully!",
      order: order[0],
    });
  } catch (error) {
    // ===============================
    // ROLLBACK
    // ===============================

    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error(
      "Create Order Error:",
      error.message
    );

    // ===============================
    // CLIENT-SAFE ERRORS
    // ===============================

    const safeErrors = [
      "Payment is not verified or has already been used.",
      "Invalid product ID.",
      "Duplicate product detected in the order.",
      "Payment amount does not match order total.",
    ];

    const isStockError =
      error.message?.includes("Not enough stock") ||
      error.message?.includes("no longer available");

    const isQuantityError =
      error.message?.includes("Invalid quantity");

    const isInvalidPriceError =
      error.message?.includes("Invalid price configured");

    if (
      safeErrors.includes(error.message) ||
      isStockError ||
      isQuantityError ||
      isInvalidPriceError
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    // ===============================
    // SERVER ERROR
    // ===============================

    return res.status(500).json({
      message: "Failed to create order.",
    });
  } finally {
    await session.endSession();
  }
});

// ===============================
// GET MY ORDERS
// GET /api/orders/my-orders
// ===============================

router.get(
  "/my-orders",
  protect,
  async (req, res) => {
    try {
      const orders = await Order.find({
        user: req.user._id,
      })
        .populate("items.product")
        .sort({
          createdAt: -1,
        });

      return res.status(200).json(orders);
    } catch (error) {
      console.error(
        "Get Orders Error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to fetch orders.",
      });
    }
  }
);

// ===============================
// GET SINGLE ORDER
// GET /api/orders/:id
// ===============================

router.get(
  "/:id",
  protect,
  async (req, res) => {
    try {
      // ===============================
      // VALIDATE ORDER ID
      // ===============================

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message: "Invalid order ID.",
        });
      }

      // ===============================
      // FIND USER'S ORDER
      // ===============================

      const order = await Order.findOne({
        _id: req.params.id,
        user: req.user._id,
      }).populate("items.product");

      if (!order) {
        return res.status(404).json({
          message: "Order not found.",
        });
      }

      return res.status(200).json(order);
    } catch (error) {
      console.error(
        "Get Order Error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to fetch order.",
      });
    }
  }
);

// ===============================
// CANCEL ORDER + REFUND
// POST /api/orders/:id/cancel
// ===============================

router.post(
  "/:id/cancel",
  protect,
  async (req, res) => {
    const session = await mongoose.startSession();

    let refundCreated = false;
    let paymentRecord = null;

    try {
      // ===============================
      // VALIDATE ORDER ID
      // ===============================

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message: "Invalid order ID.",
        });
      }

      // ===============================
      // FIND USER'S ORDER
      // ===============================

      const order = await Order.findOne({
        _id: req.params.id,
        user: req.user._id,
      }).populate("items.product");

      if (!order) {
        return res.status(404).json({
          message: "Order not found.",
        });
      }

      // ===============================
      // CHECK ORDER STATUS
      // ===============================

      const cancellableStatuses = [
        "Order Placed",
        "Confirmed",
        "Preparing",
      ];

      if (
        !cancellableStatuses.includes(order.status)
      ) {
        return res.status(400).json({
          message:
            "This order can no longer be cancelled.",
        });
      }

      // ===============================
      // FIND PAYMENT
      // ===============================

      paymentRecord = await Payment.findOne({
        razorpayOrderId:
          order.payment?.razorpayOrderId,

        razorpayPaymentId:
          order.payment?.razorpayPaymentId,

        user: req.user._id,
      });

      if (!paymentRecord) {
        return res.status(400).json({
          message: "Payment record not found.",
        });
      }

      // ===============================
      // CHECK REFUND STATUS
      // ===============================

      if (
        paymentRecord.status === "refunded" ||
        paymentRecord.refundStatus === "created" ||
        paymentRecord.refundStatus === "processed"
      ) {
        return res.status(400).json({
          message:
            "This payment has already been refunded or a refund is already in progress.",
        });
      }

      // ===============================
      // CHECK PAYMENT STATUS
      // ===============================

      if (paymentRecord.status !== "verified") {
        return res.status(400).json({
          message:
            "Only verified payments can be refunded.",
        });
      }

      if (!paymentRecord.razorpayPaymentId) {
        return res.status(400).json({
          message:
            "Razorpay payment ID not found.",
        });
      }

      if (
        !process.env.RAZORPAY_KEY_ID ||
        !process.env.RAZORPAY_KEY_SECRET
      ) {
        console.error(
          "Razorpay credentials are not configured."
        );

        return res.status(500).json({
          message:
            "Payment service is not configured.",
        });
      }

      // ===============================
      // CLAIM REFUND
      // ===============================
      // This prevents two simultaneous cancel requests
      // from both creating a Razorpay refund.

      const refundClaim = await Payment.findOneAndUpdate(
        {
          _id: paymentRecord._id,
          user: req.user._id,
          status: "verified",
          refundStatus: "",
        },
        {
          $set: {
            refundStatus: "created",
          },
        },
        {
          new: true,
        }
      );

      if (!refundClaim) {
        return res.status(400).json({
          message:
            "A refund is already being processed for this payment.",
        });
      }

      paymentRecord = refundClaim;

      // ===============================
      // RAZORPAY INSTANCE
      // ===============================

      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      // ===============================
      // CREATE RAZORPAY REFUND
      // ===============================

      const refund =
        await razorpay.payments.refund(
          paymentRecord.razorpayPaymentId,
          {
            amount: Math.round(
              Number(paymentRecord.amount) * 100
            ),

            notes: {
              reason:
                "Customer cancelled order",

              orderId:
                order._id.toString(),
            },
          }
        );

      refundCreated = true;

      // ===============================
      // START TRANSACTION
      // ===============================

      session.startTransaction();

      // ===============================
      // RE-CHECK ORDER
      // ===============================
      // Prevent processing a stale order after
      // another request changed it.

      const freshOrder = await Order.findOne({
        _id: order._id,
        user: req.user._id,
      }).session(session);

      if (!freshOrder) {
        throw new Error("Order not found.");
      }

      if (
        !cancellableStatuses.includes(
          freshOrder.status
        )
      ) {
        throw new Error(
          "This order can no longer be cancelled."
        );
      }

      // ===============================
      // RESTORE PRODUCT STOCK
      // ===============================

      for (const item of freshOrder.items) {
        if (!item.product) {
          throw new Error(
            `Product not found for "${item.name}".`
          );
        }

        const product =
          await Product.findById(
            item.product._id || item.product
          ).session(session);

        if (!product) {
          throw new Error(
            `Product "${item.name}" no longer exists.`
          );
        }

        product.stock =
          Number(product.stock || 0) +
          Number(item.quantity);

        await product.save({
          session,
        });
      }

      // ===============================
      // UPDATE ORDER
      // ===============================

      freshOrder.status = "Cancelled";

      await freshOrder.save({
        session,
      });

      // ===============================
      // UPDATE PAYMENT
      // ===============================

      paymentRecord.status = "refunded";

      paymentRecord.refundId =
        refund.id || "";

      paymentRecord.refundStatus =
        refund.status === "processed"
          ? "processed"
          : "created";

      await paymentRecord.save({
        session,
      });

      // ===============================
      // COMMIT
      // ===============================

      await session.commitTransaction();

      // ===============================
      // SUCCESS
      // ===============================

      return res.status(200).json({
        message:
          "Order cancelled and refund initiated successfully.",

        order: freshOrder,

        refund: {
          id: refund.id,
          status: refund.status,
        },
      });
    } catch (error) {
      // ===============================
      // ROLLBACK DATABASE
      // ===============================

      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      console.error(
        "Cancel Order Error:",
        error.message
      );

      // ===============================
      // IMPORTANT REFUND STATE
      // ===============================
      // If Razorpay refund was not created,
      // release the refund claim so the user can retry.

      if (
        paymentRecord &&
        !refundCreated &&
        paymentRecord.refundStatus === "created"
      ) {
        try {
          await Payment.updateOne(
            {
              _id: paymentRecord._id,
              refundStatus: "created",
            },
            {
              $set: {
                refundStatus: "",
              },
            }
          );
        } catch (resetError) {
          console.error(
            "Failed to reset refund claim:",
            resetError.message
          );
        }
      }

      // ===============================
      // RAZORPAY ERROR
      // ===============================

      if (
        error.error &&
        error.error.description
      ) {
        return res.status(400).json({
          message:
            error.error.description,
        });
      }

      // ===============================
      // SAFE CLIENT ERROR
      // ===============================

      if (
        error.message ===
          "Order not found." ||
        error.message ===
          "This order can no longer be cancelled."
      ) {
        return res.status(400).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message:
          "Failed to cancel order and process refund.",
      });
    } finally {
      await session.endSession();
    }
  }
);

module.exports = router;