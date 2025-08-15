const salesService = require('../services/salesServiceSupabase');

/**
 * @swagger
 * /sales:
 *   get:
 *     summary: Get all sales
 *     description: Retrieve a list of all sales with optional filtering
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by client ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Completed, Cancelled, Refunded]
 *         description: Filter by sale status
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [Cash, Credit Card, Debit Card, Bank Transfer, Check]
 *         description: Filter by payment method
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter sales from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter sales until this date
 *     responses:
 *       200:
 *         description: List of sales
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
 *                     $ref: '#/components/schemas/Sale'
 *                 count:
 *                   type: integer
 *                   description: Total number of sales
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
const getAllSales = async (req, res) => {
  try {
    const filters = {
      clientId: req.query.clientId,
      status: req.query.status,
      paymentMethod: req.query.paymentMethod,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const result = await salesService.getAllSales(filters);
    
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
 * /sales/item/{saleId}:
 *   get:
 *     summary: Get sale by ID
 *     description: Retrieve a specific sale with all its details
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: saleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique identifier of the sale
 *     responses:
 *       200:
 *         description: Sale details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Sale'
 *       404:
 *         description: Sale not found
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
const getSaleById = async (req, res) => {
  try {
    const { saleId } = req.params;
    const result = await salesService.getSaleById(saleId);
    
    if (!result.success) {
      const statusCode = result.error === 'Sale not found' ? 404 : 500;
      return res.status(statusCode).json(result);
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
 * /sales:
 *   post:
 *     summary: Create a new sale
 *     description: Create a new sale with one or multiple items
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - itemId
 *                     - quantity
 *                   properties:
 *                     itemId:
 *                       type: string
 *                       format: uuid
 *                       description: Inventory item ID
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       description: Quantity to sell
 *                     unitPrice:
 *                       type: number
 *                       minimum: 0
 *                       description: Unit price (optional, uses inventory price if not provided)
 *               clientId:
 *                 type: string
 *                 format: uuid
 *                 description: Client ID (optional)
 *               paymentMethod:
 *                 type: string
 *                 enum: [Cash, Credit Card, Debit Card, Bank Transfer, Check]
 *                 default: Cash
 *                 description: Payment method
 *               notes:
 *                 type: string
 *                 description: Additional notes about the sale
 *     responses:
 *       201:
 *         description: Sale created successfully
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
 *                     sale:
 *                       $ref: '#/components/schemas/Sale'
 *                     items:
 *                       type: array
 *                         $ref: '#/components/schemas/SaleItem'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Item not found or insufficient quantity
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
const createSale = async (req, res) => {
  try {
    const saleData = req.body;
    const userId = req.user.id;

    // Basic validation
    if (!saleData.items || !Array.isArray(saleData.items) || saleData.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one item is required for a sale'
      });
    }

    // Validate each item
    for (const item of saleData.items) {
      if (!item.itemId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Each item must have itemId and quantity greater than 0'
        });
      }
    }

    const result = await salesService.createSale(saleData, userId);
    
    if (!result.success) {
      const statusCode = result.error.includes('not found') || result.error.includes('Insufficient quantity') ? 404 : 500;
      return res.status(statusCode).json(result);
    }
    
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @swagger
 * /sales/item/{saleId}/status:
 *   put:
 *     summary: Update sale status
 *     description: Update the status of a sale (e.g., cancel, refund)
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: saleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique identifier of the sale
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Completed, Cancelled, Refunded]
 *                 description: New status for the sale
 *     responses:
 *       200:
 *         description: Sale status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Sale'
 *       404:
 *         description: Sale not found
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
const updateSaleStatus = async (req, res) => {
  try {
    const { saleId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    const result = await salesService.updateSaleStatus(saleId, status, userId);
    
    if (!result.success) {
      const statusCode = result.error === 'Sale not found' ? 404 : 500;
      return res.status(statusCode).json(result);
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
 * /sales/stats:
 *   get:
 *     summary: Get sales statistics
 *     description: Retrieve sales statistics and analytics
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics (optional)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics (optional)
 *     responses:
 *       200:
 *         description: Sales statistics
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
 *                     totalSales:
 *                       type: integer
 *                       description: Total number of sales
 *                     totalRevenue:
 *                       type: number
 *                       description: Total revenue
 *                     completedSales:
 *                       type: integer
 *                       description: Number of completed sales
 *                     cancelledSales:
 *                       type: integer
 *                       description: Number of cancelled sales
 *                     averageSaleValue:
 *                       type: number
 *                       description: Average sale value
 *                     paymentMethods:
 *                       type: object
 *                       description: Breakdown by payment method
 *                     monthlyRevenue:
 *                       type: object
 *                       description: Monthly revenue for last 12 months
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const getSalesStats = async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const result = await salesService.getSalesStats(filters);
    
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
 * /sales/{saleId}:
 *   put:
 *     summary: Update sale details
 *     description: Update an existing sale with new information
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: saleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique identifier of the sale
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId:
 *                 type: string
 *                 format: uuid
 *                 description: Client ID (optional)
 *               saleDate:
 *                 type: string
 *                 format: date-time
 *                 description: Sale date
 *               totalAmount:
 *                 type: number
 *                 description: Total sale amount
 *               paymentMethod:
 *                 type: string
 *                 enum: [Cash, Credit Card, Debit Card, Bank Transfer, Check]
 *                 description: Payment method
 *               status:
 *                 type: string
 *                 enum: [Pending, Completed, Cancelled, Refunded]
 *                 description: Sale status
 *               notes:
 *                 type: string
 *                 description: Additional notes about the sale
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/SaleItem'
 *                 description: Sale items
 *     responses:
 *       200:
 *         description: Sale updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Sale'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Sale not found
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
const updateSale = async (req, res) => {
  try {
    const { saleId } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    // Basic validation
    if (!saleId) {
      return res.status(400).json({
        success: false,
        error: 'Sale ID is required'
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Update data is required'
      });
    }

    const result = await salesService.updateSale(saleId, updateData, userId);
    
    if (!result.success) {
      const statusCode = result.error.includes('not found') ? 404 : 500;
      return res.status(statusCode).json(result);
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
 * /sales/client/{clientId}:
 *   get:
 *     summary: Get sales by client
 *     description: Retrieve all sales for a specific client
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique identifier of the client
 *     responses:
 *       200:
 *         description: Client sales history
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
 *                     $ref: '#/components/schemas/Sale'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const getSalesByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const result = await salesService.getSalesByClient(clientId);
    
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

module.exports = {
  getAllSales,
  getSaleById,
  createSale,
  updateSale,
  updateSaleStatus,
  getSalesStats,
  getSalesByClient
}; 