const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

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

    console.error("Authentication Error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token.",
    });

  }
};


// ===============================
// CREATE ORDER
// ===============================

router.post("/", protect, async (req, res) => {

  try {

    const {
      items,
      total,
      customer,
    } = req.body;


    // Validate items

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Order must contain at least one product.",
      });
    }


    // Validate customer details

    if (
      !customer ||
      !customer.name ||
      !customer.phone ||
      !customer.address ||
      !customer.city ||
      !customer.pincode
    ) {
      return res.status(400).json({
        message: "Complete customer details are required.",
      });
    }


    // Prepare order items

    const orderItems = items.map((item) => ({

      product: item._id,

      name: item.name,

      price: item.price,

      weight: item.weight || "",

      quantity: item.quantity,

      image: item.image || "",

    }));


    // Create order

    const order = await Order.create({

      user: req.user._id,

      items: orderItems,

      total,

      status: "Order Placed",

      customer,

    });


    res.status(201).json({

      message: "Order placed successfully!",

      order,

    });

  } catch (error) {

    console.error("Create Order Error:", error);

    res.status(500).json({

      message: "Failed to create order.",

      error: error.message,

    });

  }

});


// ===============================
// GET MY ORDERS
// ===============================

router.get("/my-orders", protect, async (req, res) => {

  try {

    const orders = await Order.find({
      user: req.user._id,
    })
      .populate("items.product")
      .sort({ createdAt: -1 });


    res.status(200).json(orders);

  } catch (error) {

    console.error("Get Orders Error:", error);

    res.status(500).json({

      message: "Failed to fetch orders.",

    });

  }

});


// ===============================
// GET SINGLE ORDER
// ===============================

router.get("/:id", protect, async (req, res) => {

  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid order ID.",
      });
    }


    const order = await Order.findOne({

      _id: req.params.id,

      user: req.user._id,

    }).populate("items.product");


    if (!order) {

      return res.status(404).json({

        message: "Order not found.",

      });

    }


    res.status(200).json(order);

  } catch (error) {

    console.error("Get Order Error:", error);

    res.status(500).json({

      message: "Failed to fetch order.",

    });

  }

});


module.exports = router;