import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Interview from '../models/Interview.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
    try {
        const query = { user: req.user._id };
        if (req.query.applicationId) {
            query.applicationId = req.query.applicationId;
        }
        if (req.query.search) {
            const re = new RegExp(req.query.search, 'i');
            query.$or = [{ title: re }, { company: re }, { location: re }, { type: re }];
        }
        const interviews = await Interview.find(query).sort({ createdAt: 1 });
        res.json(interviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', protect, async (req, res) => {
    try {
        const interview = new Interview({
            ...req.body,
            user: req.user._id
        });
        const createdInterview = await interview.save();
        res.status(201).json(createdInterview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/bulk', protect, async (req, res) => {
    try {
        const { interviews } = req.body;
        if (!interviews || !Array.isArray(interviews)) {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        const createdInterviews = await Interview.insertMany(
            interviews.map(itv => ({
                ...itv,
                user: req.user._id
            }))
        );

        res.status(201).json(createdInterviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.put('/:id', protect, async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);

        if (interview) {
            if (interview.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            Object.assign(interview, req.body);
            const updatedInterview = await interview.save();
            res.json(updatedInterview);
        } else {
            res.status(404).json({ message: 'Interview not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);

        if (interview) {
            if (interview.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            await Interview.deleteOne({ _id: req.params.id });
            res.json({ message: 'Interview removed' });
        } else {
            res.status(404).json({ message: 'Interview not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
