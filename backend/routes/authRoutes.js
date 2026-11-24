import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendOtpEmail } from '../utils/mailer.js';

const router = express.Router();

const OTP_TTL_MS = 10 * 60 * 1000;

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const createOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const normalizeEmail = (email) => email.trim().toLowerCase();

const setOtp = async (user, purpose) => {
    const otp = createOtp();
    const salt = await bcrypt.genSalt(10);
    user.otpCode = await bcrypt.hash(otp, salt);
    user.otpExpiry = new Date(Date.now() + OTP_TTL_MS);
    user.otpPurpose = purpose;
    return otp;
};

const publicUserPayload = (user) => ({
    _id:                user._id,
    name:               user.name,
    email:              user.email,
    role:               user.role,
    bio:                user.bio,
    permissions:        user.permissions,
    isTwoFactorEnabled: user.isTwoFactorEnabled,
    isEmailVerified:    user.isEmailVerified,
    token:              generateToken(user._id),
});

router.post('/register', async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (typeof name !== 'string' || name.trim().length > 120 || typeof email !== 'string' || email.length > 254 || typeof password !== 'string') {
        return res.status(400).json({ message: 'Please check the length and format of your details.' });
    }
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    if (Buffer.byteLength(password, 'utf8') > 128) {
        return res.status(400).json({ message: 'Password must be 128 bytes or fewer.' });
    }

    try {
        const normalizedEmail = normalizeEmail(email);
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser && !existingUser.isDeleted && existingUser.isEmailVerified) {
            return res.status(400).json({ message: 'User already exists' });
        }

        if (existingUser?.isDeleted) {
            await User.deleteOne({ _id: existingUser._id });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = existingUser && !existingUser.isDeleted
            ? existingUser
            : new User({ email: normalizedEmail });

        user.name = name;
        user.email = normalizedEmail;
        user.password = hashedPassword;
        user.isDeleted = false;
        user.isEmailVerified = false;

        const otp = await setOtp(user, 'verify-email');
        await user.save();
        await sendOtpEmail(normalizedEmail, otp, 'email verification');

        return res.status(200).json({
            success: true,
            verificationRequired: true,
            email: normalizedEmail,
            message: 'Verification code sent to your email.',
        });
    } catch (error) {
        return next(error);
    }
});

router.post('/verify-register', async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and verification code are required.' });
    }

    try {
        const user = await User.findOne({ email: normalizeEmail(email) });
        if (!user || user.isDeleted) return res.status(404).json({ message: 'User not found' });

        if (user.isEmailVerified) {
            return res.json(publicUserPayload(user));
        }
        if (!user.otpCode || user.otpPurpose !== 'verify-email') {
            return res.status(400).json({ message: 'No pending email verification. Please register again.' });
        }
        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ message: 'Verification code expired. Please request a new one.' });
        }

        const valid = await bcrypt.compare(otp, user.otpCode);
        if (!valid) return res.status(400).json({ message: 'Invalid verification code' });

        user.isEmailVerified = true;
        user.otpCode = null;
        user.otpExpiry = null;
        user.otpPurpose = null;
        await user.save();

        return res.json(publicUserPayload(user));
    } catch (error) {
        return next(error);
    }
});

router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    if (typeof email !== 'string' || email.length > 254 || typeof password !== 'string' || Buffer.byteLength(password, 'utf8') > 128) {
        return res.status(400).json({ message: 'Invalid email or password.' });
    }

    try {
        const user = await User.findOne({ email: normalizeEmail(email) });

        if (!user) return res.status(401).json({ message: 'Invalid email or password' });
        if (user.isDeleted) {
            return res.status(401).json({
                message: 'This account has been deactivated. Please register a new account.',
            });
        }
        if (user.isEmailVerified === false) {
            return res.status(403).json({ message: 'Please verify your email before signing in.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(401).json({ message: 'Invalid email or password' });

        return res.json(publicUserPayload(user));
    } catch (error) {
        return next(error);
    }
});

router.post('/forgot-password', async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail });

        if (user && !user.isDeleted) {
            const otp = await setOtp(user, 'reset-password');
            await user.save();
            await sendOtpEmail(normalizedEmail, otp, 'password reset');
            return res.json({ success: true, message: 'If an account exists, a reset code has been sent.' });
        }
        return res.json({ success: false, message: 'User not found' });

    } catch (error) {
        return next(error);
    }
});

router.post('/reset-password', async (req, res, next) => {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
        return res.status(400).json({ message: 'Email, code and new password are required.' });
    }
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    try {
        const user = await User.findOne({ email: normalizeEmail(email) });
        if (!user || user.isDeleted) return res.status(404).json({ message: 'User not found' });
        if (!user.otpCode || user.otpPurpose !== 'reset-password') {
            return res.status(400).json({ message: 'No pending password reset. Request a new code first.' });
        }
        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ message: 'Reset code expired. Please request a new one.' });
        }

        const valid = await bcrypt.compare(otp, user.otpCode);
        if (!valid) return res.status(400).json({ message: 'Invalid reset code' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.isEmailVerified = true;
        user.otpCode = null;
        user.otpExpiry = null;
        user.otpPurpose = null;
        await user.save();

        return res.json({ success: true, message: 'Password reset successfully. You can now sign in.' });
    } catch (error) {
        return next(error);
    }
});

export default router;
