const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

const router = express.Router();


// ===============================
// REGISTER USER
// POST /api/auth/register
// ===============================

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // CHECK ALL FIELDS
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        message: "Please fill in all fields.",
      });
    }

    // CHECK IF EMAIL ALREADY EXISTS
    const existingEmail = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email already registered.",
      });
    }

    // CHECK IF PHONE ALREADY EXISTS
    const existingPhone = await User.findOne({
      phone,
    });

    if (existingPhone) {
      return res.status(400).json({
        message: "Phone number already registered.",
      });
    }

    // HASH PASSWORD
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    // CREATE USER
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
    });

    // SAVE USER IN MONGODB
    await newUser.save();

    // SUCCESS RESPONSE
    res.status(201).json({
      message: "User registered successfully! 🎉",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      },
    });

  } catch (error) {

    console.error(
      "Registration Error:",
      error.message
    );

    res.status(500).json({
      message: "Server error. Please try again.",
    });

  }
});


// ===============================
// LOGIN USER
// POST /api/auth/login
// ===============================

router.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    // CHECK ALL FIELDS
    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password.",
      });
    }

    // FIND USER BY EMAIL
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    // USER NOT FOUND
    if (!user) {
      return res.status(400).json({
        message: "User not found. Please register first.",
      });
    }

    // CHECK PASSWORD
    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    // WRONG PASSWORD
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Incorrect password.",
      });
    }

    // LOGIN SUCCESS
    res.status(200).json({
      message: "Login successful! 🎉",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

  } catch (error) {

    console.error(
      "Login Error:",
      error.message
    );

    res.status(500).json({
      message: "Server error. Please try again.",
    });

  }
});


module.exports = router;