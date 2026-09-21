const express = require("express");

const Product = require("../models/Product");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// ===============================
// VALIDATION HELPERS
// ===============================

const cleanString = (value) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const isValidNonNegativeNumber = (value) => {
  return (
    Number.isFinite(value) &&
    value >= 0
  );
};

const isValidNonNegativeInteger = (value) => {
  return (
    Number.isInteger(value) &&
    value >= 0
  );
};

// ===============================
// GET ALL PRODUCTS
// GET /api/admin/products
// ===============================

router.get(
  "/",
  adminMiddleware,
  async (req, res) => {
    try {
      const products = await Product.find()
        .sort({
          createdAt: -1,
        });

      return res.status(200).json(products);
    } catch (error) {
      console.error(
        "Admin Get Products Error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to fetch products.",
      });
    }
  }
);

// ===============================
// ADD PRODUCT
// POST /api/admin/products
// ===============================

router.post(
  "/",
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        name,
        category,
        price,
        weight,
        emoji,
        image,
        description,
        stock,
      } = req.body;

      // ===============================
      // CLEAN REQUIRED FIELDS
      // ===============================

      const cleanName = cleanString(name);
      const cleanCategory = cleanString(category);
      const cleanWeight = cleanString(weight);
      const cleanDescription =
        cleanString(description);

      // ===============================
      // REQUIRED FIELD VALIDATION
      // ===============================

      if (
        !cleanName ||
        !cleanCategory ||
        price === undefined ||
        price === "" ||
        !cleanWeight ||
        !cleanDescription
      ) {
        return res.status(400).json({
          message:
            "Please fill all required product fields.",
        });
      }

      // ===============================
      // PRICE VALIDATION
      // ===============================

      const priceValue = Number(price);

      if (
        !isValidNonNegativeNumber(priceValue)
      ) {
        return res.status(400).json({
          message:
            "Price must be a valid non-negative number.",
        });
      }

      // ===============================
      // STOCK VALIDATION
      // ===============================

      const stockValue =
        stock === undefined || stock === ""
          ? 0
          : Number(stock);

      if (
        !isValidNonNegativeInteger(stockValue)
      ) {
        return res.status(400).json({
          message:
            "Stock must be a valid non-negative whole number.",
        });
      }

      // ===============================
      // TEXT LENGTH VALIDATION
      // ===============================

      if (cleanName.length > 150) {
        return res.status(400).json({
          message:
            "Product name is too long.",
        });
      }

      if (cleanCategory.length > 100) {
        return res.status(400).json({
          message:
            "Category name is too long.",
        });
      }

      if (cleanWeight.length > 50) {
        return res.status(400).json({
          message:
            "Weight is too long.",
        });
      }

      if (cleanDescription.length > 2000) {
        return res.status(400).json({
          message:
            "Product description is too long.",
        });
      }

      // ===============================
      // CREATE PRODUCT
      // ===============================

      const product = await Product.create({
        name: cleanName,
        category: cleanCategory,
        price: priceValue,
        weight: cleanWeight,
        stock: stockValue,
        emoji:
          typeof emoji === "string" &&
          emoji.trim()
            ? emoji.trim()
            : "🍬",
        image:
          typeof image === "string"
            ? image.trim()
            : "",
        description: cleanDescription,
      });

      return res.status(201).json({
        message:
          "Product added successfully! 🎉",
        product,
      });
    } catch (error) {
      console.error(
        "Admin Add Product Error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to add product.",
      });
    }
  }
);

// ===============================
// UPDATE PRODUCT
// PUT /api/admin/products/:id
// ===============================

router.put(
  "/:id",
  adminMiddleware,
  async (req, res) => {
    try {
      // ===============================
      // VALIDATE PRODUCT ID
      // ===============================

      if (
        !require("mongoose").Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message: "Invalid product ID.",
        });
      }

      const {
        name,
        category,
        price,
        weight,
        emoji,
        image,
        description,
        stock,
      } = req.body;

      // ===============================
      // CHECK PRODUCT EXISTS
      // ===============================

      const existingProduct =
        await Product.findById(
          req.params.id
        );

      if (!existingProduct) {
        return res.status(404).json({
          message: "Product not found.",
        });
      }

      // ===============================
      // BUILD UPDATE DATA
      // ===============================

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
              "Product name cannot be empty.",
          });
        }

        if (cleanName.length > 150) {
          return res.status(400).json({
            message:
              "Product name is too long.",
          });
        }

        updateData.name = cleanName;
      }

      // ===============================
      // CATEGORY
      // ===============================

      if (category !== undefined) {
        const cleanCategory =
          cleanString(category);

        if (!cleanCategory) {
          return res.status(400).json({
            message:
              "Product category cannot be empty.",
          });
        }

        if (cleanCategory.length > 100) {
          return res.status(400).json({
            message:
              "Category name is too long.",
          });
        }

        updateData.category =
          cleanCategory;
      }

      // ===============================
      // PRICE
      // ===============================

      if (
        price !== undefined &&
        price !== ""
      ) {
        const priceValue =
          Number(price);

        if (
          !isValidNonNegativeNumber(
            priceValue
          )
        ) {
          return res.status(400).json({
            message:
              "Price must be a valid non-negative number.",
          });
        }

        updateData.price =
          priceValue;
      }

      // ===============================
      // WEIGHT
      // ===============================

      if (weight !== undefined) {
        const cleanWeight =
          cleanString(weight);

        if (!cleanWeight) {
          return res.status(400).json({
            message:
              "Weight cannot be empty.",
          });
        }

        if (cleanWeight.length > 50) {
          return res.status(400).json({
            message:
              "Weight is too long.",
          });
        }

        updateData.weight =
          cleanWeight;
      }

      // ===============================
      // STOCK
      // ===============================
      // IMPORTANT:
      // If stock is not provided during update,
      // existing stock remains unchanged.

      if (stock !== undefined) {
        if (stock === "") {
          return res.status(400).json({
            message:
              "Stock cannot be empty.",
          });
        }

        const stockValue =
          Number(stock);

        if (
          !isValidNonNegativeInteger(
            stockValue
          )
        ) {
          return res.status(400).json({
            message:
              "Stock must be a valid non-negative whole number.",
          });
        }

        updateData.stock =
          stockValue;
      }

      // ===============================
      // EMOJI
      // ===============================

      if (emoji !== undefined) {
        updateData.emoji =
          typeof emoji === "string" &&
          emoji.trim()
            ? emoji.trim()
            : "🍬";
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
              "Image must be a valid string.",
          });
        }

        updateData.image =
          image.trim();
      }

      // ===============================
      // DESCRIPTION
      // ===============================

      if (description !== undefined) {
        const cleanDescription =
          cleanString(description);

        if (!cleanDescription) {
          return res.status(400).json({
            message:
              "Product description cannot be empty.",
          });
        }

        if (
          cleanDescription.length > 2000
        ) {
          return res.status(400).json({
            message:
              "Product description is too long.",
          });
        }

        updateData.description =
          cleanDescription;
      }

      // ===============================
      // UPDATE PRODUCT
      // ===============================

      const product =
        await Product.findByIdAndUpdate(
          req.params.id,
          updateData,
          {
            new: true,
            runValidators: true,
          }
        );

      if (!product) {
        return res.status(404).json({
          message: "Product not found.",
        });
      }

      return res.status(200).json({
        message:
          "Product updated successfully! ✏️",
        product,
      });
    } catch (error) {
      console.error(
        "Admin Update Product Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to update product.",
      });
    }
  }
);

// ===============================
// DELETE PRODUCT
// DELETE /api/admin/products/:id
// ===============================

router.delete(
  "/:id",
  adminMiddleware,
  async (req, res) => {
    try {
      // ===============================
      // VALIDATE PRODUCT ID
      // ===============================

      if (
        !require("mongoose").Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message: "Invalid product ID.",
        });
      }

      // ===============================
      // DELETE PRODUCT
      // ===============================

      const product =
        await Product.findByIdAndDelete(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          message: "Product not found.",
        });
      }

      return res.status(200).json({
        message:
          "Product deleted successfully! 🗑️",
      });
    } catch (error) {
      console.error(
        "Admin Delete Product Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to delete product.",
      });
    }
  }
);

module.exports = router;