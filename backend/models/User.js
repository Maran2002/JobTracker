import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'User',
    },
    permissions: {
        type: [String],
        default: ['all'],
    },
    bio: {
        type: String,
        default: '',
    },
    preferences: {
        dateFormat:  { type: String, default: 'MMM DD, YYYY' },
        timeFormat:  { type: String, default: '12h' },
        timezone:    { type: String, default: 'auto' },
        accentColor: { type: String, default: '#4f46e5' },
        notifications: {
            interview:    { type: Boolean, default: true },
            applications: { type: Boolean, default: true },
            weekly:       { type: Boolean, default: false },
            reminders:    { type: Boolean, default: false },
            marketing:    { type: Boolean, default: false },
        },
    },
    // ── Account Status ──────────────────────────────────────
    isDeleted: {
        type: Boolean,
        default: false,
    },
    // ── Two-Factor Auth ──────────────────────────────────────
    isTwoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    // ── OTP (for password change / 2FA setup / delete) ───────
    otpCode: {
        type: String,            // stored as bcrypt hash
        default: null,
    },
    otpExpiry: {
        type: Date,
        default: null,
    },
    otpPurpose: {
        type: String,            // 'change-password' | 'toggle-2fa' | 'delete-account' | '2fa-login'
        default: null,
    },
    // ── Web Push ─────────────────────────────────────────────
    pushSubscriptions: {
        type: [Object],
        default: [],
    },
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;
