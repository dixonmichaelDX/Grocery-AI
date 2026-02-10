const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const Category = require("../models/Category");

// ➕ Add category (admin only)
router.post("/add", verifyToken, upload.single("image"), async (req, res) => {
  const user = req.user;
  const { name } = req.body;
  if (user.role !== "admin") {
    return res.status(403).json({ message: "Only admin can add categories" });
  }

  if (!name || !req.file) {
    return res
      .status(400)
      .json({ message: "Category name and image are required" });
  }

  const baseUrl = "https://dixon-portfolio.vercel.app";
  const image_url = req.file ? `${baseUrl}/uploads/${req.file.filename}` : null;

  try {
    const newCategory = new Category({ name, image_url });
    const savedCategory = await newCategory.save();
    res
      .status(201)
      .json({ message: "Category created", categoryId: savedCategory.id });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Category already exists" });
    }
    res.status(500).json({ message: err.message });
  }
});

// 🌐 Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔄 Update category (admin only)
router.put("/:id", verifyToken, upload.single("image"), async (req, res) => {
  const user = req.user;
  const categoryId = req.params.id;
  const { name } = req.body;

  if (user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admin can update categories" });
  }

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const baseUrl = "https://dixon-portfolio.vercel.app"; // Or dynamically via req
  const newImageUrl = req.file
    ? `${baseUrl}/uploads/${req.file.filename}`
    : null;

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.name = name;
    if (newImageUrl) {
      category.image_url = newImageUrl;
    }

    await category.save();
    res.status(200).json({ message: "Category updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ❌ Delete category (admin only)
router.delete("/:id", verifyToken, async (req, res) => {
  const user = req.user;
  const categoryId = req.params.id;

  if (user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admin can delete categories" });
  }

  try {
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Optional: Get single category by ID
router.get("/:id", async (req, res) => {
  const categoryId = req.params.id;
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
