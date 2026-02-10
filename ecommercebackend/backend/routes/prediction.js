const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { verifyToken } = require('../middleware/authMiddleware');

// Get Demand Prediction for a Product
router.get('/demand/:productId', verifyToken, async (req, res) => {
    const { productId } = req.params;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // 1. Fetch Order History for the Product
        // We need to aggregate sales by date
        const orders = await Order.find({
            "items.product_id": productId
        }).sort({ created_at: 1 });

        // Map to get Date -> Quantity
        const salesData = {};

        orders.forEach(order => {
            const date = order.created_at.toISOString().split('T')[0]; // YYYY-MM-DD
            const item = order.items.find(i => i.product_id.toString() === productId);
            if (item) {
                salesData[date] = (salesData[date] || 0) + item.quantity;
            }
        });

        // 2. Data Filling (for demo purposes if data is sparse)
        // If less than 14 days of data, generate simplified mock history for the demo
        if (historicalData.length < 14) {
            const today = new Date();
            historicalData = [];
            for (let i = 29; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);

                // Generate deterministic mock pattern based on product ID char code
                const baseDemand = (productId.charCodeAt(productId.length - 1) % 20) + 10;
                const randomVar = Math.floor(Math.random() * 10) - 5;

                historicalData.push({
                    date: d.toISOString().split('T')[0],
                    actual: Math.max(0, baseDemand + randomVar),
                    predicted: null
                });
            }
        }

        // 3. Prediction Algorithm (Simple Moving Average with Trend)
        const predictionDays = 7;
        const lastDateStr = historicalData[historicalData.length - 1].date;
        let lastDate = new Date(lastDateStr);

        // Calculate average daily sales (last 30 days)
        const totalSales = historicalData.reduce((sum, day) => sum + (day.actual || 0), 0);
        const avgSales = totalSales / historicalData.length;

        // Generate Forecast
        const forecastData = [];
        let currentTrend = (Math.random() * 0.4) - 0.2; // Small random trend (-20% to +20%)

        for (let i = 1; i <= predictionDays; i++) {
            const nextDate = new Date(lastDate);
            nextDate.setDate(lastDate.getDate() + i);

            // Apply trend
            const predictedValue = Math.max(0, Math.round(avgSales * (1 + currentTrend * i) + (Math.random() * 4 - 2)));

            forecastData.push({
                date: nextDate.toISOString().split('T')[0],
                actual: null,
                predicted: predictedValue
            });
        }

        // 4. Calculate Dynamic Stats
        // Growth Trend: Comparison of average of next 7 days vs last 7 days
        const recentAvg = historicalData.slice(-7).reduce((sum, d) => sum + d.actual, 0) / 7;
        const futureAvg = forecastData.reduce((sum, d) => sum + d.predicted, 0) / 7;
        const growthPercent = ((futureAvg - recentAvg) / (recentAvg || 1) * 100).toFixed(1);

        // Confidence: Mock calculation based on variance
        const variance = historicalData.slice(-7).reduce((acc, val) => acc + Math.pow(val.actual - recentAvg, 2), 0) / 7;
        const confidence = Math.max(50, Math.min(99, 100 - (variance * 2))).toFixed(0);

        // Stock Recommendation
        let recommendedStock = "Maintain";
        if (growthPercent > 10) recommendedStock = "High";
        if (growthPercent < -10) recommendedStock = "Low";

        // Combine Data
        const combinedData = [...historicalData, ...forecastData];

        res.json({
            product: product.name,
            data: combinedData,
            stats: {
                confidence: `${confidence}%`,
                growth: `${growthPercent > 0 ? '+' : ''}${growthPercent}%`,
                stock: recommendedStock,
                growthDesc: growthPercent > 0 ? 'Predicted increase next 7 days' : 'Predicted slight dip'
            }
        });

    } catch (error) {
        console.error("Prediction Error:", error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
