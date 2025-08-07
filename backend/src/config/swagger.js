const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Viejos Recuerdos Inventory API',
      version: '1.0.0',
      description: 'API for managing antique store inventory with authentication and role-based access control',
      contact: {
        name: 'Viejos Recuerdos',
        url: 'https://github.com/c-beltran/viejosrecuerdos'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-production-domain.com/api' 
          : 'http://localhost:8000/api',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token from Supabase Auth'
        }
      },
      schemas: {
        Inventory: {
          type: 'object',
          required: ['itemName', 'category', 'unitPrice'],
          properties: {
            itemId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the inventory item'
            },
            itemName: {
              type: 'string',
              description: 'Name of the inventory item'
            },
            descripcionArticulo: {
              type: 'string',
              description: 'Detailed description of the item'
            },
            category: {
              type: 'string',
              enum: ['Mobiliario', 'Porcelana', 'Cristal', 'Joyeria', 'Arte', 'Libros', 'Textiles', 'Decoracion', 'Herramientas', 'Musica', 'Relojes', 'Otros'],
              description: 'Category of the item'
            },
            initialQuantity: {
              type: 'integer',
              minimum: 0,
              default: 1,
              description: 'Initial quantity when item was added'
            },
            currentQuantity: {
              type: 'integer',
              minimum: 0,
              default: 1,
              description: 'Current available quantity'
            },
            unitPrice: {
              type: 'number',
              minimum: 0,
              description: 'Price per unit'
            },
            totalPrice: {
              type: 'number',
              minimum: 0,
              description: 'Total value (calculated: unitPrice * currentQuantity)'
            },
            status: {
              type: 'string',
              enum: ['Available', 'Sold-Out'],
              default: 'Available',
              description: 'Current status of the item'
            },
            internalNotes: {
              type: 'string',
              description: 'Internal notes about the item'
            },
            imageUrls: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri'
              },
              default: [],
              description: 'Array of image URLs for the item'
            },
            qrCodeUrl: {
              type: 'string',
              format: 'uri',
              description: 'URL to the QR code image for this item'
            },
            lastModifiedBy: {
              type: 'string',
              format: 'uuid',
              description: 'User ID who last modified the item'
            },
            createDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date when item was created'
            },
            updatedDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date when item was last updated'
            }
          }
        },
        Category: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Category name'
            },
            description: {
              type: 'string',
              description: 'Category description'
            }
          }
        },
        Client: {
          type: 'object',
          properties: {
            clientId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the client'
            },
            name: {
              type: 'string',
              description: 'Full name of the client'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the client'
            },
            phone: {
              type: 'string',
              description: 'Phone number of the client'
            },
            address: {
              type: 'string',
              description: 'Address of the client'
            },
            notes: {
              type: 'string',
              description: 'Additional notes about the client'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date when client was created'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date when client was last updated'
            },
            lastModifiedBy: {
              type: 'string',
              format: 'uuid',
              description: 'User ID who last modified the client'
            }
          }
        },
        Sale: {
          type: 'object',
          properties: {
            saleId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the sale'
            },
            clientId: {
              type: 'string',
              format: 'uuid',
              description: 'Client ID (optional)'
            },
            client: {
              $ref: '#/components/schemas/Client'
            },
            saleDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date and time of the sale'
            },
            totalAmount: {
              type: 'number',
              description: 'Total amount of the sale'
            },
            paymentMethod: {
              type: 'string',
              enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Check'],
              description: 'Payment method used'
            },
            status: {
              type: 'string',
              enum: ['Pending', 'Completed', 'Cancelled', 'Refunded'],
              description: 'Status of the sale'
            },
            notes: {
              type: 'string',
              description: 'Additional notes about the sale'
            },
            createdBy: {
              type: 'string',
              format: 'uuid',
              description: 'User ID who created the sale'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date when sale was created'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date when sale was last updated'
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/SaleItem'
              },
              description: 'Items in the sale'
            }
          }
        },
        SaleItem: {
          type: 'object',
          properties: {
            saleItemId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the sale item'
            },
            saleId: {
              type: 'string',
              format: 'uuid',
              description: 'Sale ID this item belongs to'
            },
            itemId: {
              type: 'string',
              format: 'uuid',
              description: 'Inventory item ID'
            },
            inventory: {
              $ref: '#/components/schemas/Inventory'
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              description: 'Quantity sold'
            },
            unitPrice: {
              type: 'number',
              minimum: 0,
              description: 'Unit price at time of sale'
            },
            totalPrice: {
              type: 'number',
              minimum: 0,
              description: 'Total price for this item (quantity * unitPrice)'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date when sale item was created'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            status: {
              type: 'integer',
              description: 'HTTP status code'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/routes/inventoryRoutes.js',
    './src/routes/qrRoutes.js',
    './src/routes/clientRoutes.js',
    './src/routes/salesRoutes.js',
    './src/routes/imageRoutes.js',
    './src/controllers/inventoryController.js',
    './src/controllers/qrController.js',
    './src/controllers/clientController.js',
    './src/controllers/salesController.js',
    './src/controllers/imageController.js'
  ]
};

const specs = swaggerJsdoc(options);

// Debug: Log the specs to see if they're being generated
console.log('🔍 Swagger specs generated:', Object.keys(specs.paths || {}).length, 'endpoints found');
console.log('📋 Available endpoints:', Object.keys(specs.paths || {}));

module.exports = specs; 