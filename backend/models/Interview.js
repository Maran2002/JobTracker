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
        default: '#4f46e5'
    },
    color: {
        type: String,
        default: '#4f46e5'
    }
}, {
    timestamps: true
});

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
