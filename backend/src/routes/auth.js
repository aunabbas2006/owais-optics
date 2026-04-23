const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { createCustomer, findCustomerByEmail } = require('../db/db');
const { sendWelcomeEmail } = require('../services/email');

const JWT_SECRET = process.env.JWT_SECRET || 'owais-optics-secret';

router.post('/login', async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

        const existing = await findCustomerByEmail(email.toLowerCase());
        const isNew = !existing;
        const customer = await createCustomer(name, email.toLowerCase());

        const token = jwt.sign({ id: customer.id, name: customer.name, email: customer.email }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        if (isNew) sendWelcomeEmail(customer).catch(e => console.error(e));

        res.json({ success: true, customer, isNew });
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
});

router.get('/me', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not logged in' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ customer: decoded });
    } catch (err) {
        res.clearCookie('token');
        res.status(401).json({ error: 'Session expired' });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
});

module.exports = router;
