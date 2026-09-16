const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // ===============================
    // STOCK
    // ===============================
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    weight: {
      type: String,
      required: true,
    },

    emoji: {
      type: String,
      default: "🍬",
    },

    image: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Product",
  productSchema
);