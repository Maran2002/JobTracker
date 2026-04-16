import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db/connect.js';

import authRoutes         from './routes/authRoutes.js';
import userRoutes         from './routes/userRoutes.js';
import applicationRoutes  from './routes/applicationRoutes.js';
import interviewRoutes    from './routes/interviewRoutes.js';
import analyticsRoutes    from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',          authRoutes);
app.use('/api/user',          userRoutes);
app.use('/api/applications',  applicationRoutes);
app.use('/api/interviews',    interviewRoutes);
app.use('/api/analytics',     analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
