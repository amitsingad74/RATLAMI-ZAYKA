const express = require("express");

const Category = require("../models/Category");

const router = express.Router();

// ===============================
// GET ACTIVE CATEGORIES
// GET /api/categories
// ===============================

router.get(
  "/",
  async (req, res) => {
    try {
      const categories =
        await Category.find({
          active: true,
        }).sort({
          displayOrder: 1,
          createdAt: 1,
        });

      return res.status(200).json(
        categories
      );
    } catch (error) {
      console.error(
        "Get Categories Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to fetch categories.",
      });
    }
  }
);

module.exports = router;