const inventoryService = require('../services/inventoryServiceSupabase');
const QRCode = require('qrcode');

/**
 * @swagger
 * /qr/{itemId}:
 *   get:
 *     summary: Get QR code for an item
 *     description: Generate and return QR code image for an inventory item
 *     tags: [QR Codes]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique identifier of the inventory item
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 200
 *         description: Size of QR code in pixels
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [png, svg, pdf]
 *           default: png
 *         description: Output format of QR code
 *     responses:
 *       200:
 *         description: QR code image
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *           image/svg+xml:
 *             schema:
 *               type: string
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
const getQRCode = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { size = 200, format = 'png' } = req.query;

    // Verify item exists
    const itemResult = await inventoryService.getItemById(itemId);
    if (!itemResult.success) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    // Generate QR code URL
    const qrCodeUrl = `${process.env.FRONTEND_URL || 'http://localhost:8000'}/api/qr/${itemId}/view`;
    
    // Generate QR code based on format
    if (format === 'svg') {
      const svg = await QRCode.toString(qrCodeUrl, {
        type: 'svg',
        width: size,
        margin: 2
      });
      
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      return res.send(svg);
    } else if (format === 'pdf') {
      const pdf = await QRCode.toFile(qrCodeUrl, {
        type: 'pdf',
        width: size,
        margin: 2
      });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.send(pdf);
    } else {
      // Default PNG format
      const pngBuffer = await QRCode.toBuffer(qrCodeUrl, {
        type: 'png',
        width: size,
        margin: 2
      });
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      return res.send(pngBuffer);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @swagger
 * /qr/{itemId}/view:
 *   get:
 *     summary: View item details via QR code
 *     description: Public endpoint to view item details when QR code is scanned
 *     tags: [QR Codes]
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
 *         description: Item details (read-only)
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
 */
const getItemByQR = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const result = await inventoryService.getItemById(itemId);
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    // Return read-only item data (no sensitive information)
    const publicItem = {
      itemId: result.data.itemId,
      itemName: result.data.itemName,
      descripcionArticulo: result.data.descripcionArticulo,
      category: result.data.category,
      unitPrice: result.data.unitPrice,
      status: result.data.status,
      imageUrls: result.data.imageUrls
    };

    res.status(200).json({
      success: true,
      data: publicItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getQRCode,
  getItemByQR
}; 