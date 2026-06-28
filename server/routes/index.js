const express = require('express');
const router = express.Router();
const { getProfile, compareProfiles } = require('../controllers/profileController');
const { getInsights } = require('../controllers/insightsController');
const { getComparison } = require('../controllers/compareController');
const { createShareLink, getShareLink } = require('../controllers/shareController');
const rateLimiter = require('../middleware/rateLimiter');

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/profile/:username', rateLimiter, getProfile);
router.get('/insights/:username', rateLimiter, getInsights);
router.get('/compare/:username1/:username2', rateLimiter, compareProfiles);
router.get('/compare', rateLimiter, getComparison);
router.post('/share', rateLimiter, createShareLink);
router.get('/share/:slug', rateLimiter, getShareLink);

module.exports = router;