const mongoose = require('mongoose');
const Product = require('./models/Product');
const SubCategory = require('./models/SubCategory');

mongoose.connect('mongodb://localhost:27017/grocery')
    .then(async () => {
        console.log("Connected. Fixing NULL subcategories...");

        const subCats = await SubCategory.find();
        if (subCats.length === 0) {
            console.log("No subcategories found! Cannot link.");
            process.exit();
        }

        // Map names to IDs for easier lookup
        const catMap = {};
        subCats.forEach(s => {
            catMap[s.subcategory_name.toLowerCase()] = s._id;
        });

        const products = await Product.find({ $or: [{ sub_category_id: null }, { sub_category_id: { $exists: false } }] });
        console.log(`Found ${products.length} products with missing sub_category_id.`);

        for (const p of products) {
            const name = p.name.toLowerCase();
            let matchedId = null;

            // Simple keyword matching logic
            if (name.includes('chicken') || name.includes('meat') || name.includes('beef') || name.includes('steak') || name.includes('pork')) {
                matchedId = subCats.find(s => s.subcategory_name.includes('Meat'))?._id;
            } else if (name.includes('salmon') || name.includes('tuna') || name.includes('fish') || name.includes('seafood')) {
                matchedId = subCats.find(s => s.subcategory_name.includes('Sea Food'))?._id;
            } else if (name.includes('bean') || name.includes('protein')) {
                matchedId = subCats.find(s => s.subcategory_name.includes('Protein'))?._id;
            } else if (name.includes('rice') || name.includes('grain')) {
                matchedId = subCats.find(s => s.subcategory_name.includes('Rice'))?._id;
            } else if (name.includes('pasta')) {
                matchedId = subCats.find(s => s.subcategory_name.includes('Pasta'))?._id;
            } else {
                // Default fallback: Assign to first available subcategory to ensure it shows up somewhere
                matchedId = subCats[0]._id;
            }

            if (matchedId) {
                p.sub_category_id = matchedId;
                await p.save();
                console.log(`Updated '${p.name}' -> SubCat: ${matchedId}`);
            }
        }

        console.log("Done fixing products.");
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
