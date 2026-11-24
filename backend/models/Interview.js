import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    company: {
        type: String,
        required: true,
    },
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        default: null,
    },
    title: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    date: {
        type: String, // String for simplicity like 'May 24, 2024'
        required: true,
    },
    round: {
        type: Number,
        default: 1,
    },
    roundName: {
        type: String,
        default: 'Round 1',
    },
    time: {
        type: String,
        required: true,
    },
    venue: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['VIDEO CALL', 'ON-SITE'],
    },
    logo: {
        type: String,
        default: 'C'
    },
    logoColor: {
        type: String,
        default: '#2f6b5e'
    },
    color: {
        type: String,
        default: '#2f6b5e'
    }
}, {
    timestamps: true
});

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
