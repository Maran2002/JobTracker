import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Notification from '../models/Notification.js';

const router = express.Router();

/* ── GET /api/notifications ── */
router.get('/', protect, async (req, res, next) => {
    try {
        const notifications = await Notification
            .find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();
        res.json(notifications);
    } catch (error) {
        next(error);
    }
});

/* ── PATCH /api/notifications/read-all ── (must be before /:id) */
router.patch('/read-all', protect, async (req, res, next) => {
    try {
        await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
        res.json({ message: 'All notifications marked as read.' });
    } catch (error) {
        next(error);
    }
});

/* ── PATCH /api/notifications/:id/read ── */
router.patch('/:id/read', protect, async (req, res, next) => {
    try {
        const notif = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { read: true },
            { new: true }
        );
        if (!notif) return res.status(404).json({ message: 'Notification not found' });
        res.json(notif);
    } catch (error) {
        next(error);
    }
});

/* ── DELETE /api/notifications ── (clear all, must be before /:id) */
router.delete('/', protect, async (req, res, next) => {
    try {
        await Notification.deleteMany({ user: req.user._id });
        res.json({ message: 'All notifications cleared.' });
    } catch (error) {
        next(error);
    }
});

/* ── DELETE /api/notifications/:id ── */
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const result = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!result) return res.status(404).json({ message: 'Notification not found' });
        res.json({ message: 'Notification deleted.' });
    } catch (error) {
        next(error);
    }
});

export default router;
