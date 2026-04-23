const express = require('express');
const router = express.Router();
const { listFrames, getFrameImage } = require('../services/drive');

router.get('/', async (req, res) => {
    try {
        const frames = await listFrames();
        res.json({ frames });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load frames' });
    }
});

router.get('/:id/image', async (req, res) => {
    try {
        const stream = await getFrameImage(req.params.id);
        if (!stream) {
            // Logic for demo SVG fallback could go here or frontend handles it
            return res.status(404).json({ error: 'Image not found' });
        }
        res.setHeader('Content-Type', 'image/jpeg');
        stream.pipe(res);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load image' });
    }
});

module.exports = router;
