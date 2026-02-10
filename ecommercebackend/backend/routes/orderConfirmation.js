const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { verifyToken } = require("../middleware/authMiddleware");

// 📍 View Order Details (For Customer, Seller, Admin)
router.get("/:orderId", verifyToken, async (req, res) => {
  const user = req.user;
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId).populate("items.product_id");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🧍‍♂️ Customer check
    if (user.role === "customer") {
      if (order.user_id.toString() !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
    }
    // 🧑‍💼 Seller check
    else if (user.role === "seller") {
      const hasSellerProduct = order.items.some(
        (item) => item.product_id && item.product_id.seller_id.toString() === user.id
      );
      if (!hasSellerProduct) {
        return res.status(403).json({ message: "Access denied" });
      }
    }
    // 👑 Admin (no check needed)

    // Map items to include product details flatly if needed by frontend
    const items = order.items.map(item => {
      // Handle if product was deleted (item.product_id might be null)
      const product = item.product_id || {};
      return {
        ...item.toObject(),
        product_name: product.name,
        product_image: product.image_url,
        // Keep original price/qty from order item
      };
    });

    // Provide the order object and the processed items list
    // The frontend expects { order: ..., items: [...] }
    const responseOrder = order.toJSON();

    res.status(200).json({ order: responseOrder, items });

  } catch (err) {
    console.error("Order Confirmation Error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
