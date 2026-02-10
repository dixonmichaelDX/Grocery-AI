const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const SubCategory = require("../models/SubCategory");
const Category = require("../models/Category");

// ➕ Create Subcategory (Admin only)
router.post("/add", verifyToken, upload.single("image"), async (req, res) => {
  const user = req.user;
  const { name, category_id } = req.body;

  if (user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admin can add subcategories" });
  }

  if (!name || !category_id || !req.file) {
    return res
      .status(400)
      .json({ message: "Name, category ID, and image are required" });
  }

  const baseUrl = "https://dixon-portfolio.vercel.app";
  const image_url = req.file ? `${baseUrl}/uploads/${req.file.filename}` : null;

  try {
    const newSubCategory = new SubCategory({
      subcategory_name: name,
      category_id,
      image_url,
    });
    const savedSubCategory = await newSubCategory.save();
    res.status(201).json({
      message: "Subcategory created successfully",
      subcategoryId: savedSubCategory.id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📝 Update Subcategory (Admin only)
router.put("/:id", verifyToken, upload.single("image"), async (req, res) => {
  const user = req.user;
  const subcategoryId = req.params.id;
  const { name, category_id } = req.body;
  const baseUrl = "https://dixon-portfolio.vercel.app";

  const image_url = req.file
    ? `${baseUrl}/uploads/${req.file.filename}`
    : undefined;

  if (user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admin can update subcategories" });
  }

  if (!name || !category_id) {
    return res
      .status(400)
      .json({ message: "Name and category ID are required" });
  }

  try {
    const subCategory = await SubCategory.findById(subcategoryId);
    if (!subCategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    subCategory.subcategory_name = name;
    subCategory.category_id = category_id;
    if (image_url) {
      subCategory.image_url = image_url;
    }

    await subCategory.save();
    res.status(200).json({ message: "Subcategory updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ❌ Delete Subcategory (Admin only)
router.delete("/:id", verifyToken, async (req, res) => {
  const user = req.user;
  const subcategoryId = req.params.id;

  if (user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admin can delete subcategories" });
  }

  try {
    const deleted = await SubCategory.findByIdAndDelete(subcategoryId);
    if (!deleted) {
      return res.status(404).json({ message: "Subcategory not found" });
    }
    res.status(200).json({ message: "Subcategory deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🌍 View All Subcategories (Available to everyone)
router.get("/", async (req, res) => {
  try {
    const subCategories = await SubCategory.find().populate(
      "category_id",
      "name",
    );
    // Map to match old response structure if needed
    const mapped = subCategories.map((sub) => ({
      subcategory_id: sub.id,
      subcategory_name: sub.subcategory_name,
      image_url: sub.image_url,
      category_id: sub.category_id ? sub.category_id.id : null,
      category_name: sub.category_id ? sub.category_id.name : null,
    }));
    res.status(200).json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📦 Get Subcategories by Category ID (For sellers/customers)
router.get("/category/:category_id", async (req, res) => {
  const categoryId = req.params.category_id;
  try {
    const subCategories = await SubCategory.find({
      category_id: categoryId,
    }).sort({ subcategory_name: 1 });
    const mapped = subCategories.map((sub) => ({
      subcategory_id: sub.id,
      subcategory_name: sub.subcategory_name,
      image_url: sub.image_url,
      category_id: sub.category_id,
    }));
    res.status(200).json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📍 Get Subcategory by ID (For detail view)
router.get("/:id", async (req, res) => {
  const subcategoryId = req.params.id;
  try {
    const sub = await SubCategory.findById(subcategoryId).populate(
      "category_id",
      "name",
    );
    if (!sub) {
      return res.status(404).json({ message: "Subcategory not found" });
    }
    const result = {
      subcategory_id: sub.id,
      subcategory_name: sub.subcategory_name,
      image_url: sub.image_url,
      category_id: sub.category_id ? sub.category_id.id : null,
      category_name: sub.category_id ? sub.category_id.name : null,
    };
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
