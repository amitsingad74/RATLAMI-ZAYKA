const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
      maxlength: 20,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: ["New", "Read", "Resolved"],
      default: "New",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ContactMessage",
  contactMessageSchema
);