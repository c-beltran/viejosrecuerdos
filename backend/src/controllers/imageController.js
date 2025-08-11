const imageService = require('../services/imageService');
const inventoryService = require('../services/inventoryServiceSupabase');
const { isS3Configured } = require('../config/aws');

/**
 * @swagger
 * /images/upload/{itemId}:
 *   post:
 *     summary: Upload single image for inventory item
 *     description: Upload and process a single image for an inventory item
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Inventory item ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     original:
 *                       type: string
 *                       description: URL of original image
 *                     medium:
 *                       type: string
 *                       description: URL of medium size image
 *                     thumbnail:
 *                       type: string
 *                       description: URL of thumbnail image
 *                     fileName:
 *                       type: string
 *                       description: Generated filename
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const uploadSingleImage = async (req, res) => {
  try {
    // Check if S3 is configured
    if (!isS3Configured()) {
      return res.status(500).json({
        success: false,
        error: 'AWS S3 is not configured. Please check your environment variables.'
      });
    }

    const { itemId } = req.params;
    const userId = req.user.id;

    // Check if item exists
    const itemResult = await inventoryService.getItemById(itemId);
    if (!itemResult.success) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    // Process and upload image
    const result = await imageService.processAndUploadImage(req.file, itemId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    // Update inventory item with new image URLs
    const currentImages = itemResult.data.imageUrls || [];
    const newImageData = result.data; // Already in simplified format
    
    const updatedImages = [...currentImages, newImageData];
    
    const updateResult = await inventoryService.updateItem(itemId, {
      imageUrls: updatedImages
    }, userId);

    if (!updateResult.success) {
      return res.status(500).json(updateResult);
    }

    res.status(200).json({
      success: true,
      data: {
        image: newImageData,
        item: updateResult.data
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @swagger
 * /images/upload-multiple/{itemId}:
 *   post:
 *     summary: Upload multiple images for inventory item
 *     description: Upload and process multiple images for an inventory item
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Inventory item ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Multiple image files to upload (max 10)
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           original:
 *                             type: string
 *                           medium:
 *                             type: string
 *                           thumbnail:
 *                             type: string
 *                           fileName:
 *                             type: string
 *                     item:
 *                       $ref: '#/components/schemas/Inventory'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const uploadMultipleImages = async (req, res) => {
  try {
    // Check if S3 is configured
    if (!isS3Configured()) {
      return res.status(500).json({
        success: false,
        error: 'AWS S3 is not configured. Please check your environment variables.'
      });
    }

    const { itemId } = req.params;
    const userId = req.user.id;

    // Check if item exists
    const itemResult = await inventoryService.getItemById(itemId);
    if (!itemResult.success) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    // Process and upload multiple images
    const result = await imageService.processMultipleImages(req.files, itemId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    // Update inventory item with new image URLs
    const currentImages = itemResult.data.imageUrls || [];
    const newImagesData = result.data; // Already in simplified format
    
    const updatedImages = [...currentImages, ...newImagesData];
    
    const updateResult = await inventoryService.updateItem(itemId, {
      imageUrls: updatedImages
    }, userId);

    if (!updateResult.success) {
      return res.status(500).json(updateResult);
    }

    res.status(200).json({
      success: true,
      data: {
        images: newImagesData,
        item: updateResult.data
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @swagger
 * /images/delete/{itemId}/{imageIndex}:
 *   delete:
 *     summary: Delete image from inventory item
 *     description: Delete a specific image from an inventory item
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Inventory item ID
 *       - in: path
 *         name: imageIndex
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Index of the image to delete
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Item or image not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const deleteImage = async (req, res) => {
  try {
    const { itemId, imageIndex } = req.params;
    const userId = req.user.id;

    // Check if item exists
    const itemResult = await inventoryService.getItemById(itemId);
    if (!itemResult.success) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    const currentImages = itemResult.data.imageUrls || [];
    const index = parseInt(imageIndex);

    if (index < 0 || index >= currentImages.length) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    // Delete image from S3
    const imageToDelete = currentImages[index];
    const deleteResult = await imageService.deleteImages(imageToDelete, itemId);
    
    if (!deleteResult.success) {
      return res.status(500).json(deleteResult);
    }

    // Remove image from inventory item
    const updatedImages = currentImages.filter((_, i) => i !== index);
    
    const updateResult = await inventoryService.updateItem(itemId, {
      imageUrls: updatedImages
    }, userId);

    if (!updateResult.success) {
      return res.status(500).json(updateResult);
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: {
        item: updateResult.data
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @swagger
 * /images/reorder/{itemId}:
 *   put:
 *     summary: Reorder images for inventory item
 *     description: Change the order of images for an inventory item
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Inventory item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageOrder
 *             properties:
 *               imageOrder:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of image indices in new order
 *     responses:
 *       200:
 *         description: Images reordered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Inventory'
 *       400:
 *         description: Bad request - invalid order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const reorderImages = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { imageOrder } = req.body;
    const userId = req.user.id;

    // Check if item exists
    const itemResult = await inventoryService.getItemById(itemId);
    if (!itemResult.success) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    const currentImages = itemResult.data.imageUrls || [];

    // Validate image order
    if (!Array.isArray(imageOrder) || imageOrder.length !== currentImages.length) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image order array'
      });
    }

    // Check if all indices are valid
    const validIndices = imageOrder.every(index => 
      Number.isInteger(index) && index >= 0 && index < currentImages.length
    );

    if (!validIndices) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image indices in order array'
      });
    }

    // Reorder images
    const reorderedImages = imageOrder.map(index => currentImages[index]);
    
    const updateResult = await inventoryService.updateItem(itemId, {
      imageUrls: reorderedImages
    }, userId);

    if (!updateResult.success) {
      return res.status(500).json(updateResult);
    }

    res.status(200).json({
      success: true,
      data: {
        item: updateResult.data
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
  reorderImages
}; 