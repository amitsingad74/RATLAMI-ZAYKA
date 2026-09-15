const mongoose = require("mongoose");


// ===============================
// PRODUCT SCHEMA
// ===============================

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


// ===============================
// EXPORT MODEL
// ===============================

module.exports = mongoose.model(
  "Product",
  productSchema
);