import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/user/me — full user profile + preferences
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/user/profile — update name, email, bio
router.put('/profile', protect, async (req, res) => {
    const { name, email, bio } = req.body;
    try {
        const updates = {};
        if (name  !== undefined) updates.name  = name;
        if (email !== undefined) updates.email = email;
        if (bio   !== undefined) updates.bio   = bio;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/user/preferences
router.get('/preferences', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('preferences');
        res.json(user?.preferences || {});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/user/preferences
router.put('/preferences', protect, async (req, res) => {
    try {
        const { preferences } = req.body;
        if (!preferences || typeof preferences !== 'object') {
            return res.status(400).json({ message: 'preferences object required' });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { preferences } },
            { new: true }
        ).select('preferences');

        res.json(user?.preferences || {});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
