import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Application from '../models/Application.js';

const router = express.Router();

// Get all applications for a user (with optional ?search= query)
router.get('/', protect, async (req, res, next) => {
    try {
        const query = { user: req.user._id };
        if (req.query.search) {
            // Escape user input before building regex (prevent ReDoS)
            const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const re = new RegExp(escaped, 'i');
            query.$or = [{ title: re }, { company: re }, { location: re }, { status: re }];
        }
        const applications = await Application.find(query).sort({ dateApplied: -1 });
        res.json(applications);
    } catch (error) {
        next(error);
    }
});

// Get single application
router.get('/:id', protect, async (req, res, next) => {
    try {
        const application = await Application.findById(req.params.id);
        if (application && application.user.toString() === req.user._id.toString()) {
            res.json(application);
        } else {
            res.status(404).json({ message: 'Application not found' });
        }
    } catch (error) {
        next(error);
    }
});

// Create application
router.post('/', protect, async (req, res, next) => {
    try {
        const {
            company, title, location, workMode, jobType,
            salary, currency, status, priority, source, jobUrl,
            logo, color, dateApplied, deadline,
            skills, description, notes, hrName, hrEmail,
        } = req.body;

        if (!company || !title) {
            return res.status(400).json({ message: 'Company and title are required.' });
        }

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
        next(error);
    }
});

// Update application
router.put('/:id', protect, async (req, res, next) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }
        if (application.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Prevent overwriting the user field via body
        const { user: _u, _id: _i, ...safeBody } = req.body;
        Object.assign(application, safeBody);
        const updatedApplication = await application.save();
        res.json(updatedApplication);
    } catch (error) {
        next(error);
    }
});

// Delete application
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }
        if (application.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Application.deleteOne({ _id: req.params.id });
        res.json({ message: 'Application removed' });
    } catch (error) {
        next(error);
    }
});

export default router;
