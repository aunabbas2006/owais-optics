const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getAllOrders, updateOrderStatus, getAllPricing, updatePricing } = require('../db/db');

const JWT_SECRET = process.env.JWT_SECRET || 'owais-optics-secret';

// Admin Auth Middleware
function requireAdmin(req, res, next) {
    const token = req.cookies.admin_token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.isAdmin) return next();
        res.status(401).json({ error: 'Unauthorized' });
    } catch (err) {
        res.status(401).json({ error: 'Session expired' });
    }
}

// Admin Login
router.post('/login', (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === adminPassword) {
        const token = jwt.sign({ isAdmin: true }, JWT_SECRET, { expiresIn: '1d' });
        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

// Admin Logout
router.post('/logout', (req, res) => {
    res.clearCookie('admin_token');
    res.json({ success: true });
});

// Admin Me
router.get('/me', (req, res) => {
    const token = req.cookies.admin_token;
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            if (decoded.isAdmin) return res.json({ isAdmin: true });
        } catch (err) {}
    }
    res.status(401).json({ isAdmin: false });
});

// Manage Orders
router.get('/orders', requireAdmin, async (req, res) => {
    try {
        const orders = await getAllOrders();
        res.json({ orders });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

router.patch('/orders/:id/status', requireAdmin, async (req, res) => {
    try {
        await updateOrderStatus(req.params.id, req.body.status);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Manage Pricing
router.get('/pricing', requireAdmin, async (req, res) => {
    try {
        const pricing = await getAllPricing();
        res.json({ pricing });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch pricing' });
    }
});

router.patch('/pricing/:id', requireAdmin, async (req, res) => {
    try {
        const { price } = req.body;
        await updatePricing(req.params.id, price);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update pricing' });
    }
});

module.exports = router;
