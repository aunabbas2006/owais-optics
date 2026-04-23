const express = require('express');
const router = express.Router();
const { getAllPricing } = require('../db/db');

// Get all prices
router.get('/', async (req, res) => {
    try {
        const pricing = await getAllPricing();
        res.json({ pricing });
    } catch (err) {
        console.error('Error fetching pricing:', err);
        res.status(500).json({ error: 'Failed to fetch pricing' });
    }
});

module.exports = router;
