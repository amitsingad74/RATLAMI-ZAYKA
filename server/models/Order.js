const mongoose = require("mongoose");

// ===============================
// ORDER SCHEMA
// ===============================

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },

        weight: {
          type: String,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        image: {
          type: String,
          default: "",
        },
      },
    ],

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    // ===============================
    // ORDER STATUS
    // ===============================

    status: {
      type: String,
      default: "Order Placed",
    },

    // ===============================
    // PAYMENT DETAILS
    // ===============================

    payment: {
      method: {
        type: String,
        default: "UPI",
      },

      status: {
        type: String,
        enum: [
          "Pending",
          "Paid",
          "Failed",
        ],
        default: "Pending",
      },

      razorpayOrderId: {
        type: String,
        default: "",
      },

      razorpayPaymentId: {
        type: String,
        default: "",
      },
    },

    // ===============================
    // CUSTOMER DETAILS
    // ===============================

    customer: {
      name: {
        type: String,
        required: true,
      },

      // ✅ EMAIL ADDED
      email: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      pincode: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);