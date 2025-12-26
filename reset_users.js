const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const resetUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        await User.deleteMany({});
        console.log('All users have been deleted. You can now register fresh.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetUsers();
