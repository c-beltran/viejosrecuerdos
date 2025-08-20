const express = require('express');
const router = express.Router();
const { getFeaturedItems, updateFeaturedItems } = require('../controllers/landingController');

// Public endpoint - no authentication required
router.get('/featured-items', getFeaturedItems);

// Admin endpoint - requires authentication
router.put('/featured-items', updateFeaturedItems);

module.exports = router;
