const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Post = require('../models/Post');
const { check, validationResult } = require('express-validator');

// Like/Unlike Post
router.put('/like/:id', auth, async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        if (post.likes.includes(req.user.id)) {
            await post.updateOne({ $pull: { likes: req.user.id } });
            res.json({ msg: 'Post unliked' });
        } else {
            await post.updateOne({ $push: { likes: req.user.id } });
            res.json({ msg: 'Post liked' });
        }
    } catch (err) {
        next(err); // Pass error to global error handler
    }
});

// Comment on Post
router.post('/comment/:id', auth, [
    check('text', 'Comment text is required').not().isEmpty()
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        const newComment = {
            user: req.user.id,
            text: req.body.text
        };
        post.comments.unshift(newComment);
        await post.save();
        res.json(post.comments);
    } catch (err) {
        next(err); // Pass error to global error handler
    }
});

module.exports = router;
