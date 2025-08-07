const multer = require('multer');
const imageProcessingService = require('../services/imageProcessingService');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    // Check file size
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      cb(new Error('File too large. Maximum size is 10MB.'), false);
      return;
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.JPG', '.JPEG', '.PNG', '.WEBP', '.GIF'];
    
    const isValidType = allowedTypes.includes(file.mimetype.toLowerCase());
    const isValidExtension = allowedExtensions.some(ext => 
      file.originalname.toLowerCase().endsWith(ext.toLowerCase())
    );
    
    if (isValidType || isValidExtension) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image file. Please upload a valid image (JPEG, PNG, WebP, GIF) under 10MB.'), false);
    }
  } else {
    cb(new Error('Only image files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files per request
  }
});

// Middleware for single image upload
const uploadSingleImage = upload.single('image');

// Middleware for multiple image upload
const uploadMultipleImages = upload.array('images', 10);

// Error handling wrapper for single image upload
const handleSingleImageUpload = (req, res, next) => {
  uploadSingleImage(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File too large. Maximum size is 10MB.'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: 'Too many files. Maximum is 10 files.'
        });
      }
      return res.status(400).json({
        success: false,
        error: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided.'
      });
    }
    
    next();
  });
};

// Error handling wrapper for multiple image upload
const handleMultipleImagesUpload = (req, res, next) => {
  uploadMultipleImages(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'One or more files are too large. Maximum size is 10MB per file.'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: 'Too many files. Maximum is 10 files.'
        });
      }
      return res.status(400).json({
        success: false,
        error: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No image files provided.'
      });
    }
    
    next();
  });
};

// Custom middleware for inventory image upload with specific validation
const handleInventoryImageUpload = (req, res, next) => {
  uploadMultipleImages(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'One or more images are too large. Maximum size is 10MB per image.'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: 'Too many images. Maximum is 10 images per inventory item.'
        });
      }
      return res.status(400).json({
        success: false,
        error: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No image files provided for inventory item.'
      });
    }
    
    // Additional validation for inventory images
    const invalidFiles = req.files.filter(file => !imageProcessingService.validateImage(file));
    if (invalidFiles.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'One or more files are not valid images. Please upload valid image files (JPEG, PNG, WebP, GIF) under 10MB.'
      });
    }
    
    next();
  });
};

module.exports = {
  upload,
  uploadSingleImage,
  uploadMultipleImages,
  handleSingleImageUpload,
  handleMultipleImagesUpload,
  handleInventoryImageUpload
}; 