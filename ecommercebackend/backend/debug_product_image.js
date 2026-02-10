const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/grocery')
    .then(async () => {
        // Find product with name resembling Almond Milk
        const products = await Product.find({ name: { $regex: /Almond Milk/i } });
        console.log("Found products:", products);
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
