const express = require('express');
const router = express.Router();
const { verifySupabaseToken } = require('../middleware/authMiddleware');
const {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientStats
} = require('../controllers/clientController');

// All client routes require authentication
router.use(verifySupabaseToken);

// Client CRUD operations
router.get('/clients', getAllClients);
router.get('/clients/stats', getClientStats);
router.get('/clients/item/:clientId', getClientById);
router.post('/clients', createClient);
router.put('/clients/item/:clientId', updateClient);
router.delete('/clients/item/:clientId', deleteClient);

module.exports = router; 