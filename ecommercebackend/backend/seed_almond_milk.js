const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
const SubCategory = require('./models/SubCategory');

mongoose.connect('mongodb://localhost:27017/grocery')
    .then(async () => {
        console.log("Connected. Seeding Almond Milk...");

        // 1. Find or create category/subcategory
        let category = await Category.findOne({ name: 'Dairy & Eggs' }); // Or Alternatives
        if (!category) {
            // fallback if not found
            category = await Category.findOne({});
        }

        let subCategory = await SubCategory.findOne({ subcategory_name: 'Min' }); // Typo in previous? Or "Milk"?
        if (!subCategory) {
            // Try to find ANY subcategory
            subCategory = await SubCategory.findOne({ category_id: category._id });
        }

        // 2. Create Product
        const product = new Product({
            name: "Almond Milk Unsweetened",
            description: "Dairy-free, calcium-rich unsweetened almond milk.",
            price: 250,
            quantity: 50,
            image_url: "https://images.unsplash.com/photo-1639906161434-f2526e06917e?q=80&w=2664&auto=format&fit=crop", // Specific almond milk image
            category_id: category._id,
            sub_category_id: subCategory._id,
            seller_id: new mongoose.Types.ObjectId()
        });

        await product.save();
        console.log("Created 'Almond Milk Unsweetened'. ID:", product._id);

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
