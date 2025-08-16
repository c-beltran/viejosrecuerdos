const express = require('express');
const router = express.Router();
const { getQRCode, getItemByQR, getItemData } = require('../controllers/qrController');

// Public QR code endpoints (no authentication required)
router.get('/:itemId', getQRCode); // Get QR code image
router.get('/:itemId/view', getItemByQR); // View item details via QR
router.get('/:itemId/data', getItemData); // Get item data for frontend API calls

module.exports = router; 