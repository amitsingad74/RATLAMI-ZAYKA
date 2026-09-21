const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const authMiddleware =
  require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// VALIDATION HELPERS
// =====================================================

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
};

const isValidPhone = (phone) => {
  return /^\d{10}$/.test(phone);
};

// =====================================================
// REGISTER USER
// POST /api/auth/register
// =====================================================

router.post(
  "/register",
  async (req, res) => {
    try {
      let {
        name,
        email,
        phone,
        password,
      } = req.body;

      // =================================================
      // CHECK DATA TYPES
      // =================================================

      if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof phone !== "string" ||
        typeof password !== "string"
      ) {
        return res.status(400).json({
          message:
            "Invalid registration data.",
        });
      }

      // =================================================
      // CLEAN INPUT
      // =================================================

      name = name.trim();
      email = email
        .trim()
        .toLowerCase();

      phone = phone
        .replace(/\D/g, "");

      // =================================================
      // REQUIRED FIELDS
      // =================================================

      if (
        !name ||
        !email ||
        !phone ||
        !password
      ) {
        return res.status(400).json({
          message:
            "Please fill in all fields.",
        });
      }

      // =================================================
      // NAME VALIDATION
      // =================================================

      if (
        name.length < 2 ||
        name.length > 100
      ) {
        return res.status(400).json({
          message:
            "Name must be between 2 and 100 characters.",
        });
      }

      // =================================================
      // EMAIL VALIDATION
      // =================================================

      if (!isValidEmail(email)) {
        return res.status(400).json({
          message:
            "Please enter a valid email address.",
        });
      }

      // =================================================
      // PHONE VALIDATION
      // =================================================

      if (!isValidPhone(phone)) {
        return res.status(400).json({
          message:
            "Please enter a valid 10-digit phone number.",
        });
      }

      // =================================================
      // PASSWORD VALIDATION
      // =================================================

      if (password.length < 8) {
        return res.status(400).json({
          message:
            "Password must contain at least 8 characters.",
        });
      }

      if (password.length > 128) {
        return res.status(400).json({
          message:
            "Password is too long.",
        });
      }

      // =================================================
      // CHECK EMAIL
      // =================================================

      const existingEmail =
        await User.findOne({
          email,
        });

      if (existingEmail) {
        return res.status(400).json({
          message:
            "Email is already registered.",
        });
      }

      // =================================================
      // CHECK PHONE
      // =================================================

      const existingPhone =
        await User.findOne({
          phone,
        });

      if (existingPhone) {
        return res.status(400).json({
          message:
            "Phone number is already registered.",
        });
      }

      // =================================================
      // HASH PASSWORD
      // =================================================

      const salt =
        await bcrypt.genSalt(10);

      const hashedPassword =
        await bcrypt.hash(
          password,
          salt
        );

      // =================================================
      // CREATE USER
      // =================================================

      const newUser =
        new User({
          name,
          email,
          phone,
          password:
            hashedPassword,
        });

      // =================================================
      // SAVE USER
      // =================================================

      await newUser.save();

      // =================================================
      // SUCCESS RESPONSE
      // =================================================

      return res.status(201).json({
        message:
          "User registered successfully! 🎉",

        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
        },
      });

    } catch (error) {
      console.error(
        "Registration Error:",
        error.message
      );

      // MongoDB duplicate key
      if (error.code === 11000) {
        return res.status(400).json({
          message:
            "Email or phone number is already registered.",
        });
      }

      return res.status(500).json({
        message:
          "Server error. Please try again.",
      });
    }
  }
);

// =====================================================
// LOGIN USER
// POST /api/auth/login
// =====================================================

router.post(
  "/login",
  async (req, res) => {
    try {
      let {
        email,
        password,
      } = req.body;

      // =================================================
      // CHECK DATA TYPES
      // =================================================

      if (
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        return res.status(400).json({
          message:
            "Please enter valid login details.",
        });
      }

      // =================================================
      // CLEAN EMAIL
      // =================================================

      email = email
        .trim()
        .toLowerCase();

      // =================================================
      // REQUIRED FIELDS
      // =================================================

      if (
        !email ||
        !password
      ) {
        return res.status(400).json({
          message:
            "Please enter email and password.",
        });
      }

      // =================================================
      // EMAIL VALIDATION
      // =================================================

      if (!isValidEmail(email)) {
        return res.status(400).json({
          message:
            "Please enter a valid email address.",
        });
      }

      // =================================================
      // FIND USER
      // =================================================

      const user =
        await User.findOne({
          email,
        });

      // =================================================
      // GENERIC LOGIN ERROR
      // =================================================
      //
      // Don't reveal whether the email exists.
      //

      if (!user) {
        return res.status(401).json({
          message:
            "Invalid email or password.",
        });
      }

      // =================================================
      // CHECK PASSWORD
      // =================================================

      const isPasswordCorrect =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!isPasswordCorrect) {
        return res.status(401).json({
          message:
            "Invalid email or password.",
        });
      }

      // =================================================
      // JWT SECRET CHECK
      // =================================================

      if (!process.env.JWT_SECRET) {
        console.error(
          "JWT_SECRET is not configured."
        );

        return res.status(500).json({
          message:
            "Authentication service is not configured.",
        });
      }

      // =================================================
      // GENERATE JWT
      // =================================================

      const token =
        jwt.sign(
          {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
          },

          process.env.JWT_SECRET,

          {
            expiresIn: "7d",
          }
        );

      // =================================================
      // LOGIN SUCCESS
      // =================================================

      return res.status(200).json({
        message:
          "Login successful! 🎉",

        token,

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });

    } catch (error) {
      console.error(
        "Login Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Server error. Please try again.",
      });
    }
  }
);

// =====================================================
// GET CURRENT USER PROFILE
// GET /api/auth/profile
// =====================================================

router.get(
  "/profile",
  authMiddleware,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.id
        ).select("-password");

      if (!user) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }

      return res.status(200).json({
        message:
          "Profile fetched successfully!",

        user,
      });

    } catch (error) {
      console.error(
        "Profile Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Server error.",
      });
    }
  }
);

module.exports = router;