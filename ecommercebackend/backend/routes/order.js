const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Address = require("../models/Address");
const { verifyToken } = require("../middleware/authMiddleware");

const Counter = require("../models/Counter");

// ➕ Create Order (Only Customers)
router.post("/add", verifyToken, async (req, res) => {
  const user = req.user;
  const { items, total_price, address_id } = req.body;

  if (user.role !== "customer") {
    return res.status(403).json({ message: "Only customers can place orders" });
  }

  if (!items || !total_price || !address_id) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const address = await Address.findOne({ _id: address_id, user_id: user.id });
    if (!address) {
      return res.status(400).json({ message: "Invalid address ID for this user" });
    }

    // Get Next Order Number
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'orderId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const newOrder = new Order({
      order_number: counter.seq,
      user_id: user.id,
      address_id,
      total: total_price,
      status: "pending",
      items: items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      })),
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: "Order placed successfully",
      orderId: savedOrder.id,
      orderNumber: savedOrder.order_number
    });

  } catch (error) {
    console.error("Place Order Error:", error);
    res.status(500).json({ message: error.message, error: error.toString() });
  }
});

// 🔍 Get Order by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product_id')
      .populate('address_id');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is owner (or admin? allowing admin for now if implemented later)
    if (order.user_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    // Format items to include product details directly
    const formattedItems = order.items.map(item => {
      const product = item.product_id || {}; // Handle null if product deleted
      return {
        product_name: product.name || 'Unknown Product',
        product_image: product.image_url,
        unit_price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      };
    });

    res.json({
      order: {
        id: order._id,
        order_number: order.order_number, // The numeric ID
        created_at: order.created_at,
        total: order.total,
        status: order.status,
        address: order.address_id
      },
      items: formattedItems
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
