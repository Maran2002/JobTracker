import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ['interview', 'application', 'system', 'reminder', 'offer', 'rejection'],
        default: 'system',
    },
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        default: '',
    },
    link: {
        type: String,     // e.g. '/applications/abc123'
        default: null,
    },
    read: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
