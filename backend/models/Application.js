import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    company: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    workMode: {
        type: String,
        enum: ['On-site', 'Remote', 'Hybrid'],
        default: 'On-site',
    },
    jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'Hybrid', 'Freelance'],
        default: 'Full-time',
    },
    dateApplied: {
        type: Date,
        required: true,
        default: Date.now,
    },
    deadline: {
        type: Date,
        default: null,
    },
    salary: {
        type: String,
        default: 'Not Disclosed',
    },
    currency: {
        type: String,
        default: 'USD',
    },
    status: {
        type: String,
        required: true,
        enum: ['Applied', 'Screening', 'Interviewing', 'Offer Received', 'Rejected'],
        default: 'Applied',
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium',
    },
    source: {
        type: String,
        default: 'LinkedIn',
    },
    jobUrl: {
        type: String,
        default: '',
    },
    logo: {
        type: String,
        default: 'C',
    },
    color: {
        type: String,
        default: '#4f46e5',
    },
    skills: {
        type: String,
        default: '',
    },
    description: {
        type: String,
        default: '',
    },
    notes: {
        type: String,
        default: '',
    },
    hrName: {
        type: String,
        default: '',
    },
    hrEmail: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

const Application = mongoose.model('Application', applicationSchema);
export default Application;
