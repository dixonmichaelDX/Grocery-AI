const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ✅ Add product to cart
router.post("/add", verifyToken, async (req, res) => {
  const user = req.user;

  if (user.role !== "customer") {
    return res.status(403).json({ message: "Only customers can add to cart" });
  }

  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || quantity < 1) {
    return res.status(400).json({ message: "Product ID and quantity are required" });
  }

  try {
    const existingItem = await Cart.findOne({ user_id: user.id, product_id });

    if (existingItem) {
      existingItem.quantity += parseInt(quantity);
      await existingItem.save();
      return res.status(200).json({ message: "Cart updated successfully" });
    } else {
      const newCartItem = new Cart({
        user_id: user.id,
        product_id,
        quantity
      });
      await newCartItem.save();
      return res.status(201).json({ message: "Product added to cart" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📦 Get all cart items for logged-in customer
router.get("/", verifyToken, async (req, res) => {
  const user = req.user;

  if (user.role !== "customer") {
    return res.status(403).json({ message: "Only customers can view cart" });
  }

  try {
    const cartItems = await Cart.find({ user_id: user.id }).populate('product_id');

    // Flatten result to match previous SQL structure (merging product details)
    const formattedItems = cartItems.map(item => {
      if (!item.product_id) return null; // Handle if product was deleted
      const product = item.product_id.toObject();
      return {
        cart_id: item.id,
        ...product, // Spreading product properties
        quantity: item.quantity,
        id: product._id // Use _id explicitly from the document
      };
    }).filter(item => item !== null);

    res.status(200).json(formattedItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✏️ Update quantity of a product in cart
router.put("/update/:product_id", verifyToken, async (req, res) => {
  const user = req.user;
  const { product_id } = req.params;
  const { quantity } = req.body;

  if (user.role !== "customer") {
    return res.status(403).json({ message: "Only customers can update cart items" });
  }

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1" });
  }

  try {
    const cartItem = await Cart.findOne({ user_id: user.id, product_id });
    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({ message: "Cart item updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ❌ Clear all items in the logged-in customer's cart
router.delete("/clear", verifyToken, async (req, res) => {
  const user = req.user;

  if (user.role !== "customer") {
    return res.status(403).json({ message: "Only customers can clear the cart" });
  }

  try {
    await Cart.deleteMany({ user_id: user.id });
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove an item from cart
router.delete("/remove/:product_id", verifyToken, async (req, res) => {
  const user = req.user;
  const { product_id } = req.params;

  if (user.role !== "customer") {
    return res.status(403).json({ message: "Only customers can remove items from cart" });
  }

  try {
    const result = await Cart.findOneAndDelete({ user_id: user.id, product_id });
    if (!result) {
      return res.status(404).json({ message: "Item not found in cart" });
    }
    res.status(200).json({ message: "Item removed from cart successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
