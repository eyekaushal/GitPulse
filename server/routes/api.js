const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const shareController = require('../controllers/shareController');

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Profile
router.get('/profile/:username', profileController.getProfile);

// Compare two profiles
router.get('/compare/:username1/:username2', profileController.compareProfiles);

// Share links
router.post('/share', shareController.createShareLink);
router.get('/share/:token', shareController.getShareLink);

module.exports = router;