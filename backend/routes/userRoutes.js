import express from 'express';
import bcrypt from 'bcryptjs';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import { sendOtpEmail } from '../utils/mailer.js';

const router = express.Router();

/* ── GET /api/user/me ── */
router.get('/me', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password -otpCode').lean();
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        next(error);
    }
});

/* ── PUT /api/user/profile ── */
router.put('/profile', protect, async (req, res, next) => {
    const { name, email, bio } = req.body;
    try {
        const updates = {};
        if (name  !== undefined) updates.name  = name;
        if (email !== undefined) updates.email = email;
        if (bio   !== undefined) updates.bio   = bio;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password -otpCode');

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        next(error);
    }
});

/* ── GET /api/user/preferences ── */
router.get('/preferences', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('preferences').lean();
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.preferences || {});
    } catch (error) {
        next(error);
    }
});

/* ── PUT /api/user/preferences ── */
router.put('/preferences', protect, async (req, res, next) => {
    try {
        const { preferences } = req.body;
        if (!preferences || typeof preferences !== 'object') {
            return res.status(400).json({ message: 'preferences object required' });
        }
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { preferences } },
            { new: true }
        ).select('preferences');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.preferences || {});
    } catch (error) {
        next(error);
    }
});

/* ═══════════════════════════════════════════
   OTP — Send (generic, purpose-gated)
   POST /api/user/send-otp  { purpose }
   ═══════════════════════════════════════════ */
router.post('/send-otp', protect, async (req, res, next) => {
    const { purpose } = req.body;
    const VALID_PURPOSES = ['change-password', 'toggle-2fa', 'delete-account'];
    if (!VALID_PURPOSES.includes(purpose)) {
        return res.status(400).json({ message: 'Invalid OTP purpose' });
    }
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const otp     = Math.floor(100000 + Math.random() * 900000).toString();
        const salt    = await bcrypt.genSalt(10);
        const hashed  = await bcrypt.hash(otp, salt);

        user.otpCode    = hashed;
        user.otpExpiry  = new Date(Date.now() + 10 * 60 * 1000);
        user.otpPurpose = purpose;
        await user.save();

        const purposeLabels = {
            'change-password': 'Change Password',
            'toggle-2fa':      'Two-Factor Authentication Setup',
            'delete-account':  'Account Deletion',
        };

        await sendOtpEmail(user.email, otp, purposeLabels[purpose]);
        res.json({ message: `OTP sent to ${user.email}` });
    } catch (error) {
        next(error);
    }
});

/* ═══════════════════════════════════════════
   Change Password
   POST /api/user/change-password  { otp, newPassword }
   ═══════════════════════════════════════════ */
router.post('/change-password', protect, async (req, res, next) => {
    const { otp, newPassword } = req.body;
    if (!otp || !newPassword) {
        return res.status(400).json({ message: 'OTP and new password are required' });
    }
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!user.otpCode || user.otpPurpose !== 'change-password') {
            return res.status(400).json({ message: 'No pending change-password OTP. Request one first.' });
        }
        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }
        const valid = await bcrypt.compare(otp, user.otpCode);
        if (!valid) return res.status(400).json({ message: 'Invalid OTP' });

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters.' });
        }

        const salt       = await bcrypt.genSalt(10);
        user.password    = await bcrypt.hash(newPassword, salt);
        user.otpCode     = null;
        user.otpExpiry   = null;
        user.otpPurpose  = null;
        await user.save();

        res.json({ message: 'Password changed successfully.' });
    } catch (error) {
        next(error);
    }
});

/* ═══════════════════════════════════════════
   Toggle 2FA
   POST /api/user/toggle-2fa  { otp }
   ═══════════════════════════════════════════ */
router.post('/toggle-2fa', protect, async (req, res, next) => {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ message: 'OTP is required' });
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!user.otpCode || user.otpPurpose !== 'toggle-2fa') {
            return res.status(400).json({ message: 'No pending 2FA OTP. Request one first.' });
        }
        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }
        const valid = await bcrypt.compare(otp, user.otpCode);
        if (!valid) return res.status(400).json({ message: 'Invalid OTP' });

        user.isTwoFactorEnabled = !user.isTwoFactorEnabled;
        user.otpCode            = null;
        user.otpExpiry          = null;
        user.otpPurpose         = null;
        await user.save();

        res.json({
            isTwoFactorEnabled: user.isTwoFactorEnabled,
            message: `Two-Factor Authentication ${user.isTwoFactorEnabled ? 'enabled' : 'disabled'}.`,
        });
    } catch (error) {
        next(error);
    }
});

/* ═══════════════════════════════════════════
   Delete Account (soft delete)
   POST /api/user/delete-account  { otp }
   ═══════════════════════════════════════════ */
router.post('/delete-account', protect, async (req, res, next) => {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ message: 'OTP is required' });
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!user.otpCode || user.otpPurpose !== 'delete-account') {
            return res.status(400).json({ message: 'No pending delete-account OTP. Request one first.' });
        }
        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }
        const valid = await bcrypt.compare(otp, user.otpCode);
        if (!valid) return res.status(400).json({ message: 'Invalid OTP' });

        user.isDeleted      = true;
        user.otpCode        = null;
        user.otpExpiry      = null;
        user.otpPurpose     = null;
        user.pushSubscriptions = [];
        await user.save();

        res.json({ message: 'Account deactivated. You have been signed out.' });
    } catch (error) {
        next(error);
    }
});

/* ═══════════════════════════════════════════
   Web Push — Subscribe
   POST /api/user/push-subscribe  { subscription }
   ═══════════════════════════════════════════ */
router.post('/push-subscribe', protect, async (req, res, next) => {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ message: 'subscription object required' });
    }
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        // Avoid duplicate subscriptions from same endpoint
        const already = user.pushSubscriptions.some(s => s.endpoint === subscription.endpoint);
        if (!already) {
            user.pushSubscriptions.push(subscription);
            await user.save();
        }
        res.json({ message: 'Push subscription saved.' });
    } catch (error) {
        next(error);
    }
});

/* ═══════════════════════════════════════════
   Web Push — Unsubscribe
   DELETE /api/user/push-subscribe  { endpoint }
   ═══════════════════════════════════════════ */
router.delete('/push-subscribe', protect, async (req, res, next) => {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ message: 'endpoint required' });
    try {
        const result = await User.findByIdAndUpdate(req.user._id, {
            $pull: { pushSubscriptions: { endpoint } },
        });
        if (!result) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Push subscription removed.' });
    } catch (error) {
        next(error);
    }
});

/* ── GET /api/user/vapid-public-key ── (frontend needs this to subscribe) */
router.get('/vapid-public-key', (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

export default router;
