const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('../config/swagger');

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({status: 'OK', timestamp: new Date().toISOString()});  
});

// Swagger documentation
router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(swaggerSpecs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Viejos Recuerdos API Documentation'
}));

// Serve Swagger JSON directly
router.get('/docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpecs);
});

// API routes
router.use('/auth', require('./authRoutes'));
router.use('/qr', require('./qrRoutes')); // Register QR routes first
router.use('/', require('./inventoryRoutes')); // Register inventory routes
router.use('/', require('./clientRoutes')); // Register client routes
router.use('/', require('./salesRoutes')); // Register sales routes
router.use('/', require('./imageRoutes')); // Register image routes
router.use('/installments', require('./installmentRoutes')); // Register installment routes

module.exports = router;