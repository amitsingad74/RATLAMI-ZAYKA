const express = require("express");
const mongoose = require("mongoose");

const ContactMessage = require("../models/ContactMessage");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// =====================================================
// GET ALL CONTACT MESSAGES
// =====================================================

router.get(
  "/",
  adminMiddleware,
  async (req, res) => {
    try {
      const messages = await ContactMessage.find()
        .sort({
          createdAt: -1,
        })
        .lean();

      return res.status(200).json({
        messages,
      });
    } catch (error) {
      console.error(
        "Admin Contact Messages Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Unable to load contact messages.",
      });
    }
  }
);

// =====================================================
// UPDATE CONTACT MESSAGE STATUS
// =====================================================

router.patch(
  "/:id/status",
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid contact message ID.",
        });
      }

      const allowedStatuses = [
        "New",
        "Read",
        "Resolved",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid message status.",
        });
      }

      const message =
        await ContactMessage.findByIdAndUpdate(
          id,
          {
            status,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!message) {
        return res.status(404).json({
          message:
            "Contact message not found.",
        });
      }

      return res.status(200).json({
        message:
          "Contact message status updated successfully.",
        contactMessage: message,
      });
    } catch (error) {
      console.error(
        "Contact Status Update Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Unable to update contact message.",
      });
    }
  }
);

// =====================================================
// DELETE CONTACT MESSAGE
// =====================================================

router.delete(
  "/:id",
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid contact message ID.",
        });
      }

      const message =
        await ContactMessage.findByIdAndDelete(
          id
        );

      if (!message) {
        return res.status(404).json({
          message:
            "Contact message not found.",
        });
      }

      return res.status(200).json({
        message:
          "Contact message deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Contact Message Delete Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Unable to delete contact message.",
      });
    }
  }
);

module.exports = router;