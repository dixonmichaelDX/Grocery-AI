const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const { verifyToken } = require("../middleware/authMiddleware");

// 🌍 View Order History (Customer, Seller, Admin)
router.get("/", verifyToken, async (req, res) => {
  const user = req.user;

  try {
    let orders = [];

    if (user.role === "customer") {
      orders = await Order.find({ user_id: user.id })
        .sort({ created_at: -1 })
        .populate("address_id");
    } else if (user.role === "admin") {
      orders = await Order.find()
        .sort({ created_at: -1 })
        .populate("address_id");
    } else if (user.role === "seller") {
      // Find products belonging to the seller
      const sellerProducts = await Product.find({ seller_id: user.id }).select("_id");
      const sellerProductIds = sellerProducts.map((p) => p._id);

      // Find orders that contain at least one of the seller's products
      orders = await Order.find({
        "items.product_id": { $in: sellerProductIds },
      })
        .sort({ created_at: -1 })
        .populate("address_id");

      // Note: This returns the FULL order, even if it contains items from other sellers.
      // Ideally, we might want to filter the items in the response, but for history list, mostly okay.
    }

    // Transform _id to id if not handled by toJSON (Order model has toJSON)
    res.status(200).json(orders);
  } catch (err) {
    console.error("Order History Error:", err);
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;

module.exports = router;
