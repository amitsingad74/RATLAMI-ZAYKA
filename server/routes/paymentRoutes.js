// ==========================================
// IMPORT PACKAGES
// ==========================================

const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const Product = require("../models/Product");
const Payment = require("../models/Payment");

const router = express.Router();


// ==========================================
// RAZORPAY INSTANCE
// ==========================================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// ==========================================
// AUTHENTICATION
// ==========================================

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message:
          "Not authorized. Please login.",
      });
    }

    const token =
      authHeader.split(" ")[1];

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    req.user = decoded;

    next();

  } catch (error) {

    console.error(
      "Payment Authentication Error:",
      error.message
    );

    return res.status(401).json({
      message:
        "Invalid or expired token.",
    });
  }
};


// ==========================================
// CREATE RAZORPAY ORDER
// POST /api/payment/create-order
// ==========================================

router.post(
  "/create-order",
  protect,
  async (req, res) => {

    try {

      const { items } = req.body;


      // ====================================
      // VALIDATE ITEMS
      // ====================================

      if (
        !items ||
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          message:
            "Cart must contain at least one product.",
        });
      }


      let calculatedTotal = 0;


      // ====================================
      // CHECK PRODUCTS + STOCK
      // ====================================

      for (const item of items) {

        if (
          !item._id ||
          !mongoose.Types.ObjectId.isValid(
            item._id
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid product ID.",
          });
        }


        const quantity =
          Number(item.quantity);


        if (
          !Number.isInteger(quantity) ||
          quantity <= 0
        ) {
          return res.status(400).json({
            message:
              `Invalid quantity for ${
                item.name || "product"
              }.`,
          });
        }


        const product =
          await Product.findById(
            item._id
          );


        if (!product) {
          return res.status(404).json({
            message:
              "One of the products is no longer available.",
          });
        }


        const stock =
          Number(product.stock || 0);


        if (stock < quantity) {
          return res.status(400).json({
            message:
              `Not enough stock for "${product.name}". Available stock: ${stock}, requested: ${quantity}.`,
          });
        }


        calculatedTotal +=
          Number(product.price) *
          quantity;
      }


      // ====================================
      // VALIDATE TOTAL
      // ====================================

      if (
        !Number.isFinite(
          calculatedTotal
        ) ||
        calculatedTotal <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid payment amount.",
        });
      }


      // ====================================
      // RUPEES -> PAISE
      // ====================================

      const amountInPaise =
        Math.round(
          calculatedTotal * 100
        );


      // ====================================
      // CREATE RAZORPAY ORDER
      // ====================================

      const razorpayOrder =
        await razorpay.orders.create({
          amount:
            amountInPaise,

          currency:
            "INR",

          receipt:
            `rz_${Date.now()}`,
        });


      // ====================================
      // SAVE PAYMENT RECORD
      // ====================================

      await Payment.create({
        user:
          req.user.id,

        razorpayOrderId:
          razorpayOrder.id,

        amount:
          calculatedTotal,

        status:
          "created",

        verified:
          false,

        used:
          false,

        webhookEvents:
          [],
      });


      // ====================================
      // RESPONSE
      // ====================================

      return res.status(200).json({

        message:
          "Razorpay order created successfully.",

        order:
          razorpayOrder,

        amount:
          calculatedTotal,
      });

    } catch (error) {

      console.error(
        "Create Razorpay Order Error:",
        error
      );

      return res.status(500).json({

        message:
          "Failed to create payment order.",

        error:
          error.message,
      });
    }
  }
);


// ==========================================
// VERIFY PAYMENT
// POST /api/payment/verify
// ==========================================

router.post(
  "/verify",
  protect,
  async (req, res) => {

    try {

      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body;


      // ====================================
      // VALIDATE DATA
      // ====================================

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({

          message:
            "Payment verification data is missing.",

          verified:
            false,
        });
      }


      // ====================================
      // FIND PAYMENT RECORD
      // ====================================

      const paymentRecord =
        await Payment.findOne({

          razorpayOrderId:
            razorpay_order_id,

          user:
            req.user.id,
        });


      if (!paymentRecord) {

        return res.status(404).json({

          message:
            "Payment record not found.",

          verified:
            false,
        });
      }


      // ====================================
      // PREVENT PAYMENT REUSE
      // ====================================

      if (
        paymentRecord.used
      ) {

        return res.status(400).json({

          message:
            "This payment has already been used for an order.",

          verified:
            false,
        });
      }


      // ====================================
      // GENERATE CHECKOUT SIGNATURE
      // ====================================

      const generatedSignature =
        crypto
          .createHmac(
            "sha256",
            process.env
              .RAZORPAY_KEY_SECRET
          )
          .update(
            `${razorpay_order_id}|${razorpay_payment_id}`
          )
          .digest("hex");


      // ====================================
      // COMPARE CHECKOUT SIGNATURE
      // ====================================

      const generatedBuffer =
        Buffer.from(
          generatedSignature,
          "utf8"
        );

      const receivedBuffer =
        Buffer.from(
          razorpay_signature,
          "utf8"
        );


      if (
        generatedBuffer.length !==
        receivedBuffer.length
      ) {

        return res.status(400).json({

          message:
            "Payment verification failed.",

          verified:
            false,
        });
      }


      const signatureValid =
        crypto.timingSafeEqual(
          generatedBuffer,
          receivedBuffer
        );


      if (!signatureValid) {

        return res.status(400).json({

          message:
            "Payment verification failed.",

          verified:
            false,
        });
      }


      // ====================================
      // FETCH PAYMENT FROM RAZORPAY
      // ====================================

      const payment =
        await razorpay.payments.fetch(
          razorpay_payment_id
        );


      // ====================================
      // CHECK ORDER ID
      // ====================================

      if (
        payment.order_id !==
        razorpay_order_id
      ) {

        return res.status(400).json({

          message:
            "Payment does not belong to this Razorpay order.",

          verified:
            false,
        });
      }


      // ====================================
      // CHECK CAPTURE STATUS
      // ====================================

      if (
        payment.status !==
        "captured"
      ) {

        return res.status(400).json({

          message:
            `Payment is not captured. Current status: ${payment.status}`,

          verified:
            false,
        });
      }


      // ====================================
      // CHECK AMOUNT
      // ====================================

      const razorpayAmount =
        Number(payment.amount);

      const databaseAmount =
        Math.round(
          Number(
            paymentRecord.amount
          ) * 100
        );


      if (
        razorpayAmount !==
        databaseAmount
      ) {

        return res.status(400).json({

          message:
            "Payment amount does not match the order amount.",

          verified:
            false,
        });
      }


      // ====================================
      // UPDATE PAYMENT RECORD
      // ====================================

      paymentRecord
        .razorpayPaymentId =
        razorpay_payment_id;

      paymentRecord.method =
        payment.method || "";

      paymentRecord.status =
        "verified";

      paymentRecord.verified =
        true;


      await paymentRecord.save();


      // ====================================
      // SUCCESS
      // ====================================

      return res.status(200).json({

        message:
          "Payment verified successfully.",

        verified:
          true,

        razorpayOrderId:
          razorpay_order_id,

        razorpayPaymentId:
          razorpay_payment_id,

        paymentMethod:
          payment.method,

        paymentStatus:
          payment.status,
      });

    } catch (error) {

      console.error(
        "Payment Verification Error:",
        error
      );

      return res.status(500).json({

        message:
          "Payment verification failed.",

        error:
          error.message,
      });
    }
  }
);


// ==========================================
// REFUND PAYMENT
// POST /api/payment/refund
// ==========================================

router.post(
  "/refund",
  protect,
  async (req, res) => {

    try {

      const {
        razorpayPaymentId,
      } = req.body;


      // ====================================
      // VALIDATE PAYMENT ID
      // ====================================

      if (!razorpayPaymentId) {

        return res.status(400).json({

          message:
            "Razorpay payment ID is required.",
        });
      }


      // ====================================
      // FIND PAYMENT RECORD
      // ====================================

      const paymentRecord =
        await Payment.findOne({

          razorpayPaymentId,

          user:
            req.user.id,
        });


      if (!paymentRecord) {

        return res.status(404).json({

          message:
            "Payment record not found.",
        });
      }


      // ====================================
      // CHECK STATUS
      // ====================================

      if (
        paymentRecord.status !==
        "verified"
      ) {

        return res.status(400).json({

          message:
            "Only verified payments can be refunded.",
        });
      }


      // ====================================
      // PREVENT DUPLICATE REFUND
      // ====================================

      if (
        paymentRecord.refundStatus ===
          "created" ||
        paymentRecord.refundStatus ===
          "processed"
      ) {

        return res.status(400).json({

          message:
            "Refund has already been initiated for this payment.",
        });
      }


      // ====================================
      // CREATE REFUND
      // ====================================

      const refund =
        await razorpay
          .payments
          .refund(
            razorpayPaymentId,
            {
              amount:
                Math.round(
                  Number(
                    paymentRecord.amount
                  ) * 100
                ),
            }
          );


      // ====================================
      // SAVE REFUND
      // ====================================

      paymentRecord.status =
        "refunded";

      paymentRecord.refundId =
        refund.id;

      paymentRecord.refundStatus =
        refund.status ===
        "processed"
          ? "processed"
          : "created";


      await paymentRecord.save();


      // ====================================
      // SUCCESS
      // ====================================

      return res.status(200).json({

        message:
          "Payment refund initiated successfully.",

        refundId:
          refund.id,

        refundStatus:
          refund.status,
      });

    } catch (error) {

      console.error(
        "Refund Payment Error:",
        error
      );

      return res.status(500).json({

        message:
          "Failed to refund payment.",

        error:
          error.message,
      });
    }
  }
);


// ==========================================
// RAZORPAY WEBHOOK
// POST /api/payment/webhook
// ==========================================

router.post(
  "/webhook",
  async (req, res) => {

    try {

      console.log(
        "======================================"
      );

      console.log(
        "WEBHOOK RECEIVED"
      );


      // ====================================
      // CHECK RAW BODY
      // ====================================

      if (
        !Buffer.isBuffer(
          req.body
        )
      ) {

        console.error(
          "Webhook body is not a raw Buffer."
        );

        return res.status(400).json({

          message:
            "Webhook raw body is missing.",
        });
      }


      const rawBody =
        req.body;


      console.log(
        "Webhook body type: RAW BUFFER"
      );


      // ====================================
      // WEBHOOK SECRET
      // ====================================

      const webhookSecret =
        process.env
          .RAZORPAY_WEBHOOK_SECRET;


      if (!webhookSecret) {

        console.error(
          "RAZORPAY_WEBHOOK_SECRET is missing."
        );

        return res.status(500).json({

          message:
            "Webhook secret is not configured.",
        });
      }


      // ====================================
      // GET WEBHOOK SIGNATURE
      // ====================================

      const webhookSignature =
        req.headers[
          "x-razorpay-signature"
        ];


      if (!webhookSignature) {

        console.error(
          "Webhook signature is missing."
        );

        return res.status(400).json({

          message:
            "Webhook signature is missing.",
        });
      }


      // ====================================
      // GENERATE SIGNATURE
      // ====================================

      const generatedSignature =
        crypto
          .createHmac(
            "sha256",
            webhookSecret
          )
          .update(
            rawBody
          )
          .digest("hex");


      // ====================================
      // COMPARE SIGNATURE
      // ====================================

      const generatedBuffer =
        Buffer.from(
          generatedSignature,
          "utf8"
        );

      const receivedBuffer =
        Buffer.from(
          webhookSignature,
          "utf8"
        );


      if (
        generatedBuffer.length !==
        receivedBuffer.length
      ) {

        console.error(
          "Invalid Razorpay webhook signature."
        );

        return res.status(400).json({

          message:
            "Invalid webhook signature.",
        });
      }


      const isValid =
        crypto.timingSafeEqual(
          generatedBuffer,
          receivedBuffer
        );


      if (!isValid) {

        console.error(
          "Invalid Razorpay webhook signature."
        );

        return res.status(400).json({

          message:
            "Invalid webhook signature.",
        });
      }


      console.log(
        "✅ Razorpay webhook signature verified."
      );


      // ====================================
      // PARSE JSON
      // ====================================

      let body;

      try {

        body =
          JSON.parse(
            rawBody.toString(
              "utf8"
            )
          );

      } catch (error) {

        console.error(
          "Invalid webhook JSON:",
          error.message
        );

        return res.status(400).json({

          message:
            "Invalid webhook payload.",
        });
      }


      // ====================================
      // EVENT INFORMATION
      // ====================================

      const eventId =
        req.headers[
          "x-razorpay-event-id"
        ];

      const event =
        body.event;


      console.log(
        "Razorpay Webhook Event ID:",
        eventId
      );

      console.log(
        "Razorpay Webhook Event:",
        event
      );

      console.log(
        "Razorpay Webhook Created At:",
        body.created_at
      );


      // ====================================
      // EVENT ID VALIDATION
      // ====================================

      if (!eventId) {

        console.error(
          "Razorpay webhook event ID is missing."
        );

        return res.status(400).json({

          message:
            "Webhook event ID is missing.",
        });
      }


      // ====================================
      // FIND PAYMENT RECORD
      // ====================================

      const paymentEntity =
        body.payload
          ?.payment
          ?.entity;


      const razorpayOrderId =
        paymentEntity?.order_id;


      let paymentRecord = null;


      if (razorpayOrderId) {

        paymentRecord =
          await Payment.findOne({
            razorpayOrderId,
          });
      }


      // ====================================
      // DUPLICATE EVENT CHECK
      // ====================================

      if (paymentRecord) {

        if (
          paymentRecord.webhookEvents &&
          paymentRecord.webhookEvents.includes(
            eventId
          )
        ) {

          console.log(
            "Duplicate webhook detected. Already processed:",
            eventId
          );

          return res.status(200).json({

            message:
              "Webhook already processed.",
          });
        }
      }


      // ====================================
      // PAYMENT CAPTURED
      // ====================================

      if (
        event ===
        "payment.captured"
      ) {

        if (!paymentEntity) {

          return res.status(400).json({

            message:
              "Payment data missing.",
          });
        }


        const razorpayPaymentId =
          paymentEntity.id;

        const orderId =
          paymentEntity.order_id;


        const record =
          await Payment.findOne({
            razorpayOrderId:
              orderId,
          });


        if (!record) {

          console.log(
            "Payment record not found:",
            orderId
          );

        } else {

          if (
            record.status !==
            "refunded"
          ) {

            record
              .razorpayPaymentId =
              razorpayPaymentId;

            record.method =
              paymentEntity.method ||
              "";

            record.status =
              "verified";

            record.verified =
              true;
          }


          // SAVE EVENT ID
          record.webhookEvents =
            record.webhookEvents || [];

          if (
            !record.webhookEvents.includes(
              eventId
            )
          ) {

            record.webhookEvents.push(
              eventId
            );
          }


          await record.save();


          console.log(
            "Payment captured webhook processed:",
            razorpayPaymentId
          );
        }
      }


      // ====================================
      // PAYMENT FAILED
      // ====================================

      else if (
        event ===
        "payment.failed"
      ) {

        if (!paymentEntity) {

          return res.status(400).json({

            message:
              "Payment data missing.",
          });
        }


        const orderId =
          paymentEntity.order_id;


        const record =
          await Payment.findOne({

            razorpayOrderId:
              orderId,
          });


        if (record) {

          if (
            record.status !==
              "verified" &&
            record.status !==
              "refunded"
          ) {

            record
              .razorpayPaymentId =
              paymentEntity.id ||
              "";

            record.method =
              paymentEntity.method ||
              "";

            record.status =
              "failed";

            record.verified =
              false;
          }


          // SAVE EVENT ID
          record.webhookEvents =
            record.webhookEvents || [];

          if (
            !record.webhookEvents.includes(
              eventId
            )
          ) {

            record.webhookEvents.push(
              eventId
            );
          }


          await record.save();


          console.log(
            "Payment failed webhook processed:",
            paymentEntity.id
          );
        }
      }


      // ====================================
      // ORDER PAID
      // ====================================

      else if (
        event ===
        "order.paid"
      ) {

        const orderEntity =
          body.payload
            ?.order
            ?.entity;


        console.log(
          "Razorpay order paid:",
          orderEntity?.id
        );


        // ORDER.PAID DOES NOT ALWAYS
        // HAVE PAYMENT ENTITY.
        //
        // Find payment using order ID.

        const orderId =
          orderEntity?.id;


        const record =
          await Payment.findOne({

            razorpayOrderId:
              orderId,
          });


        if (record) {

          record.webhookEvents =
            record.webhookEvents || [];

          if (
            !record.webhookEvents.includes(
              eventId
            )
          ) {

            record.webhookEvents.push(
              eventId
            );
          }


          await record.save();
        }
      }


      // ====================================
      // REFUND CREATED
      // ====================================

      else if (
        event ===
        "refund.created"
      ) {

        const refundEntity =
          body.payload
            ?.refund
            ?.entity;


        if (refundEntity) {

          const record =
            await Payment.findOne({

              razorpayPaymentId:
                refundEntity.payment_id,
            });


          if (record) {

            record.refundId =
              refundEntity.id;

            record.status =
              "refunded";

            record.refundStatus =
              "created";


            record.webhookEvents =
              record.webhookEvents || [];

            if (
              !record.webhookEvents.includes(
                eventId
              )
            ) {

              record.webhookEvents.push(
                eventId
              );
            }


            await record.save();
          }


          console.log(
            "Refund created:",
            refundEntity.id
          );
        }
      }


      // ====================================
      // REFUND PROCESSED
      // ====================================

      else if (
        event ===
        "refund.processed"
      ) {

        const refundEntity =
          body.payload
            ?.refund
            ?.entity;


        if (refundEntity) {

          const record =
            await Payment.findOne({

              razorpayPaymentId:
                refundEntity.payment_id,
            });


          if (record) {

            record.refundId =
              refundEntity.id;

            record.status =
              "refunded";

            record.refundStatus =
              "processed";


            record.webhookEvents =
              record.webhookEvents || [];

            if (
              !record.webhookEvents.includes(
                eventId
              )
            ) {

              record.webhookEvents.push(
                eventId
              );
            }


            await record.save();
          }


          console.log(
            "Refund processed:",
            refundEntity.id
          );
        }
      }


      // ====================================
      // REFUND FAILED
      // ====================================

      else if (
        event ===
        "refund.failed"
      ) {

        const refundEntity =
          body.payload
            ?.refund
            ?.entity;


        if (refundEntity) {

          const record =
            await Payment.findOne({

              razorpayPaymentId:
                refundEntity.payment_id,
            });


          if (record) {

            record.refundId =
              refundEntity.id;

            record.refundStatus =
              "failed";


            record.webhookEvents =
              record.webhookEvents || [];

            if (
              !record.webhookEvents.includes(
                eventId
              )
            ) {

              record.webhookEvents.push(
                eventId
              );
            }


            await record.save();
          }


          console.log(
            "Refund failed:",
            refundEntity.id
          );
        }
      }


      // ====================================
      // UNHANDLED EVENT
      // ====================================

      else {

        console.log(
          "Unhandled Razorpay webhook event:",
          event
        );
      }


      // ====================================
      // SUCCESS
      // ====================================

      console.log(
        "Webhook processing completed successfully."
      );

      console.log(
        "======================================"
      );


      return res.status(200).json({

        message:
          "Webhook received successfully.",
      });

    } catch (error) {

      console.error(
        "Razorpay Webhook Error:",
        error
      );

      return res.status(500).json({

        message:
          "Webhook processing failed.",
      });
    }
  }
);


// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;