console.log('Server process started');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const notFound = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // for parsing application/json
app.use(cors()); // for enabling CORS
app.use(express.static('public')); // for serving static files

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/interactions', require('./routes/interactions'));

// Custom Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Function to start the server and connect to the database
const fs = require('fs');

const startServer = async () => {
    try {
        fs.writeFileSync('status.txt', 'Starting server...\n');
        console.log('Starting server...');
        console.log('MONGO_URI is set:', !!process.env.MONGO_URI);

        fs.appendFileSync('status.txt', 'Connecting to DB...\n');
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });

        console.log('MongoDB Connected successfully.');
        fs.appendFileSync('status.txt', 'MongoDB Connected successfully.\n');

        app.listen(PORT, () => {
            console.log(`Server is running on port http:localhost:${PORT}`);
            fs.appendFileSync('status.txt', `Server is running on port${PORT}\n`);
            
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message);
        fs.appendFileSync('status.txt', `Failed to connect to MongoDB: ${error.message}\n`);
        process.exit(1); // Exit process with failure
    }
};

// Start the server
startServer();