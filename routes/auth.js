const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// Signup
router.post('/signup', [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let { username, email, password } = req.body;
    username = username.trim();
    email = email.trim().toLowerCase();

    console.log('Signup attempt:', { username, email });
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        let existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ msg: 'Username already taken' });
        }

        user = new User({ username, email, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = { user: { id: user.id } };

        let expiresIn = process.env.JWT_EXPIRES_IN;
        // Check if expiresIn is a number string (e.g. "3600"), if so convert to int for seconds
        if (/^\d+$/.test(expiresIn)) {
            expiresIn = parseInt(expiresIn, 10);
        }

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn }, (err, token) => {
            if (err) {
                return next(err); // Pass error to global error handler
            }
            res.json({ token, user: { _id: user.id, username: user.username } });
        });
    } catch (err) {
        next(err); // Pass error to global error handler
    }
});

// Login
// Login
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let { email, password } = req.body;
    email = email.trim().toLowerCase();

    console.log('Login attempt:', { email });
    try {
        console.log('Finding user...');
        let user = await User.findOne({ email });
        console.log('User found:', user ? user.email : 'not found');
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        console.log('Comparing password...');
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id } };
        console.log('Signing token...', process.env.JWT_SECRET ? 'Secret present' : 'Secret missing');

        let expiresIn = process.env.JWT_EXPIRES_IN;
        if (/^\d+$/.test(expiresIn)) {
            expiresIn = parseInt(expiresIn, 10);
        }

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn }, (err, token) => {
            if (err) {
                console.error('JWT Error:', err);
                return next(err);
            }
            console.log('Token signed.');
            res.json({ token, user: { _id: user.id, username: user.username } });
        });
    } catch (err) {
        console.error('Login error:', err);
        next(err);
    }
});

// Get Current User
router.get('/me', auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        next(err); // Pass error to global error handler
    }
});

module.exports = router;
