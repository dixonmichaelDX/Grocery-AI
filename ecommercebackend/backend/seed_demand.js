const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');
const User = require('./models/User'); // Need a user for orders

// Connect to DB
mongoose.connect('mongodb://localhost:27017/grocery')
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => console.error(err));

const seedData = async () => {
    try {
        console.log("Starting Seed...");

        // 1. Get or Create a User for the orders
        let user = await User.findOne({ email: 'admin@gmail.com' });
        if (!user) {
            console.log("Admin user not found, trying to find any user...");
            user = await User.findOne({});
            if (!user) {
                console.log("No users found. Creating a dummy user.");
                const newUser = new User({
                    name: "Seed User",
                    email: "seed@test.com",
                    password: "password", // hashed manually if needed but for seed ok
                    role: "customer"
                });
                user = await newUser.save();
            }
        }
        console.log(`Using User: ${user._id}`);

        // 2. Get or Create a Product to seed demand for
        // Let's create a specific "Trending Product" to guarantee data
        let product = await Product.findOne({ name: "Trending Apple" });
        if (!product) {
            product = new Product({
                name: "Trending Apple",
                description: "Fresh apples with high demand",
                price: 150,
                quantity: 100,
                category: "Fruits",
                image_url: "https://via.placeholder.com/150",
                seller_id: user._id // Self-selling or whatever
            });
            await product.save();
            console.log("Created 'Trending Apple' product");
        } else {
            console.log("Found 'Trending Apple' product");
        }

        // 3. Clear existing orders for this product to avoid duplicates if run multiple times
        // actually better to just add more or leave it. Let's just add.

        // 4. Generate Orders for the last 14 days
        const orders = [];
        const today = new Date();

        for (let i = 13; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);

            // Random quantity between 5 and 50 to show a trend
            // Let's make it a rising trend
            const baseQty = 10;
            const trend = (14 - i) * 2; // Increases as i decreases (dates get closer to today)
            const randomVar = Math.floor(Math.random() * 10);
            const quantity = baseQty + trend + randomVar;

            const order = new Order({
                order_number: 9000 + i,
                user_id: user._id,
                total: quantity * product.price,
                status: 'delivered',
                created_at: date,
                address_id: user._id, // Dummy ID, usually a separate model but for graph aggregation only time/qty matters
                items: [{
                    product_id: product._id,
                    quantity: quantity,
                    price: product.price
                }]
            });
            orders.push(order);
        }

        await Order.insertMany(orders);
        console.log(`Seeded ${orders.length} orders for ${product.name}`);
        console.log(`Product ID to check: ${product._id}`);

    } catch (error) {
        console.error("Seeding Error:", error);
    } finally {
        mongoose.connection.close();
    }
};

seedData();
