import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';

const router = express.Router();

/* ── GET /api/analytics ── */
router.get('/', protect, async (req, res, next) => {
    try {
        // Run both queries in parallel for speed
        const [applications, interviews] = await Promise.all([
            Application.find({ user: req.user._id }).lean(),
            Interview.find({ user: req.user._id }).lean(),
        ]);

        const totalApplications = applications.length;
        const totalInterviews   = interviews.length;

        const byStatus = {
            'Interviewing':   applications.filter(a => a.status === 'Interviewing').length,
            'Applied':        applications.filter(a => a.status === 'Applied').length,
            'Offer Received': applications.filter(a => a.status === 'Offer Received').length,
            'Rejected':       applications.filter(a => a.status === 'Rejected').length,
            'Screening':      applications.filter(a => a.status === 'Screening').length,
        };

        res.json({ totalApplications, totalInterviews, byStatus, applications, interviews });
    } catch (error) {
        next(error);
    }
});

export default router;
