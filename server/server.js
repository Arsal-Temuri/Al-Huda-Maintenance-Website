const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
require('dotenv').config();
const { connectToDatabase } = require('./config/db');

const app = express();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alhuda-maintenance';

// Connect to MongoDB safely
connectToDatabase().catch(err => console.error("MongoDB Connection Error on Startup: ", err));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(session({
    secret: process.env.SESSION_SECRET || 'alhuda-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: MONGODB_URI
    }),
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Quick health check route for Vercel
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running on Vercel Serverless!', hasMongoURI: !!process.env.MONGODB_URI });
});

const authRoutes = require('./routes/authRoutes');
const requestRoutes = require('./routes/requestRoutes');
const workerRoutes = require('./routes/workerRoutes');

app.use('/api', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/workers', workerRoutes);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// Export for Vercel Serverless OR run locally
if (process.env.NODE_ENV !== 'production' && require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
