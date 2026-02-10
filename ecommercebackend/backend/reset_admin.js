const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/grocery')
    .then(async () => {
        console.log("Connected. Resetting admin...");

        try {
            const hashedPassword = await bcrypt.hash("123456", 10);
            const user = await User.findOneAndUpdate(
                { email: 'admin@gmail.com' },
                { password: hashedPassword, role: 'admin' },
                { new: true, upsert: true } // Create if not exists
            );

            if (!user.name) {
                user.name = "Admin User";
                await user.save();
            }

            console.log(`Admin reset: ${user.email} / 123456`);
        } catch (e) {
            console.error(e);
        }
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
