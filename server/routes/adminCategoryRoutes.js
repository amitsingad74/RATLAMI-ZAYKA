const express = require("express");
const mongoose = require("mongoose");

const Category = require("../models/Category");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// ===============================
// HELPERS
// ===============================

const cleanString = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const isValidNonNegativeInteger = (
  value
) => {
  return (
    Number.isInteger(value) &&
    value >= 0
  );
};

// ===============================
// GET ALL CATEGORIES
// GET /api/admin/categories
// ===============================

router.get(
  "/",
  adminMiddleware,
  async (req, res) => {
    try {
      const categories =
        await Category.find().sort({
          displayOrder: 1,
          createdAt: 1,
        });

      return res.status(200).json(
        categories
      );
    } catch (error) {
      console.error(
        "Admin Get Categories Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to fetch categories.",
      });
    }
  }
);

// ===============================
// ADD CATEGORY
// POST /api/admin/categories
// ===============================

router.post(
  "/",
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        name,
        image,
        description,
        displayOrder,
        active,
      } = req.body;

      const cleanName =
        cleanString(name);

      const cleanImage =
        cleanString(image);

      const cleanDescription =
        cleanString(description);

      // ===============================
      // NAME
      // ===============================

      if (!cleanName) {
        return res.status(400).json({
          message:
            "Category name is required.",
        });
      }

      if (cleanName.length > 100) {
        return res.status(400).json({
          message:
            "Category name is too long.",
        });
      }

      // ===============================
      // DESCRIPTION
      // ===============================

      if (
        cleanDescription.length > 500
      ) {
        return res.status(400).json({
          message:
            "Category description is too long.",
        });
      }

      // ===============================
      // DISPLAY ORDER
      // ===============================

      const orderValue =
        displayOrder === undefined ||
        displayOrder === ""
          ? 0
          : Number(displayOrder);

      if (
        !isValidNonNegativeInteger(
          orderValue
        )
      ) {
        return res.status(400).json({
          message:
            "Display order must be a non-negative whole number.",
        });
      }

      // ===============================
      // ACTIVE
      // ===============================

      const activeValue =
        active === undefined
          ? true
          : active;

      if (
        typeof activeValue !==
        "boolean"
      ) {
        return res.status(400).json({
          message:
            "Active must be true or false.",
        });
      }

      // ===============================
      // DUPLICATE CHECK
      // ===============================

      const existingCategory =
        await Category.findOne({
          name: cleanName,
        });

      if (existingCategory) {
        return res.status(409).json({
          message:
            "A category with this name already exists.",
        });
      }

      // ===============================
      // CREATE
      // ===============================

      const category =
        await Category.create({
          name: cleanName,
          image: cleanImage,
          description:
            cleanDescription,
          displayOrder: orderValue,
          active: activeValue,
        });

      return res.status(201).json({
        message:
          "Category added successfully! 🎉",
        category,
      });
    } catch (error) {
      console.error(
        "Admin Add Category Error:",
        error.message
      );

      if (error.code === 11000) {
        return res.status(409).json({
          message:
            "A category with this name already exists.",
        });
      }

      return res.status(500).json({
        message:
          "Failed to add category.",
      });
    }
  }
);

// ===============================
// UPDATE CATEGORY
// PUT /api/admin/categories/:id
// ===============================

router.put(
  "/:id",
  adminMiddleware,
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid category ID.",
        });
      }

      const category =
        await Category.findById(
          req.params.id
        );

      if (!category) {
        return res.status(404).json({
          message:
            "Category not found.",
        });
      }

      const {
        name,
        image,
        description,
        displayOrder,
        active,
      } = req.body;

      const updateData = {};

      // ===============================
      // NAME
      // ===============================

      if (name !== undefined) {
        const cleanName =
          cleanString(name);

        if (!cleanName) {
          return res.status(400).json({
            message:
              "Category name cannot be empty.",
          });
        }

        if (cleanName.length > 100) {
          return res.status(400).json({
            message:
              "Category name is too long.",
          });
        }

        const duplicate =
          await Category.findOne({
            name: cleanName,
            _id: {
              $ne: req.params.id,
            },
          });

        if (duplicate) {
          return res.status(409).json({
            message:
              "A category with this name already exists.",
          });
        }

        updateData.name =
          cleanName;
      }

      // ===============================
      // IMAGE
      // ===============================

      if (image !== undefined) {
        if (
          typeof image !== "string"
        ) {
          return res.status(400).json({
            message:
              "Category image must be a string.",
          });
        }

        updateData.image =
          image.trim();
      }

      // ===============================
      // DESCRIPTION
      // ===============================

      if (
        description !== undefined
      ) {
        if (
          typeof description !==
          "string"
        ) {
          return res.status(400).json({
            message:
              "Description must be a string.",
          });
        }

        const cleanDescription =
          description.trim();

        if (
          cleanDescription.length >
          500
        ) {
          return res.status(400).json({
            message:
              "Category description is too long.",
          });
        }

        updateData.description =
          cleanDescription;
      }

      // ===============================
      // DISPLAY ORDER
      // ===============================

      if (
        displayOrder !== undefined
      ) {
        const orderValue =
          Number(displayOrder);

        if (
          !isValidNonNegativeInteger(
            orderValue
          )
        ) {
          return res.status(400).json({
            message:
              "Display order must be a non-negative whole number.",
          });
        }

        updateData.displayOrder =
          orderValue;
      }

      // ===============================
      // ACTIVE
      // ===============================

      if (active !== undefined) {
        if (
          typeof active !==
          "boolean"
        ) {
          return res.status(400).json({
            message:
              "Active must be true or false.",
          });
        }

        updateData.active = active;
      }

      // ===============================
      // UPDATE
      // ===============================

      const updatedCategory =
        await Category.findByIdAndUpdate(
          req.params.id,
          updateData,
          {
            new: true,
            runValidators: true,
          }
        );

      return res.status(200).json({
        message:
          "Category updated successfully! ✏️",
        category:
          updatedCategory,
      });
    } catch (error) {
      console.error(
        "Admin Update Category Error:",
        error.message
      );

      if (error.code === 11000) {
        return res.status(409).json({
          message:
            "A category with this name already exists.",
        });
      }

      return res.status(500).json({
        message:
          "Failed to update category.",
      });
    }
  }
);

// ===============================
// DELETE CATEGORY
// DELETE /api/admin/categories/:id
// ===============================

router.delete(
  "/:id",
  adminMiddleware,
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid category ID.",
        });
      }

      const category =
        await Category.findByIdAndDelete(
          req.params.id
        );

      if (!category) {
        return res.status(404).json({
          message:
            "Category not found.",
        });
      }

      return res.status(200).json({
        message:
          "Category deleted successfully! 🗑️",
      });
    } catch (error) {
      console.error(
        "Admin Delete Category Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to delete category.",
      });
    }
  }
);

module.exports = router;