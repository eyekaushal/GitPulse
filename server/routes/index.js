const express = require('express');
const router = express.Router();
const { getProfile } = require('../controllers/profileController');
const { getInsights } = require('../controllers/insightsController');
const { getComparison } = require('../controllers/compareController');
const { createShareLink, getShareLink } = require('../controllers/shareController');
const rateLimiter = require('../middleware/rateLimiter');

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/profile/:username', rateLimiter, getProfile);
router.get('/insights/:username', rateLimiter, getInsights);
router.get('/compare', rateLimiter, getComparison);
router.post('/share', rateLimiter, createShareLink);
router.get('/share/:slug', getShareLink);

module.exports = router;