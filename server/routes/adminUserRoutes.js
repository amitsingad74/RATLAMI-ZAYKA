const express = require("express");
const User = require("../models/User");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// =========================================
// GET ALL USERS
// =========================================

router.get("/", adminMiddleware, async (req, res) => {
  try {
    const users = await User.find(
      {},
      "-password"
    ).sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error(
      "Admin Users Error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
});

// =========================================
// UPDATE USER ROLE
// =========================================

router.put(
  "/:id/role",
  adminMiddleware,
  async (req, res) => {
    try {
      const { role } = req.body;

      // Only these roles are allowed
      if (
        role !== "user" &&
        role !== "admin"
      ) {
        return res.status(400).json({
          message:
            "Invalid role. Use user or admin.",
        });
      }

      const user = await User.findById(
        req.params.id
      );

      if (!user) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      // Prevent admin from removing own admin access
      if (
        user._id.toString() ===
          req.user._id.toString() &&
        role !== "admin"
      ) {
        return res.status(400).json({
          message:
            "You cannot remove your own admin access.",
        });
      }

      user.role = role;

      await user.save();

      res.status(200).json({
        message:
          "User role updated successfully.",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error(
        "Update User Role Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update user role.",
        error: error.message,
      });
    }
  }
);

// =========================================
// DELETE USER
// =========================================

router.delete(
  "/:id",
  adminMiddleware,
  async (req, res) => {
    try {
      // Prevent admin from deleting own account
      if (
        req.params.id ===
        req.user._id.toString()
      ) {
        return res.status(400).json({
          message:
            "You cannot delete your own admin account.",
        });
      }

      const user = await User.findById(
        req.params.id
      );

      if (!user) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      await User.findByIdAndDelete(
        req.params.id
      );

      res.status(200).json({
        message:
          "User deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete User Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete user.",
        error: error.message,
      });
    }
  }
);

module.exports = router;