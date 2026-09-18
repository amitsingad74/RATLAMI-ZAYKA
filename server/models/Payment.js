const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // ===============================
    // USER
    // ===============================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ===============================
    // RAZORPAY DETAILS
    // ===============================

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    // ===============================
    // PAYMENT INFORMATION
    // ===============================

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    method: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "created",
        "verified",
        "failed",
        "refunded",
      ],
      default: "created",
    },

    verified: {
      type: Boolean,
      default: false,
    },

    // ===============================
    // ORDER USAGE
    // ===============================

    used: {
      type: Boolean,
      default: false,
    },
    webhookEvents: {
  type: [String],
  default: [],
},

    // ===============================
    // REFUND INFORMATION
    // ===============================

    refundId: {
      type: String,
      default: "",
    },

    refundStatus: {
      type: String,
      enum: [
        "",
        "created",
        "processed",
        "failed",
      ],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Payment",
  paymentSchema
);