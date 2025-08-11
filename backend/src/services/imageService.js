const sharp = require('sharp');
const { 
  imageConfig, 
  generateFileName, 
  uploadToS3, 
  deleteFromS3 
} = require('../config/aws');

/**
 * Process and upload image with medium size only
 */
const processAndUploadImage = async (file, itemId) => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    if (!imageConfig.allowedTypes.includes(file.mimetype)) {
      throw new Error(`File type not allowed. Allowed types: ${imageConfig.allowedTypes.join(', ')}`);
    }

    if (file.size > imageConfig.maxFileSize) {
      throw new Error(`File too large. Maximum size: ${imageConfig.maxFileSize / (1024 * 1024)}MB`);
    }

    const baseFileName = generateFileName(file.originalname);

    // Process medium size only
    const mediumBuffer = await sharp(file.buffer)
      .resize(imageConfig.medium.width, imageConfig.medium.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: imageConfig.medium.quality })
      .toBuffer();

    const mediumKey = `${imageConfig.folders.medium}/${itemId}/${baseFileName}`;
    const mediumUpload = await uploadToS3(mediumBuffer, mediumKey, 'image/jpeg');
    
    if (!mediumUpload.success) {
      throw new Error(`Failed to upload medium image: ${mediumUpload.error}`);
    }

    return {
      success: true,
      data: {
        fileName: baseFileName,
        originalName: file.originalname,
        url: mediumUpload.url
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload single image (no processing)
 */
const uploadSingleImage = async (file, itemId) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    const fileName = generateFileName(file.originalname);
    const key = `${imageConfig.folders.original}/${itemId}/${fileName}`;
    
    const upload = await uploadToS3(file.buffer, key, file.mimetype);
    
    if (!upload.success) {
      throw new Error(`Failed to upload image: ${upload.error}`);
    }

    return {
      success: true,
      data: {
        url: upload.url,
        fileName: fileName
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete images from S3
 */
const deleteImages = async (imageData, itemId) => {
  try {
    // Extract key from URL and delete
    if (imageData.url) {
      const key = imageData.url.split('/').slice(-2).join('/'); // Get itemId/filename
      await deleteFromS3(`${imageConfig.folders.medium}/${key}`);
    }

    return {
      success: true,
      message: 'Images deleted successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Process multiple images for an item
 */
const processMultipleImages = async (files, itemId) => {
  try {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    if (files.length > 10) {
      throw new Error('Maximum 10 images allowed per item');
    }

    const processedImages = [];

    for (const file of files) {
      const result = await processAndUploadImage(file, itemId);
      if (result.success) {
        processedImages.push(result.data);
      } else {
        // Clean up previously uploaded images if one fails
        for (const uploadedImage of processedImages) {
          await deleteImages(uploadedImage, itemId);
        }
        throw new Error(`Failed to process image: ${result.error}`);
      }
    }

    return {
      success: true,
      data: processedImages
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};



module.exports = {
  processAndUploadImage,
  uploadSingleImage,
  deleteImages,
  processMultipleImages
}; 