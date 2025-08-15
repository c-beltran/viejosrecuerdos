const inventoryService = require('../services/inventoryServiceSupabase');
const { getAllCategories } = require('../utils/categories');

/**
 * @swagger
 * /inventory:
 *   get:
 *     summary: Get all inventory items
 *     description: Retrieve all inventory items with optional filtering and pagination
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Mobiliario, Porcelana, Cristal, Joyeria, Arte, Libros, Textiles, Decoracion, Herramientas, Musica, Relojes, Otros]
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Available, Sold-Out]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in item name and description
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of items to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *       - in: query
 *         name: includeQR
 *         schema:
 *           type: boolean
 *         description: Include QR code URLs in response (generated on-demand)
 *     responses:
 *       200:
 *         description: List of inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Inventory'
 *       401:
 *         description: Unauthorized
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
const getAllItems = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      status: req.query.status,
      search: req.query.search,
      friendlyId: req.query.friendlyId, // Search by friendly ID
      includeQR: req.query.includeQR === 'true',
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0
    };

    const result = await inventoryService.getAllItems(filters);
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @swagger
 * /inventory/item/{itemId}:
 *   get:
 *     summary: Get inventory item by ID
 *     description: Retrieve a specific inventory item by its ID
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique identifier of the inventory item
 *     responses:
 *       200:
 *         description: Inventory item details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Inventory'
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
const getItemById = async (req, res) => {
  try {
    const { itemId } = req.params;
    const result = await inventoryService.getItemById(itemId);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    const statusCode = error.message === 'Item not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @swagger
 * /inventory/friendly/{friendlyId}:
 *   get:
 *     summary: Get inventory item by friendly ID
 *     description: Retrieve a specific inventory item by its friendly ID (e.g., M0001, P0001)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendlyId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[MPCJALTDHURXO][0-9]{4}$'
 *         description: Human-readable friendly ID of the inventory item
 *     responses:
 *       200:
 *         description: Inventory item details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Inventory'
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
const getItemByFriendlyId = async (req, res) => {
  try {
    const { friendlyId } = req.params;
    const result = await inventoryService.getItemByFriendlyId(friendlyId);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    const statusCode = error.message === 'Item not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @swagger
 * /inventory:
 *   post:
 *     summary: Create a new inventory item
 *     description: Create a new inventory item with the provided data
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemName
 *               - category
 *               - unitPrice
 *             properties:
 *               itemName:
 *                 type: string
 *                 description: Name of the inventory item
 *               descripcionArticulo:
 *                 type: string
 *                 description: Detailed description of the item
 *               category:
 *                 type: string
 *                 enum: [Mobiliario, Porcelana, Cristal, Joyeria, Arte, Libros, Textiles, Decoracion, Herramientas, Musica, Relojes, Otros]
 *                 description: Category of the item
 *               initialQuantity:
 *                 type: integer
 *                 minimum: 0
 *                 default: 1
 *                 description: Initial quantity when item was added
 *               currentQuantity:
 *                 type: integer
 *                 minimum: 0
 *                 default: 1
 *                 description: Current available quantity
 *               unitPrice:
 *                 type: number
 *                 minimum: 0
 *                 description: Price per unit
 *               internalNotes:
 *                 type: string
 *                 description: Internal notes about the item
 *               imageUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 description: Array of image URLs for the item
 *     responses:
 *       201:
 *         description: Inventory item created successfully
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
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
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
const createItem = async (req, res) => {
  try {
    const itemData = req.body;
    const userId = req.user.id;
    
    const newItem = await inventoryService.createItem(itemData, userId);
    
    res.status(201).json({
      success: true,
      data: newItem
    });
  } catch (error) {
    const statusCode = error.message.includes('Invalid category') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @swagger
 * /inventory/item/{itemId}:
 *   put:
 *     summary: Update an inventory item
 *     description: Update an existing inventory item with the provided data
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique identifier of the inventory item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemName:
 *                 type: string
 *                 description: Name of the inventory item
 *               descripcionArticulo:
 *                 type: string
 *                 description: Detailed description of the item
 *               category:
 *                 type: string
 *                 enum: [Mobiliario, Porcelana, Cristal, Joyeria, Arte, Libros, Textiles, Decoracion, Herramientas, Musica, Relojes, Otros]
 *                 description: Category of the item
 *               initialQuantity:
 *                 type: integer
 *                 minimum: 0
 *                 description: Initial quantity when item was added
 *               currentQuantity:
 *                 type: integer
 *                 minimum: 0
 *                 description: Current available quantity
 *               unitPrice:
 *                 type: number
 *                 minimum: 0
 *                 description: Price per unit
 *               internalNotes:
 *                 type: string
 *                 description: Internal notes about the item
 *               imageUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 description: Array of image URLs for the item
 *     responses:
 *       200:
 *         description: Inventory item updated successfully
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
const updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const updateData = req.body;
    const userId = req.user.id;
    
    const updatedItem = await inventoryService.updateItem(itemId, updateData, userId);
    
    res.status(200).json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    let statusCode = 500;
    if (error.message === 'Item not found') statusCode = 404;
    if (error.message.includes('Invalid category')) statusCode = 400;
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @swagger
 * /inventory/item/{itemId}:
 *   delete:
 *     summary: Delete an inventory item
 *     description: Permanently delete an inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique identifier of the inventory item
 *     responses:
 *       200:
 *         description: Inventory item deleted successfully
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
const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const result = await inventoryService.deleteItem(itemId);
    
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    const statusCode = error.message === 'Item not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @swagger
 * /inventory/stats:
 *   get:
 *     summary: Get inventory statistics
 *     description: Retrieve inventory statistics including counts, values, and category distribution
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory statistics
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
 *                     totalItems:
 *                       type: integer
 *                       description: Total number of inventory items
 *                     availableItems:
 *                       type: integer
 *                       description: Number of available items
 *                     soldOutItems:
 *                       type: integer
 *                       description: Number of sold out items
 *                     totalValue:
 *                       type: number
 *                       description: Total value of all inventory
 *                     categoryDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                           count:
 *                             type: integer
 *       401:
 *         description: Unauthorized
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
const getInventoryStats = async (req, res) => {
  try {
    const stats = await inventoryService.getInventoryStats();
    
    res.status(200).json({
      success: true,
      data: stats
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
 * /categories:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve all available inventory categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const getCategories = async (req, res) => {
  try {
    const categories = getAllCategories();
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  getItemByFriendlyId,
  createItem,
  updateItem,
  deleteItem,
  getInventoryStats,
  getCategories
}; 