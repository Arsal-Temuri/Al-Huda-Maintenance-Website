const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
require('dotenv').config();
const { connectToDatabase } = require('./config/db');

const app = express();

connectToDatabase();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(session({
    secret: 'alhuda-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

const authRoutes = require('./routes/authRoutes');
const requestRoutes = require('./routes/requestRoutes');
const workerRoutes = require('./routes/workerRoutes');

app.use('/api', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/workers', workerRoutes);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
