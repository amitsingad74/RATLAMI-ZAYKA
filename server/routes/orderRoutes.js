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

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized. Please login.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User not found.",
      });
    }

    req.user = user;

    next();

  } catch (error) {

    console.error(
      "Authentication Error:",
      error.message
    );

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
      total,
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
        message:
          "Order must contain at least one product.",
      });

    }


    // ===============================
    // VALIDATE CUSTOMER
    // ===============================

    if (
      !customer ||
      !customer.name ||
      !customer.phone ||
      !customer.address ||
      !customer.city ||
      !customer.pincode
    ) {

      return res.status(400).json({
        message:
          "Complete customer details are required.",
      });

    }


    // ===============================
    // VALIDATE PAYMENT
    // ===============================

    if (
      !payment ||
      !payment.razorpayOrderId ||
      !payment.razorpayPaymentId
    ) {

      return res.status(400).json({
        message:
          "Valid payment details are required.",
      });

    }


    // ===============================
    // FIND VERIFIED PAYMENT
    // ===============================

    const paymentRecord =
      await Payment.findOne({

        razorpayOrderId:
          payment.razorpayOrderId,

        razorpayPaymentId:
          payment.razorpayPaymentId,

        user:
          req.user._id,

        verified: true,

        status: "verified",

        used: false,

      });


    if (!paymentRecord) {

      return res.status(400).json({
        message:
          "Payment is not verified.",
      });

    }


    // ===============================
    // START TRANSACTION
    // ===============================

    session.startTransaction();


    const orderItems = [];

    let calculatedTotal = 0;


    // ===============================
    // CHECK EACH PRODUCT + STOCK
    // ===============================

    for (const item of items) {


      // ===============================
      // VALIDATE PRODUCT ID
      // ===============================

      if (
        !item._id ||
        !mongoose.Types.ObjectId.isValid(
          item._id
        )
      ) {

        throw new Error(
          "Invalid product ID."
        );

      }


      // ===============================
      // VALIDATE QUANTITY
      // ===============================

      const quantity =
        Number(item.quantity);


      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {

        throw new Error(
          `Invalid quantity for ${
            item.name || "product"
          }.`
        );

      }


      // ===============================
      // FIND PRODUCT
      // ===============================

      const product =
        await Product.findById(
          item._id
        ).session(session);


      if (!product) {

        throw new Error(
          `${
            item.name || "Product"
          } is no longer available.`
        );

      }


      // ===============================
      // CHECK STOCK
      // ===============================

      const currentStock =
        Number(product.stock || 0);


      if (
        currentStock < quantity
      ) {

        throw new Error(
          `Not enough stock for "${product.name}". Available stock: ${currentStock}, requested: ${quantity}.`
        );

      }


      // ===============================
      // REDUCE STOCK
      // ===============================

      product.stock =
        currentStock - quantity;


      await product.save({
        session,
      });


      // ===============================
      // USE DATABASE PRODUCT PRICE
      // ===============================

      const productPrice =
        Number(product.price) || 0;


      calculatedTotal +=
        productPrice * quantity;


      // ===============================
      // CREATE ORDER ITEM
      // ===============================

      orderItems.push({

        product:
          product._id,

        name:
          product.name,

        price:
          product.price,

        weight:
          product.weight || "",

        quantity,

        image:
          product.image || "",

      });

    }


    // ===============================
    // VERIFY PAYMENT AMOUNT
    // ===============================

    if (
      Number(paymentRecord.amount) !==
      Number(calculatedTotal)
    ) {

      throw new Error(
        "Payment amount does not match order total."
      );

    }


    // ===============================
    // CREATE ORDER
    // ===============================

    const order =
      await Order.create(
        [
          {

            user:
              req.user._id,

            items:
              orderItems,

            total:
              calculatedTotal,

            status:
              "Order Placed",


            // ===============================
            // PAYMENT INFORMATION
            // ===============================

            payment: {

              method:
                paymentRecord.method,

              status:
                "Paid",

              razorpayOrderId:
                paymentRecord.razorpayOrderId,

              razorpayPaymentId:
                paymentRecord.razorpayPaymentId,

            },


            // ===============================
            // CUSTOMER INFORMATION
            // ===============================

            customer: {

              ...customer,

              // Use checkout email if provided.
              // Otherwise use logged-in user's email.

              email:
                customer.email ||
                req.user.email,

            },

          },
        ],
        {
          session,
        }
      );


    // ===============================
    // COMMIT TRANSACTION
    // ===============================

    await session.commitTransaction();


    // ===============================
    // MARK PAYMENT AS USED
    // ===============================

    paymentRecord.used = true;

    await paymentRecord.save();


    // ===============================
    // SUCCESS RESPONSE
    // ===============================

    res.status(201).json({

      message:
        "Order placed successfully!",

      order:
        order[0],

    });


  } catch (error) {


    // ===============================
    // ROLLBACK
    // ===============================

    if (
      session.inTransaction()
    ) {

      await session.abortTransaction();

    }


    console.error(
      "Create Order Error:",
      error.message
    );


    // ===============================
    // VALIDATION / STOCK ERRORS
    // ===============================

    if (
      error.message.includes(
        "Not enough stock"
      ) ||
      error.message.includes(
        "no longer available"
      ) ||
      error.message.includes(
        "Invalid product"
      ) ||
      error.message.includes(
        "Invalid quantity"
      ) ||
      error.message.includes(
        "Payment amount does not match"
      )
    ) {

      return res.status(400).json({
        message:
          error.message,
      });

    }


    // ===============================
    // SERVER ERROR
    // ===============================

    res.status(500).json({

      message:
        "Failed to create order.",

      error:
        error.message,

    });

  } finally {


    // ===============================
    // END SESSION
    // ===============================

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

      const orders =
        await Order.find({

          user:
            req.user._id,

        })
          .populate(
            "items.product"
          )
          .sort({
            createdAt: -1,
          });


      res.status(200).json(
        orders
      );


    } catch (error) {

      console.error(
        "Get Orders Error:",
        error
      );

      res.status(500).json({

        message:
          "Failed to fetch orders.",

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

          message:
            "Invalid order ID.",

        });

      }


      // ===============================
      // FIND USER'S ORDER
      // ===============================

      const order =
        await Order.findOne({

          _id:
            req.params.id,

          user:
            req.user._id,

        })
          .populate(
            "items.product"
          );


      if (!order) {

        return res.status(404).json({

          message:
            "Order not found.",

        });

      }


      res.status(200).json(
        order
      );


    } catch (error) {

      console.error(
        "Get Order Error:",
        error
      );

      res.status(500).json({

        message:
          "Failed to fetch order.",

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

    const session =
      await mongoose.startSession();

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
          message:
            "Invalid order ID.",
        });
      }


      // ===============================
      // FIND USER'S ORDER
      // ===============================

      const order =
        await Order.findOne({
          _id: req.params.id,
          user: req.user._id,
        }).populate(
          "items.product"
        );


      if (!order) {
        return res.status(404).json({
          message:
            "Order not found.",
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
        !cancellableStatuses.includes(
          order.status
        )
      ) {
        return res.status(400).json({
          message:
            "This order can no longer be cancelled.",
        });
      }


      // ===============================
      // FIND PAYMENT
      // ===============================

      const paymentRecord =
        await Payment.findOne({
          razorpayOrderId:
            order.payment
              ?.razorpayOrderId,

          razorpayPaymentId:
            order.payment
              ?.razorpayPaymentId,

          user: req.user._id,
        });


      if (!paymentRecord) {
        return res.status(400).json({
          message:
            "Payment record not found.",
        });
      }


      // ===============================
      // CHECK ALREADY REFUNDED
      // ===============================

      if (
        paymentRecord.status ===
        "refunded" ||
        paymentRecord.refundStatus ===
        "created" ||
        paymentRecord.refundStatus ===
        "processed"
      ) {
        return res.status(400).json({
          message:
            "This payment has already been refunded.",
        });
      }


      // ===============================
      // CHECK PAYMENT STATUS
      // ===============================

      if (
        paymentRecord.status !==
        "verified"
      ) {
        return res.status(400).json({
          message:
            "Only verified payments can be refunded.",
        });
      }


      if (
        !paymentRecord
          .razorpayPaymentId
      ) {
        return res.status(400).json({
          message:
            "Razorpay payment ID not found.",
        });
      }


      // ===============================
      // RAZORPAY INSTANCE
      // ===============================

      const razorpay =
        new Razorpay({
          key_id:
            process.env.RAZORPAY_KEY_ID,

          key_secret:
            process.env.RAZORPAY_KEY_SECRET,
        });


      // ===============================
      // CREATE RAZORPAY REFUND
      // ===============================

      const refund =
        await razorpay.payments.refund(
          paymentRecord
            .razorpayPaymentId,
          {
            amount:
              Math.round(
                Number(
                  paymentRecord.amount
                ) * 100
              ),

            notes: {
              reason:
                "Customer cancelled order",

              orderId:
                order._id.toString(),
            },
          }
        );


      // ===============================
      // START TRANSACTION
      // ===============================

      session.startTransaction();


      // ===============================
      // RESTORE PRODUCT STOCK
      // ===============================

      for (
        const item of order.items
      ) {

        if (!item.product) {
          throw new Error(
            `Product not found for "${item.name}".`
          );
        }


        const product =
          await Product.findById(
            item.product._id
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

      order.status =
        "Cancelled";


      await order.save({
        session,
      });


      // ===============================
      // UPDATE PAYMENT
      // ===============================

      paymentRecord.status =
        "refunded";

      paymentRecord.refundId =
        refund.id || "";

      paymentRecord.refundStatus =
        refund.status ===
        "processed"
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

        order,

        refund: {
          id:
            refund.id,

          status:
            refund.status,
        },

      });

    } catch (error) {


      // ===============================
      // ROLLBACK
      // ===============================

      if (
        session.inTransaction()
      ) {
        await session.abortTransaction();
      }


      console.error(
        "Cancel Order Error:",
        error
      );


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


      return res.status(500).json({

        message:
          "Failed to cancel order and process refund.",

        error:
          error.message,

      });

    } finally {

      // ===============================
      // END SESSION
      // ===============================

      await session.endSession();

    }
  }
);


module.exports = router;