require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { getDb } = require('./db/db');

const app = express();
const PORT = process.env.PORT || 3001;

// Init DB
getDb().catch(err => console.error('Failed to init DB:', err));

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
        },
    },
}));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/frames', require('./routes/frames'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/pricing', require('./routes/pricing'));

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Owais Optics Backend running at http://localhost:${PORT}`);
});

module.exports = app;
