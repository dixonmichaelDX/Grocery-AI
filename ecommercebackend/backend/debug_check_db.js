const mongoose = require('mongoose');
const Product = require('./models/Product');
const SubCategory = require('./models/SubCategory');
const Category = require('./models/Category');

mongoose.connect('mongodb://localhost:27017/grocery')
    .then(async () => {
        console.log("Connected to DB. Checking data...");

        try {
            // 1. Fetch all SubCategories
            const subCats = await SubCategory.find();
            console.log(`\n--- Found ${subCats.length} SubCategories ---`);
            subCats.forEach(s => console.log(`ID: ${s._id} | Name: ${s.subcategory_name}`));

            if (subCats.length === 0) {
                console.log("Creating dummy subcategory if none exist...");
            }

            // 2. Fetch all Products
            const products = await Product.find();
            console.log(`\n--- Found ${products.length} Products ---`);

            let matchCount = 0;
            products.forEach(p => {
                const subId = p.sub_category_id;
                const subIdStr = subId ? subId.toString() : "null";

                // Check if this ID exists in our subCats list
                const match = subCats.find(s => s._id.toString() === subIdStr);

                console.log(`Product: ${p.name.padEnd(20)} | SubCatID: ${subIdStr} | Valid Match: ${!!match}`);
                if (match) matchCount++;
            });

            console.log(`\nTotal Products with VALID SubCategory links: ${matchCount}`);

        } catch (e) {
            console.error(e);
        }
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
