import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
    try {
        const applications = await Application.find({ user: req.user._id });
        const interviews = await Interview.find({ user: req.user._id });

        const totalApplications = applications.length;
        const totalInterviews = interviews.length;

        const byStatus = {
            'Interviewing': applications.filter(a => a.status === 'Interviewing').length,
            'Applied': applications.filter(a => a.status === 'Applied').length,
            'Offer Received': applications.filter(a => a.status === 'Offer Received').length,
            'Rejected': applications.filter(a => a.status === 'Rejected').length,
            'Screening': applications.filter(a => a.status === 'Screening').length,
        };

        res.json({
            totalApplications,
            totalInterviews,
            byStatus,
            applications, // Send raw to let frontend do whatever
            interviews 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
