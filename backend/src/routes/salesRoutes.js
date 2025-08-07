const express = require('express');
const router = express.Router();
const { verifySupabaseToken } = require('../middleware/authMiddleware');
const {
  getAllSales,
  getSaleById,
  createSale,
  updateSaleStatus,
  getSalesStats,
  getSalesByClient
} = require('../controllers/salesController');

// All sales routes require authentication
router.use(verifySupabaseToken);

// Sales CRUD operations
router.get('/sales', getAllSales);
router.get('/sales/stats', getSalesStats);
router.get('/sales/item/:saleId', getSaleById);
router.post('/sales', createSale);
router.put('/sales/item/:saleId/status', updateSaleStatus);
router.get('/sales/client/:clientId', getSalesByClient);

module.exports = router; 