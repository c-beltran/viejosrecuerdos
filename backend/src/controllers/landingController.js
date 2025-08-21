/**
 * Landing Page Controller
 * 
 * Features:
 * - Get featured items for landing page (up to 12 per section)
 * - Update featured items with section and order management
 * - Validation for landing_page_order (1-12) and landing_page_section (1-2)
 * - Swagger documentation for API endpoints
 */
const inventoryService = require('../services/inventoryServiceSupabase');

/**
 * @swagger
 * /landing/featured-items:
 *   get:
 *     summary: Get featured items for landing page
 *     description: Retrieve items marked as featured for display on the landing page, organized by carousel sections
 *     tags: [Landing Page]
 *     responses:
 *       200:
 *         description: Featured items organized by sections
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
 *                     section1:
 *                       type: array
 *                       description: Items for first carousel (12 items max)
 *                       items:
 *                         $ref: '#/components/schemas/InventoryItem'
 *                     section2:
 *                       type: array
 *                       description: Items for second carousel (12 items max)
 *                       items:
 *                         $ref: '#/components/schemas/InventoryItem'
 *                     section3:
 *                       type: array
 *                       description: Items for third carousel (12 items max)
 *                       items:
 *                         $ref: '#/components/schemas/InventoryItem'
 *                     section4:
 *                       type: array
 *                       description: Items for fourth carousel (12 items max)
 *                       items:
 *                         $ref: '#/components/schemas/InventoryItem'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const getFeaturedItems = async (req, res) => {
  try {
    const result = await inventoryService.getFeaturedItems();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to fetch featured items'
      });
    }
  } catch (error) {
    console.error('Error fetching featured items:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @swagger
 * /landing/featured-items:
 *   put:
 *     summary: Update featured items for landing page
 *     description: Update which items are featured on the landing page and their order in carousel sections
 *     tags: [Landing Page]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               featuredItems:
 *                 type: array
 *                 description: Array of items with their section and order
 *                 items:
 *                   type: object
 *                   properties:
 *                     itemId:
 *                       type: string
 *                       format: uuid
 *                       description: Unique identifier of the inventory item
 *                     featured_on_landing:
 *                       type: boolean
 *                       description: Whether this item should be featured
 *                     landing_page_section:
 *                       type: integer
 *                       enum: [1, 2, 3, 4]
 *                       description: Which carousel section (1, 2, 3, or 4)
 *                     landing_page_order:
 *                       type: integer
 *                       minimum: 1
 *                       maximum: 12
 *                       description: Order within the section (1-12)
 *     responses:
 *       200:
 *         description: Featured items updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request data
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
const updateFeaturedItems = async (req, res) => {
  try {
    const { featuredItems } = req.body;
    
    if (!featuredItems || !Array.isArray(featuredItems)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data: featuredItems array is required'
      });
    }
    
    // Validate the data structure
    for (const item of featuredItems) {
      if (!item.itemId || typeof item.featured_on_landing !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'Invalid item data: itemId and featured_on_landing are required'
        });
      }
      
      if (item.featured_on_landing) {
                 if (!item.landing_page_section || ![1, 2, 3, 4].includes(item.landing_page_section)) {
           return res.status(400).json({
             success: false,
             error: 'Featured items must have landing_page_section set to 1, 2, 3, or 4'
           });
         }
        
        if (!item.landing_page_order || item.landing_page_order < 1 || item.landing_page_order > 12) {
          return res.status(400).json({
            success: false,
            error: 'Featured items must have landing_page_order between 1 and 12'
          });
        }
      }
    }
    
    const result = await inventoryService.updateFeaturedItems(featuredItems);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Featured items updated successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to update featured items'
      });
    }
  } catch (error) {
    console.error('Error updating featured items:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getFeaturedItems,
  updateFeaturedItems
};
