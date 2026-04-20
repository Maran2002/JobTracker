import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Interview from '../models/Interview.js';

const router = express.Router();

/* ── GET /api/interviews ── */
router.get('/', protect, async (req, res, next) => {
    try {
        const query = { user: req.user._id };
        if (req.query.applicationId) {
            query.applicationId = req.query.applicationId;
        }
        if (req.query.search) {
            // Escape regex special chars to prevent ReDoS
            const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const re = new RegExp(escaped, 'i');
            query.$or = [{ title: re }, { company: re }, { location: re }, { type: re }];
        }
        const interviews = await Interview.find(query).sort({ createdAt: 1 });
        res.json(interviews);
    } catch (error) {
        next(error);
    }
});

/* ── POST /api/interviews ── */
router.post('/', protect, async (req, res, next) => {
    try {
        const { user: _u, _id: _i, ...safeBody } = req.body;
        const interview = new Interview({ ...safeBody, user: req.user._id });
        const createdInterview = await interview.save();
        res.status(201).json(createdInterview);
    } catch (error) {
        next(error);
    }
});

/* ── POST /api/interviews/bulk ── */
router.post('/bulk', protect, async (req, res, next) => {
    try {
        const { interviews } = req.body;
        if (!interviews || !Array.isArray(interviews)) {
            return res.status(400).json({ message: 'Invalid data format: expected { interviews: [] }' });
        }
        // Sanitize each entry — strip user / _id overrides
        const safe = interviews.map(({ user: _u, _id: _i, ...itv }) => ({
            ...itv,
            user: req.user._id,
        }));
        const createdInterviews = await Interview.insertMany(safe);
        res.status(201).json(createdInterviews);
    } catch (error) {
        next(error);
    }
});

/* ── PUT /api/interviews/:id ── */
router.put('/:id', protect, async (req, res, next) => {
    try {
        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        if (interview.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { user: _u, _id: _i, ...safeBody } = req.body;
        Object.assign(interview, safeBody);
        const updatedInterview = await interview.save();
        res.json(updatedInterview);
    } catch (error) {
        next(error);
    }
});

/* ── DELETE /api/interviews/:id ── */
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        if (interview.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Interview.deleteOne({ _id: req.params.id });
        res.json({ message: 'Interview removed' });
    } catch (error) {
        next(error);
    }
});

export default router;
