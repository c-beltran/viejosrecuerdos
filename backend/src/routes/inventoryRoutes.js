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
router.get('/inventory', getAllItems); // Public read access for inventory listing

// Protected routes (authentication required)
router.use(verifySupabaseToken);

// Inventory CRUD operations - be more specific to avoid conflicts
router.get('/inventory/stats', getInventoryStats);
router.get('/inventory/item/:itemId', getItemById); // Changed from /inventory/:itemId to /inventory/item/:itemId
router.get('/inventory/friendly/:friendlyId', getItemByFriendlyId); // Get item by friendly ID
router.post('/inventory', createItem);
router.put('/inventory/item/:itemId', updateItem); // Changed from /inventory/:itemId to /inventory/item/:itemId
router.delete('/inventory/item/:itemId', deleteItem); // Changed from /inventory/:itemId to /inventory/item/:itemId

module.exports = router; 