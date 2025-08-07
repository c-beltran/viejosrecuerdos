const s3Service = require('../services/s3Service');
const imageProcessingService = require('../services/imageProcessingService');

class ImageUploadController {
  /**
   * Upload a single image for inventory
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadSingleImage(req, res) {
    try {
      const file = req.file;
      const userId = req.user.id;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided'
        });
      }

      // Process the image (optimize and create thumbnail)
      const [optimizedImage, thumbnail] = await Promise.all([
        imageProcessingService.processImage(file.buffer, {
          width: 1200,
          quality: 85,
          format: 'jpeg'
        }),
        imageProcessingService.generateThumbnail(file.buffer, {
          width: 300,
          height: 300,
          quality: 80
        })
      ]);

      // Upload both versions to S3
      const [optimizedResult, thumbnailResult] = await Promise.all([
        s3Service.uploadFile(
          optimizedImage,
          `optimized-${file.originalname}`,
          'image/jpeg',
          'inventory'
        ),
        s3Service.uploadFile(
          thumbnail,
          `thumb-${file.originalname}`,
          'image/jpeg',
          'thumbnails'
        )
      ]);

      // Get image metadata
      const metadata = await imageProcessingService.getImageMetadata(file.buffer);

      res.status(200).json({
        success: true,
        data: {
          originalName: file.originalname,
          optimizedUrl: optimizedResult.url,
          thumbnailUrl: thumbnailResult.url,
          metadata: {
            ...metadata,
            fileSize: file.size
          },
          uploadedBy: userId,
          uploadedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Single image upload error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Upload multiple images for inventory
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadMultipleImages(req, res) {
    try {
      const files = req.files;
      const userId = req.user.id;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No image files provided'
        });
      }

      const uploadResults = [];

      for (const file of files) {
        try {
          // Process the image (optimize and create thumbnail)
          const [optimizedImage, thumbnail] = await Promise.all([
            imageProcessingService.processImage(file.buffer, {
              width: 1200,
              quality: 85,
              format: 'jpeg'
            }),
            imageProcessingService.generateThumbnail(file.buffer, {
              width: 300,
              height: 300,
              quality: 80
            })
          ]);

          // Upload both versions to S3
          const [optimizedResult, thumbnailResult] = await Promise.all([
            s3Service.uploadFile(
              optimizedImage,
              `optimized-${file.originalname}`,
              'image/jpeg',
              'inventory'
            ),
            s3Service.uploadFile(
              thumbnail,
              `thumb-${file.originalname}`,
              'image/jpeg',
              'thumbnails'
            )
          ]);

          // Get image metadata
          const metadata = await imageProcessingService.getImageMetadata(file.buffer);

          uploadResults.push({
            originalName: file.originalname,
            optimizedUrl: optimizedResult.url,
            thumbnailUrl: thumbnailResult.url,
            metadata: {
              ...metadata,
              fileSize: file.size
            },
            uploadedBy: userId,
            uploadedAt: new Date().toISOString()
          });
        } catch (fileError) {
          console.error(`Error processing file ${file.originalname}:`, fileError);
          uploadResults.push({
            originalName: file.originalname,
            error: fileError.message
          });
        }
      }

      const successfulUploads = uploadResults.filter(result => !result.error);
      const failedUploads = uploadResults.filter(result => result.error);

      res.status(200).json({
        success: true,
        data: {
          uploaded: successfulUploads,
          failed: failedUploads,
          totalFiles: files.length,
          successfulCount: successfulUploads.length,
          failedCount: failedUploads.length
        }
      });
    } catch (error) {
      console.error('Multiple images upload error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Upload images for a specific inventory item
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadInventoryImages(req, res) {
    try {
      const { itemId } = req.params;
      const files = req.files;
      const userId = req.user.id;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No image files provided'
        });
      }

      const uploadResults = [];

      for (const file of files) {
        try {
          // Process the image with multiple sizes for inventory
          const [optimizedImage, thumbnail, mediumImage] = await Promise.all([
            imageProcessingService.processImage(file.buffer, {
              width: 1200,
              quality: 85,
              format: 'jpeg'
            }),
            imageProcessingService.generateThumbnail(file.buffer, {
              width: 300,
              height: 300,
              quality: 80
            }),
            imageProcessingService.processImage(file.buffer, {
              width: 600,
              quality: 85,
              format: 'jpeg'
            })
          ]);

          // Upload all versions to S3 with item-specific folder structure
          const [optimizedResult, thumbnailResult, mediumResult] = await Promise.all([
            s3Service.uploadFile(
              optimizedImage,
              `item-${itemId}-optimized-${file.originalname}`,
              'image/jpeg',
              `inventory/${itemId}`
            ),
            s3Service.uploadFile(
              thumbnail,
              `item-${itemId}-thumb-${file.originalname}`,
              'image/jpeg',
              `thumbnails/${itemId}`
            ),
            s3Service.uploadFile(
              mediumImage,
              `item-${itemId}-medium-${file.originalname}`,
              'image/jpeg',
              `inventory/${itemId}`
            )
          ]);

          // Get image metadata
          const metadata = await imageProcessingService.getImageMetadata(file.buffer);

          uploadResults.push({
            originalName: file.originalname,
            optimizedUrl: optimizedResult.url,
            thumbnailUrl: thumbnailResult.url,
            mediumUrl: mediumResult.url,
            metadata: {
              ...metadata,
              fileSize: file.size
            },
            uploadedBy: userId,
            uploadedAt: new Date().toISOString()
          });
        } catch (fileError) {
          console.error(`Error processing file ${file.originalname}:`, fileError);
          uploadResults.push({
            originalName: file.originalname,
            error: fileError.message
          });
        }
      }

      const successfulUploads = uploadResults.filter(result => !result.error);
      const failedUploads = uploadResults.filter(result => result.error);

      res.status(200).json({
        success: true,
        data: {
          itemId,
          uploaded: successfulUploads,
          failed: failedUploads,
          totalFiles: files.length,
          successfulCount: successfulUploads.length,
          failedCount: failedUploads.length
        }
      });
    } catch (error) {
      console.error('Inventory images upload error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Delete an image from S3
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteImage(req, res) {
    try {
      const { imageKey } = req.params;

      if (!imageKey) {
        return res.status(400).json({
          success: false,
          error: 'Image key is required'
        });
      }

      const result = await s3Service.deleteFile(imageKey);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Delete image error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get image metadata from S3
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getImageMetadata(req, res) {
    try {
      const { imageKey } = req.params;

      if (!imageKey) {
        return res.status(400).json({
          success: false,
          error: 'Image key is required'
        });
      }

      const result = await s3Service.getFileMetadata(imageKey);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get image metadata error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Generate a signed URL for temporary access to a private image
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSignedUrl(req, res) {
    try {
      const { imageKey } = req.params;
      const { expiresIn = 3600 } = req.query; // Default 1 hour

      if (!imageKey) {
        return res.status(400).json({
          success: false,
          error: 'Image key is required'
        });
      }

      const signedUrl = await s3Service.getSignedUrl(imageKey, parseInt(expiresIn));

      res.status(200).json({
        success: true,
        data: {
          signedUrl,
          expiresIn: parseInt(expiresIn),
          imageKey
        }
      });
    } catch (error) {
      console.error('Get signed URL error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Process and optimize an existing image
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async processImage(req, res) {
    try {
      const file = req.file;
      const { width, height, quality, format, fit } = req.body;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided'
        });
      }

      const options = {
        width: width ? parseInt(width) : 1200,
        height: height ? parseInt(height) : null,
        quality: quality ? parseInt(quality) : 85,
        format: format || 'jpeg',
        fit: fit || 'inside'
      };

      const processedImage = await imageProcessingService.processImage(file.buffer, options);
      const metadata = await imageProcessingService.getImageMetadata(processedImage);

      res.status(200).json({
        success: true,
        data: {
          originalName: file.originalname,
          processedImage: processedImage.toString('base64'),
          metadata,
          options
        }
      });
    } catch (error) {
      console.error('Process image error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new ImageUploadController(); 