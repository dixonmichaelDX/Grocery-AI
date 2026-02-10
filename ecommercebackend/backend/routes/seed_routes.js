const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// POST /api/seed/demand
// Seeds mock order data for demand prediction
router.post('/demand', async (req, res) => {
    try {
        console.log("Starting Seed via API...");

        // 1. Get or Create a User for the orders
        let user = await User.findOne({ email: 'admin@gmail.com' });
        if (!user) {
            user = await User.findOne({}); // Fallback to any user
        }

        if (!user) {
            return res.status(400).json({ message: "No users found. Please register a user first." });
        }

        // 2. Find a product to seed (or create one)
        let product = await Product.findOne({ name: "Fresh Organic Apple" });
        if (!product) {
            product = await Product.findOne({}); // Use any existing product
        }

        if (!product) {
            const newProduct = new Product({
                name: "Fresh Organic Apple",
                description: "Crisp and sweet apples",
                price: 150,
                quantity: 100,
                category_id: new mongoose.Types.ObjectId(),
                image_url: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a"
            });
            try {
                product = await newProduct.save();
            } catch (e) {
                return res.status(400).json({ message: "No products found and failed to create dummy product." });
            }
        }

        // 3. Generate Orders for last 30 days
        const orders = [];
        const today = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);

            // Mock Trend: Rising demand
            const baseQty = 10;
            const trend = (30 - i) * 0.5;
            const randomVar = Math.floor(Math.random() * 10);
            const quantity = Math.floor(baseQty + trend + randomVar);

            const order = new Order({
                order_number: 90000 + i + Math.floor(Math.random() * 10000),
                user_id: user._id,
                total: quantity * product.price,
                status: 'delivered',
                created_at: date,
                address_id: user._id,
                items: [{
                    product_id: product._id,
                    quantity: quantity,
                    price: product.price
                }]
            });
            orders.push(order);
        }

        await Order.insertMany(orders);

        res.status(200).json({
            message: `Successfully seeded ${orders.length} orders for ${product.name}`,
            product: product.name
        });

    } catch (error) {
        console.error("Seeding Error:", error);
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/seed/products/all
// Deletes ALL products
router.delete('/products/all', async (req, res) => {
    try {
        await Product.deleteMany({});
        res.status(200).json({ message: "All products have been deleted successfully." });
    } catch (error) {
        console.error("Delete All Error:", error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
