import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendOtpEmail } from '../utils/mailer.js';

const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

/* ── Register ── */
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Allow re-registration if previous account was soft-deleted
        const existingUser = await User.findOne({ email });
        if (existingUser && !existingUser.isDeleted) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let user;
        if (existingUser && existingUser.isDeleted) {
            // Re-activate by creating a fresh document (clear old one first)
            await User.deleteOne({ _id: existingUser._id });
        }

        user = await User.create({ name, email, password: hashedPassword });

        if (user) {
            res.status(201).json({
                _id:         user._id,
                name:        user.name,
                email:       user.email,
                role:        user.role,
                permissions: user.permissions,
                bio:         user.bio,
                isTwoFactorEnabled: user.isTwoFactorEnabled,
                token:       generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* ── Login (Step 1) ── */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) return res.status(401).json({ message: 'Invalid email or password' });

        if (user.isDeleted) {
            return res.status(401).json({
                message: 'This account has been deactivated. Please register a new account.'
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(401).json({ message: 'Invalid email or password' });

        // If 2FA is enabled, send OTP and require second step
        if (user.isTwoFactorEnabled) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const salt = await bcrypt.genSalt(10);
            const hashedOtp = await bcrypt.hash(otp, salt);

            user.otpCode    = hashedOtp;
            user.otpExpiry  = new Date(Date.now() + 10 * 60 * 1000);
            user.otpPurpose = '2fa-login';
            await user.save();

            await sendOtpEmail(user.email, otp, 'Two-Factor Login');

            return res.status(200).json({
                require2FA: true,
                userId: user._id,
                message: 'OTP sent to your email. Please verify to complete login.',
            });
        }

        res.json({
            _id:         user._id,
            name:        user.name,
            email:       user.email,
            role:        user.role,
            bio:         user.bio,
            permissions: user.permissions,
            isTwoFactorEnabled: user.isTwoFactorEnabled,
            token:       generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* ── Login (Step 2 — 2FA verification) ── */
router.post('/verify-2fa-login', async (req, res) => {
    const { userId, otp } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.otpCode || user.otpPurpose !== '2fa-login') {
            return res.status(400).json({ message: 'No pending 2FA verification' });
        }
        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ message: 'OTP expired. Please log in again.' });
        }
        const valid = await bcrypt.compare(otp, user.otpCode);
        if (!valid) return res.status(400).json({ message: 'Invalid OTP' });

        user.otpCode    = null;
        user.otpExpiry  = null;
        user.otpPurpose = null;
        await user.save();

        res.json({
            _id:         user._id,
            name:        user.name,
            email:       user.email,
            role:        user.role,
            bio:         user.bio,
            permissions: user.permissions,
            isTwoFactorEnabled: user.isTwoFactorEnabled,
            token:       generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
