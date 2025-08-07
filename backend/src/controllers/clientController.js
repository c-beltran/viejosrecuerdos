const clientService = require('../services/clientServiceSupabase');

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Get all clients
 *     description: Retrieve a list of all clients with optional filtering and pagination
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in client name, email, or phone
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by exact email
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of clients to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of clients to skip
 *     responses:
 *       200:
 *         description: List of clients
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
 *                     $ref: '#/components/schemas/Client'
 *                 count:
 *                   type: integer
 *                   description: Total number of clients
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
const getAllClients = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      email: req.query.email,
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0
    };

    const result = await clientService.getAllClients(filters);
    
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
 * /clients/item/{clientId}:
 *   get:
 *     summary: Get client by ID
 *     description: Retrieve a specific client by their ID
 *     tags: [Clients]
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
 *         description: Client details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *       404:
 *         description: Client not found
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
const getClientById = async (req, res) => {
  try {
    const { clientId } = req.params;
    const result = await clientService.getClientById(clientId);
    
    if (!result.success) {
      const statusCode = result.error === 'Client not found' ? 404 : 500;
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
 * /clients:
 *   post:
 *     summary: Create a new client
 *     description: Create a new client with the provided information
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the client
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the client
 *               phone:
 *                 type: string
 *                 description: Phone number of the client
 *               address:
 *                 type: string
 *                 description: Address of the client
 *               notes:
 *                 type: string
 *                 description: Additional notes about the client
 *     responses:
 *       201:
 *         description: Client created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - email already exists
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
const createClient = async (req, res) => {
  try {
    const clientData = req.body;
    const userId = req.user.id;

    // Basic validation
    if (!clientData.name || clientData.name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Client name is required'
      });
    }

    const result = await clientService.createClient(clientData, userId);
    
    if (!result.success) {
      const statusCode = result.error.includes('already exists') ? 409 : 500;
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
 * /clients/item/{clientId}:
 *   put:
 *     summary: Update a client
 *     description: Update an existing client with the provided data
 *     tags: [Clients]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the client
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the client
 *               phone:
 *                 type: string
 *                 description: Phone number of the client
 *               address:
 *                 type: string
 *                 description: Address of the client
 *               notes:
 *                 type: string
 *                 description: Additional notes about the client
 *     responses:
 *       200:
 *         description: Client updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Client not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - email already exists
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
const updateClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    // Basic validation
    if (updateData.name && updateData.name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Client name cannot be empty'
      });
    }

    const result = await clientService.updateClient(clientId, updateData, userId);
    
    if (!result.success) {
      const statusCode = result.error === 'Client not found' ? 404 : 
                        result.error.includes('already exists') ? 409 : 500;
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
 * /clients/item/{clientId}:
 *   delete:
 *     summary: Delete a client
 *     description: Permanently delete a client
 *     tags: [Clients]
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
 *         description: Client deleted successfully
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
 *         description: Client not found
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
const deleteClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const result = await clientService.deleteClient(clientId);
    
    if (!result.success) {
      const statusCode = result.error === 'Client not found' ? 404 : 500;
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
 * /clients/stats:
 *   get:
 *     summary: Get client statistics
 *     description: Retrieve client statistics including counts and trends
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Client statistics
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
 *                     totalClients:
 *                       type: integer
 *                       description: Total number of clients
 *                     newClientsLast30Days:
 *                       type: integer
 *                       description: Number of new clients in the last 30 days
 *                     averageClientsPerDay:
 *                       type: number
 *                       description: Average number of new clients per day
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const getClientStats = async (req, res) => {
  try {
    const result = await clientService.getClientStats();
    
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
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientStats
}; 