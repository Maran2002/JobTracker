import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';
import User from '../models/User.js';
import { sendPushToUser } from '../utils/pushService.js';

const router = express.Router();

/* ── POST /api/admin/push-notification ── */
router.post('/push-notification', protect, admin, async (req, res, next) => {
    try {
        const { title, body, link, icon } = req.body;
        if (!title || !body) {
            return res.status(400).json({ message: 'Title and body are required' });
        }

        // Find all users who have active push subscriptions
        const users = await User.find({ 'pushSubscriptions.0': { $exists: true } }).select('_id');
        
        if (users.length === 0) {
            return res.json({ message: 'No users with active push subscriptions found.', sentCount: 0 });
        }

        const payload = { title, body, link, icon };
        
        let sentCount = 0;
        await Promise.allSettled(
            users.map(async (user) => {
                await sendPushToUser(user._id, payload);
                sentCount++;
            })
        );

        res.json({ message: `Push notification sent to ${sentCount} users.`, sentCount });
    } catch (error) {
        next(error);
    }
});

export default router;
