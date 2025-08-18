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

    // Generate QR code URL - now points to frontend public view
    const qrCodeUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/qr/${itemId}`;
    
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
 *     description: Public endpoint that serves a complete HTML page with item details when QR code is scanned
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
 *         description: Complete HTML page with item details
 *         content:
 *           text/html:
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

    // Serve a complete HTML page with the item details
    const item = result.data;
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${item.itemName} - Viejos Recuerdos</title>
    <link rel="icon" type="image/x-icon" href="/favicon_io/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="/favicon_io/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon_io/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon_io/favicon-16x16.png">
    <link rel="manifest" href="/favicon_io/site.webmanifest">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .loading-spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        /* Custom scrollbar for image carousel */
        .overflow-x-auto::-webkit-scrollbar {
            height: 6px;
        }
        .overflow-x-auto::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-8">
        <!-- Header -->
        <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-gray-800 mb-2">Viejos Recuerdos</h1>
            <p class="text-gray-600">Antique Collection</p>
        </div>

        <!-- Item Details -->
        <div class="bg-white rounded-2xl shadow-lg p-8">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <!-- Image Gallery -->
                <div class="space-y-4">
                    <div class="relative">
                        <img id="mainImage" src="${item.imageUrls[0]?.url || ''}" alt="${item.itemName}" 
                             class="w-full h-96 object-cover rounded-xl shadow-md" style="object-fit: contain !important;">
                    </div>
                    ${item.imageUrls.length > 1 ? `
                    <div class="flex space-x-2 overflow-x-auto pb-2">
                        ${item.imageUrls.map((img, index) => `
                        <img src="${img.url}" alt="${item.itemName}" 
                             class="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors ${index === 0 ? 'border-blue-500' : ''}"
                             onclick="changeMainImage('${img.url}', this)">
                        `).join('')}
                    </div>
                    ` : ''}
                </div>

                <!-- Item Information -->
                <div class="space-y-6">
                    <div>
                        <div class="flex items-center gap-3 mb-4">
                            <span class="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                ${item.category}
                            </span>
                            <span class="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                ID: ${item.friendlyId}
                            </span>
                        </div>
                        <h2 class="text-3xl font-bold text-gray-800 mb-4">${item.itemName}</h2>
                        ${item.descripcionArticulo ? `<p class="text-gray-600 text-lg">${item.descripcionArticulo}</p>` : ''}
                    </div>

                    <div class="bg-gray-50 rounded-xl p-6">
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-gray-600">Price</span>
                            <span class="text-3xl font-bold text-gray-800">$${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Status</span>
                            <span class="px-3 py-1 rounded-full text-sm font-medium ${
                                item.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }">${item.status}</span>
                        </div>
                    </div>

                    <div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <h3 class="font-semibold text-blue-800 mb-2">Interested in this item?</h3>
                        <p class="text-blue-700 text-sm">Visit our antique shop to see this beautiful piece in person.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="text-center mt-12 text-gray-500">
            <p>Scanned via QR Code • Viejos Recuerdos Antique Shop</p>
        </div>
    </div>

    <script>
        function changeMainImage(imageUrl, thumbnailElement) {
            // Update main image
            document.getElementById('mainImage').src = imageUrl;
            
            // Update thumbnail borders
            const thumbnails = document.querySelectorAll('.overflow-x-auto img');
            thumbnails.forEach(thumb => {
                thumb.classList.remove('border-blue-500');
                thumb.classList.add('border-gray-200');
            });
            
            // Highlight selected thumbnail
            thumbnailElement.classList.remove('border-gray-200');
            thumbnailElement.classList.add('border-blue-500');
        }
    </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
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