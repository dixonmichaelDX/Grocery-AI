const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
const SubCategory = require('./models/SubCategory');

mongoose.connect('mongodb://localhost:27017/grocery')
    .then(async () => {
        console.log("Connected. Seeding Recommendations...");

        // 1. Get Category (Dairy/Vegetables)
        let vegCat = await Category.findOne({ name: 'Vegetables' });
        if (!vegCat) vegCat = await Category.findOne({}); // fallback

        let subCat = await SubCategory.findOne({ category_id: vegCat._id });
        if (!subCat) subCat = await SubCategory.findOne({});

        // 2. Create Avocados
        const avocado = new Product({
            name: "Fresh Avocados",
            description: "Creamy, ripe avocados perfect for toast or guacamole.",
            price: 349,
            quantity: 40,
            image_url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=2575&auto=format&fit=crop",
            category_id: vegCat._id,
            sub_category_id: subCat._id,
            seller_id: new mongoose.Types.ObjectId()
        });
        await avocado.save();
        console.log("Created Avocados ID:", avocado._id);

        // 3. Create Quinoa
        const quinoa = new Product({
            name: "Quinoa Supergrain",
            description: "High protein, gluten-free ancient grain.",
            price: 450,
            quantity: 30,
            image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=2670&auto=format&fit=crop",
            category_id: vegCat._id,
            sub_category_id: subCat._id,
            seller_id: new mongoose.Types.ObjectId()
        });
        await quinoa.save();
        console.log("Created Quinoa ID:", quinoa._id);

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
