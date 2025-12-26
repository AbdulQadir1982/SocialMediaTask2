const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const debugUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        const users = await User.find({});
        console.log('Users found:', users.length);
        users.forEach(u => {
            console.log(`User: ${u.email}, Hash starts with: ${u.password.substring(0, 10)}...`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugUsers();
