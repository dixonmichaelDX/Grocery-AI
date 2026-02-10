const express = require("express");
const router = express.Router();
const multer = require("multer");
const { verifyToken } = require("../middleware/authMiddleware");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

// ➕ Setup Multer Storage for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// 🔒 Add a product — Only sellers allowed
router.post("/add", verifyToken, upload.single("image"), async (req, res) => {
  const user = req.user;

  if (user.role !== "seller" && user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only sellers and admins can add products" });
  }

  const { name, description, quantity, price: priceStr } = req.body;
  const baseUrl = "https://dixon-portfolio.vercel.app";

  const imageFilename = req.file
    ? `${baseUrl}/uploads/${req.file.filename}`
    : "https://via.placeholder.com/150"; // Fallback image

  const price = parseFloat(priceStr);
  const qty = quantity ? parseInt(quantity) : 0;

  if (!name || isNaN(price) || isNaN(qty)) {
    return res.status(400).json({
      message: "Name, Price, and Quantity are required",
    });
  }

  try {
    const newProduct = new Product({
      name,
      description: description || "",
      price,
      quantity: qty,

      image_url: imageFilename,
      seller_id: user.id,
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: "Product added successfully",
      productId: savedProduct._id,
      product: savedProduct,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Get all products
router.get("/allProducts", verifyToken, async (req, res) => {
  const user = req.user;

  if (user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admins can access all products" });
  }

  try {
    const products = await Product.find().sort({ _id: -1 });
    res.status(200).json({
      total: products.length,
      products: products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🧾 Get products added by the current seller
router.get("/my-products", verifyToken, async (req, res) => {
  const user = req.user;

  if (user.role !== "seller") {
    return res
      .status(403)
      .json({ message: "Only sellers can view their products" });
  }

  try {
    const products = await Product.find({ seller_id: user.id }).sort({
      _id: -1,
    });
    res.status(200).json({
      sellerId: user.id,
      products: products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🌐 Get products with Search, Sort, Pagination, and Filters
router.get("/", async (req, res) => {
  const {
    search,
    category,
    subcategory,
    minPrice = 0,
    maxPrice = 999999,
    sortBy = "id", // 'price', 'name', 'id'
    sortOrder = "asc",
    limit = 10,
    page = 1,
  } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    query.category_id = category;
  }

  if (subcategory) {
    query.sub_category_id = subcategory;
  }

  query.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };

  const sortOptions = {};
  const sortKey = sortBy === "id" ? "_id" : sortBy;
  sortOptions[sortKey] = sortOrder === "desc" ? -1 : 1;

  try {
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      products: products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🌐 Get product by ID (Public)
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✏️ Update product (Only owner or admin)
router.put("/:id", verifyToken, upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const { name, description, quantity, price: priceStr } = req.body;
  const baseUrl = "https://dixon-portfolio.vercel.app";

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check ownership
    // Note: seller_id is ObjectId, user.id is string from token. Compare strings.
    if (user.role !== "admin" && product.seller_id.toString() !== user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this product" });
    }

    const imageFilename = req.file
      ? `${baseUrl}/uploads/${req.file.filename}`
      : product.image_url;

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = priceStr ? parseFloat(priceStr) : product.price;
    product.quantity = quantity ? parseInt(quantity) : product.quantity;

    product.image_url = imageFilename;

    const updatedProduct = await product.save();
    res
      .status(200)
      .json({
        message: "Product updated successfully",
        product: updatedProduct,
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ❌ Delete product by ID
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (user.role !== "admin" && product.seller_id.toString() !== user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this product" });
    }

    // Delete from Cart
    await Cart.deleteMany({ product_id: id });

    // Delete product
    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
