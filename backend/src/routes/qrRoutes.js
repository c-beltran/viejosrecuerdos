const express = require('express');
const router = express.Router();
const { getQRCode, getItemByQR } = require('../controllers/qrController');

// Public QR code endpoints (no authentication required)
router.get('/:itemId', getQRCode); // Get QR code image
router.get('/:itemId/view', getItemByQR); // View item details via QR

module.exports = router; 