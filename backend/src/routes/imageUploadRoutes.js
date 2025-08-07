const express = require('express');
const router = express.Router();
const { verifySupabaseToken } = require('../middleware/authMiddleware');
const {
  handleSingleImageUpload,
  handleMultipleImagesUpload,
  handleInventoryImageUpload
} = require('../middleware/uploadMiddleware');
const imageUploadController = require('../controllers/imageUploadController');

// Apply authentication middleware to all routes
router.use(verifySupabaseToken);

// Single image upload
router.post('/single', handleSingleImageUpload, imageUploadController.uploadSingleImage);

// Multiple images upload
router.post('/multiple', handleMultipleImagesUpload, imageUploadController.uploadMultipleImages);

// Upload images for a specific inventory item
router.post('/inventory/:itemId', handleInventoryImageUpload, imageUploadController.uploadInventoryImages);

// Process and optimize an image
router.post('/process', handleSingleImageUpload, imageUploadController.processImage);

// Get image metadata from S3
router.get('/metadata/:imageKey', imageUploadController.getImageMetadata);

// Generate signed URL for private images
router.get('/signed-url/:imageKey', imageUploadController.getSignedUrl);

// Delete an image from S3
router.delete('/:imageKey', imageUploadController.deleteImage);

module.exports = router; 