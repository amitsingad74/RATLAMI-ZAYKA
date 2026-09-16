const express = require("express");

const Product = require("../models/Product");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// ===============================
// GET ALL PRODUCTS
// GET /api/admin/products
// ===============================

router.get("/", adminMiddleware, async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    res.status(200).json(products);
  } catch (error) {
    console.error(
      "Admin Get Products Error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to fetch products.",
    });
  }
});

// ===============================
// ADD PRODUCT
// POST /api/admin/products
// ===============================

router.post("/", adminMiddleware, async (req, res) => {
  try {
    console.log("ADD PRODUCT BODY:", req.body);

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

    if (
      !name ||
      !category ||
      price === undefined ||
      !weight ||
      !description
    ) {
      return res.status(400).json({
        message:
          "Please fill all required product fields.",
      });
    }

    const stockValue =
      stock === undefined || stock === ""
        ? 0
        : Number(stock);

    if (
      Number.isNaN(stockValue) ||
      stockValue < 0
    ) {
      return res.status(400).json({
        message:
          "Stock quantity cannot be negative.",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      weight: weight.trim(),
      stock: stockValue,
      emoji: emoji || "🍬",
      image: image || "",
      description: description.trim(),
    });

    console.log(
      "PRODUCT CREATED WITH STOCK:",
      product.stock
    );

    res.status(201).json({
      message:
        "Product added successfully! 🎉",
      product,
    });
  } catch (error) {
    console.error(
      "Admin Add Product Error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to add product.",
    });
  }
});

// ===============================
// UPDATE PRODUCT
// PUT /api/admin/products/:id
// ===============================

router.put(
  "/:id",
  adminMiddleware,
  async (req, res) => {
    try {
      console.log(
        "================================="
      );

      console.log(
        "UPDATE PRODUCT BODY:",
        req.body
      );

      console.log(
        "UPDATE PRODUCT ID:",
        req.params.id
      );

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
      // STOCK
      // ===============================

      const stockValue =
        stock === undefined || stock === ""
          ? 0
          : Number(stock);

      console.log(
        "STOCK RECEIVED:",
        stock
      );

      console.log(
        "STOCK VALUE:",
        stockValue
      );

      if (
        Number.isNaN(stockValue) ||
        stockValue < 0
      ) {
        return res.status(400).json({
          message:
            "Stock quantity cannot be negative.",
        });
      }

      // ===============================
      // UPDATE DATA
      // ===============================

      const updateData = {
        name: name?.trim(),
        category: category?.trim(),
        price:
          price !== undefined
            ? Number(price)
            : undefined,
        weight: weight?.trim(),
        stock: stockValue,
        emoji: emoji || "🍬",
        image: image || "",
        description:
          description?.trim(),
      };

      console.log(
        "UPDATE DATA:",
        updateData
      );

      // ===============================
      // UPDATE
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

      // ===============================
      // NOT FOUND
      // ===============================

      if (!product) {
        return res.status(404).json({
          message: "Product not found.",
        });
      }

      console.log(
        "STOCK SAVED IN DATABASE:",
        product.stock
      );

      console.log(
        "================================="
      );

      res.status(200).json({
        message:
          "Product updated successfully! ✏️",
        product,
      });
    } catch (error) {
      console.error(
        "Admin Update Product Error:",
        error.message
      );

      res.status(500).json({
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
      const product =
        await Product.findByIdAndDelete(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          message: "Product not found.",
        });
      }

      res.status(200).json({
        message:
          "Product deleted successfully! 🗑️",
      });
    } catch (error) {
      console.error(
        "Admin Delete Product Error:",
        error.message
      );

      res.status(500).json({
        message:
          "Failed to delete product.",
      });
    }
  }
);

module.exports = router;