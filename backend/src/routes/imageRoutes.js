const express = require('express');
const router = express.Router();
const { verifySupabaseToken } = require('../middleware/authMiddleware');
const { uploadSingleImage: uploadSingle, uploadMultipleImages: uploadMultiple } = require('../middleware/uploadMiddleware');
const {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
  reorderImages
} = require('../controllers/imageController');

// All image routes require authentication
router.use(verifySupabaseToken);

// Image upload routes
router.post('/images/upload/:itemId', uploadSingle, uploadSingleImage);
router.post('/images/upload-multiple/:itemId', uploadMultiple, uploadMultipleImages);

// Image management routes
router.delete('/images/delete/:itemId/:imageIndex', deleteImage);
router.put('/images/reorder/:itemId', reorderImages);

module.exports = router; 