const sharp = require('sharp');
const { 
  imageConfig, 
  generateFileName, 
  uploadToS3, 
  deleteFromS3 
} = require('../config/aws');

/**
 * Process and upload image with multiple sizes
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
    const imageUrls = {};

    // Process original image (optimized)
    const originalBuffer = await sharp(file.buffer)
      .jpeg({ quality: imageConfig.original.quality })
      .toBuffer();

    const originalKey = `${imageConfig.folders.original}/${itemId}/${baseFileName}`;
    const originalUpload = await uploadToS3(originalBuffer, originalKey, 'image/jpeg');
    
    if (!originalUpload.success) {
      throw new Error(`Failed to upload original image: ${originalUpload.error}`);
    }
    imageUrls.original = originalUpload.url;

    // Process medium size
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
      // Clean up original if medium fails
      await deleteFromS3(originalKey);
      throw new Error(`Failed to upload medium image: ${mediumUpload.error}`);
    }
    imageUrls.medium = mediumUpload.url;

    // Process thumbnail
    const thumbnailBuffer = await sharp(file.buffer)
      .resize(imageConfig.thumbnail.width, imageConfig.thumbnail.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: imageConfig.thumbnail.quality })
      .toBuffer();

    const thumbnailKey = `${imageConfig.folders.thumbnail}/${itemId}/${baseFileName}`;
    const thumbnailUpload = await uploadToS3(thumbnailBuffer, thumbnailKey, 'image/jpeg');
    
    if (!thumbnailUpload.success) {
      // Clean up previous uploads if thumbnail fails
      await deleteFromS3(originalKey);
      await deleteFromS3(mediumKey);
      throw new Error(`Failed to upload thumbnail: ${thumbnailUpload.error}`);
    }
    imageUrls.thumbnail = thumbnailUpload.url;

    return {
      success: true,
      data: {
        original: imageUrls.original,
        medium: imageUrls.medium,
        thumbnail: imageUrls.thumbnail,
        fileName: baseFileName
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
const deleteImages = async (imageUrls, itemId) => {
  try {
    const deletePromises = [];

    // Extract keys from URLs and delete
    if (imageUrls.original) {
      const key = imageUrls.original.split('/').slice(-2).join('/'); // Get itemId/filename
      deletePromises.push(deleteFromS3(`${imageConfig.folders.original}/${key}`));
    }

    if (imageUrls.medium) {
      const key = imageUrls.medium.split('/').slice(-2).join('/');
      deletePromises.push(deleteFromS3(`${imageConfig.folders.medium}/${key}`));
    }

    if (imageUrls.thumbnail) {
      const key = imageUrls.thumbnail.split('/').slice(-2).join('/');
      deletePromises.push(deleteFromS3(`${imageConfig.folders.thumbnail}/${key}`));
    }

    await Promise.all(deletePromises);

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

/**
 * Generate image metadata
 */
const generateImageMetadata = (file) => {
  return {
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    uploadDate: new Date().toISOString()
  };
};

module.exports = {
  processAndUploadImage,
  uploadSingleImage,
  deleteImages,
  processMultipleImages,
  generateImageMetadata
}; 