const express = require('express');
const router = express.Router();
const { verifySupabaseToken } = require('../middleware/authMiddleware');
const {
  getAllItems,
  getItemById,
  getItemByFriendlyId,
  createItem,
  updateItem,
  deleteItem,
  getInventoryStats,
  getCategories,
  uploadImage
} = require('../controllers/inventoryController');

// Public routes (no authentication required)
router.get('/categories', getCategories);

// Protected routes (authentication required)
router.use(verifySupabaseToken);

// All inventory operations now require authentication
router.get('/inventory', getAllItems); // Back to original path

// Inventory CRUD operations - be more specific to avoid conflicts
router.get('/inventory/stats', getInventoryStats);
router.get('/inventory/item/:itemId', getItemById);
router.get('/inventory/friendly/:friendlyId', getItemByFriendlyId); // Get item by friendly ID
router.post('/inventory', createItem);
router.put('/inventory/item/:itemId', updateItem);
router.delete('/inventory/item/:itemId', deleteItem);

module.exports = router; 