import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Application from '../models/Application.js';

const router = express.Router();

// Get all applications for a user
router.get('/', protect, async (req, res) => {
    try {
        const applications = await Application.find({ user: req.user._id }).sort({ dateApplied: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create application
router.post('/', protect, async (req, res) => {
    try {
        const {
            company, title, location, workMode, jobType,
            salary, currency, status, priority, source, jobUrl,
            logo, color, dateApplied, deadline,
            skills, description, notes, hrName, hrEmail,
        } = req.body;

        const application = new Application({
            user: req.user._id,
            company, title, location,
            workMode:    workMode    || 'On-site',
            jobType:     jobType     || 'Full-time',
            salary:      salary      || 'Not Disclosed',
            currency:    currency    || 'USD',
            status:      status      || 'Applied',
            priority:    priority    || 'Medium',
            source:      source      || 'LinkedIn',
            jobUrl:      jobUrl      || '',
            logo:        logo        || company.slice(0, 2).toUpperCase(),
            color:       color       || '#4f46e5',
            dateApplied: dateApplied || Date.now(),
            deadline:    deadline    || null,
            skills:      skills      || '',
            description: description || '',
            notes:       notes       || '',
            hrName:      hrName      || '',
            hrEmail:     hrEmail     || '',
        });

        const createdApplication = await application.save();
        res.status(201).json(createdApplication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update application
router.put('/:id', protect, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (application) {
            if (application.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            Object.assign(application, req.body);
            const updatedApplication = await application.save();
            res.json(updatedApplication);
        } else {
            res.status(404).json({ message: 'Application not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete application
router.delete('/:id', protect, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (application) {
            if (application.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            await Application.deleteOne({ _id: req.params.id });
            res.json({ message: 'Application removed' });
        } else {
            res.status(404).json({ message: 'Application not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
