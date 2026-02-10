const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/grocery')
    .then(async () => {
        console.log("Connected. Users:");
        const users = await User.find({});
        users.forEach(u => {
            console.log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
        });
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
