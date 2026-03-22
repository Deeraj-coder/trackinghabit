require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habits');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(passport.initialize());

// Passport Google OAuth config
require('./middleware/passport')(passport);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
async function startServer() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/habit-tracker';

    try {
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.log('⚠️  MongoDB not available, starting in-memory database...');
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create();
            const memUri = mongod.getUri();
            await mongoose.connect(memUri);
            console.log('✅ Connected to in-memory MongoDB');
            console.log('💡 Data will be lost when the server stops. Install MongoDB for persistent storage.');
        } catch (memErr) {
            console.error('❌ Could not start in-memory DB either:', memErr.message);
            console.log('🚀 Server will run but database operations will fail.');
        }
    }

    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

startServer();
