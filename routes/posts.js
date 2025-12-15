const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Post = require('../models/Post');
const User = require('../models/User');
const { check, validationResult } = require('express-validator');

// Create Post
router.post('/', auth, [
    check('content', 'Post content is required').not().isEmpty()
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const newPost = new Post({
            content: req.body.content,
            user: req.user.id
        });
        const post = await newPost.save();
        res.json(post);
    } catch (err) {
        next(err); // Pass error to global error handler
    }
});

// Get All Posts
router.get('/', auth, async (req, res, next) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate('user', ['username']);
        res.json(posts);
    } catch (err) {
        next(err); // Pass error to global error handler
    }
});

// Get User Posts
router.get('/user/:id', auth, async (req, res, next) => {
    try {
        const posts = await Post.find({ user: req.params.id }).sort({ createdAt: -1 }).populate('user', ['username']);
        res.json(posts);
    } catch (err) {
        next(err); // Pass error to global error handler
    }
});

// Delete Post
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await post.deleteOne();
        res.json({ msg: 'Post removed' });
    } catch (err) {
        next(err); // Pass error to global error handler
    }
});

module.exports = router;
