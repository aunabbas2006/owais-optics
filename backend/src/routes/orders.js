const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { createOrder, createPrescription, getOrdersByCustomer, getOrderById } = require('../db/db');
const { sendOrderConfirmation } = require('../services/email');

const JWT_SECRET = process.env.JWT_SECRET || 'owais-optics-secret';

// Auth middleware
function requireAuth(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Please log in' });
    try {
        req.customer = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        res.status(401).json({ error: 'Session expired' });
    }
}

router.post('/', requireAuth, async (req, res) => {
    try {
        const { frame, prescription, lensType, totalPrice, notes } = req.body;
        const customer = req.customer;

        const orderId = await createOrder(
            customer.id,
            frame.shape,
            frame.color,
            frame.id,
            lensType,
            totalPrice,
            notes
        );

        for (const eye of ['right', 'left']) {
            const rx = prescription[eye];
            await createPrescription(
                orderId,
                eye,
                parseFloat(rx.sph) || 0,
                parseFloat(rx.cyl) || 0,
                parseInt(rx.axis) || 0,
                parseFloat(rx.add) || 0,
                parseFloat(rx.pd) || 0
            );
        }

        const completeOrder = await getOrderById(orderId);
        sendOrderConfirmation(customer, completeOrder).catch(e => console.error(e));

        res.json({ success: true, orderId });
    } catch (err) {
        res.status(500).json({ error: 'Failed to place order' });
    }
});

router.get('/', requireAuth, async (req, res) => {
    try {
        const orders = await getOrdersByCustomer(req.customer.id);
        res.json({ orders });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load orders' });
    }
});

router.get('/:id', requireAuth, async (req, res) => {
    try {
        const order = await getOrderById(req.params.id);
        if (!order || order.customer_id !== req.customer.id) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ order });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load order' });
    }
});

module.exports = router;
