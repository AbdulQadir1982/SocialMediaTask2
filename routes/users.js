const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

// Follow User
router.put('/follow/:id', auth, async (req, res, next) => {
    if (req.user.id === req.params.id) return res.status(400).json({ msg: 'Cannot follow yourself' });
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToFollow) {
            return res.status(404).json({ msg: 'User to follow not found' });
        }
        if (!currentUser) {
            return res.status(404).json({ msg: 'Current user not found' });
        }

        if (!userToFollow.followers.includes(req.user.id)) {
            await userToFollow.updateOne({ $push: { followers: req.user.id } });
            await currentUser.updateOne({ $push: { following: req.params.id } });
            res.json({ msg: 'User followed' });
        } else {
            res.status(400).json({ msg: 'You already follow this user' });
        }
    } catch (err) {
        next(err); // Pass error to global error handler
    }
});

// Unfollow User
router.put('/unfollow/:id', auth, async (req, res, next) => {
    if (req.user.id === req.params.id) return res.status(400).json({ msg: 'Cannot unfollow yourself' });
    try {
        const userToUnfollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToUnfollow) {
            return res.status(404).json({ msg: 'User to unfollow not found' });
        }
        if (!currentUser) {
            return res.status(404).json({ msg: 'Current user not found' });
        }

        if (userToUnfollow.followers.includes(req.user.id)) {
            await userToUnfollow.updateOne({ $pull: { followers: req.user.id } });
            await currentUser.updateOne({ $pull: { following: req.params.id } });
            res.json({ msg: 'User unfollowed' });
        } else {
            res.status(400).json({ msg: 'You do not follow this user' });
        }
    } catch (err) {
        next(err); // Pass error to global error handler
    }
});

// Get User Profile
router.get('/:id', auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password').populate('followers', ['username']).populate('following', ['username']);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        next(err); // Pass error to global error handler
    }
});

module.exports = router;
