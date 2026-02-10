const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/grocery')
    .then(async () => {
        console.log("Connected. Checking products...");

        const avocados = await Product.findOne({ name: { $regex: /Avocado/i } });
        const quinoa = await Product.findOne({ name: { $regex: /Quinoa/i } });

        console.log("Avocados:", avocados ? { _id: avocados._id, name: avocados.name } : "Not Found");
        console.log("Quinoa:", quinoa ? { _id: quinoa._id, name: quinoa.name } : "Not Found");

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
