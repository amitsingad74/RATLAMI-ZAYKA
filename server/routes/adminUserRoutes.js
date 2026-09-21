const express = require("express");
const mongoose = require("mongoose");

const User = require("../models/User");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// =========================================
// GET ALL USERS
// GET /api/admin/users
// =========================================

router.get(
  "/",
  adminMiddleware,
  async (req, res) => {
    try {
      const users = await User.find(
        {},
        "-password"
      ).sort({
        createdAt: -1,
      });

      return res.status(200).json(users);
    } catch (error) {
      console.error(
        "Admin Users Error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to fetch users.",
      });
    }
  }
);

// =========================================
// UPDATE USER ROLE
// PUT /api/admin/users/:id/role
// =========================================

router.put(
  "/:id/role",
  adminMiddleware,
  async (req, res) => {
    try {
      // =========================================
      // VALIDATE USER ID
      // =========================================

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message: "Invalid user ID.",
        });
      }

      // =========================================
      // VALIDATE ROLE
      // =========================================

      const role =
        typeof req.body?.role === "string"
          ? req.body.role.trim()
          : "";

      if (
        role !== "user" &&
        role !== "admin"
      ) {
        return res.status(400).json({
          message:
            "Invalid role. Use user or admin.",
        });
      }

      // =========================================
      // FIND USER
      // =========================================

      const user = await User.findById(
        req.params.id
      );

      if (!user) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      const isCurrentAdmin =
        user._id.toString() ===
        req.user._id.toString();

      // =========================================
      // PREVENT SELF DEMOTION
      // =========================================

      if (
        isCurrentAdmin &&
        role !== "admin"
      ) {
        return res.status(400).json({
          message:
            "You cannot remove your own admin access.",
        });
      }

      // =========================================
      // NO CHANGE
      // =========================================

      if (user.role === role) {
        return res.status(200).json({
          message:
            "User already has this role.",
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            createdAt: user.createdAt,
          },
        });
      }

      // =========================================
      // PREVENT REMOVING LAST ADMIN
      // =========================================

      if (
        user.role === "admin" &&
        role === "user"
      ) {
        const adminCount =
          await User.countDocuments({
            role: "admin",
          });

        if (adminCount <= 1) {
          return res.status(400).json({
            message:
              "Cannot remove the last admin account.",
          });
        }
      }

      // =========================================
      // UPDATE ROLE
      // =========================================

      user.role = role;

      await user.save();

      // =========================================
      // SAFE RESPONSE
      // =========================================

      return res.status(200).json({
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
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to update user role.",
      });
    }
  }
);

// =========================================
// DELETE USER
// DELETE /api/admin/users/:id
// =========================================

router.delete(
  "/:id",
  adminMiddleware,
  async (req, res) => {
    try {
      // =========================================
      // VALIDATE USER ID
      // =========================================

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message: "Invalid user ID.",
        });
      }

      // =========================================
      // PREVENT SELF DELETE
      // =========================================

      if (
        req.params.id ===
        req.user._id.toString()
      ) {
        return res.status(400).json({
          message:
            "You cannot delete your own admin account.",
        });
      }

      // =========================================
      // FIND USER
      // =========================================

      const user = await User.findById(
        req.params.id
      );

      if (!user) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      // =========================================
      // PREVENT DIRECT ADMIN DELETION
      // =========================================
      // Another admin must first be changed to
      // a normal user before that account can
      // be deleted.

      if (user.role === "admin") {
        return res.status(400).json({
          message:
            "Admin accounts cannot be deleted directly. Remove admin role first.",
        });
      }

      // =========================================
      // DELETE USER
      // =========================================

      await User.findByIdAndDelete(
        req.params.id
      );

      // =========================================
      // SUCCESS
      // =========================================

      return res.status(200).json({
        message:
          "User deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete User Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to delete user.",
      });
    }
  }
);

module.exports = router;