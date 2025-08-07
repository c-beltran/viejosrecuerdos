# Viejos Recuerdos Inventory API

## Overview

This API provides comprehensive inventory management functionality for the Viejos Recuerdos antique store, including CRUD operations, QR code generation, and role-based access control.

## Base URL

- **Development**: `http://localhost:8000/api`
- **Production**: `https://your-production-domain.com/api`

## Authentication

The API uses JWT tokens from Supabase Auth. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Documentation

Interactive API documentation is available at: `/api/docs`

## Endpoints

### 🔐 Protected Endpoints (Require Authentication)

#### Inventory Management

##### GET /inventory
Get all inventory items with optional filtering and pagination.

**Query Parameters:**
- `category` (string, optional): Filter by category
- `status` (string, optional): Filter by status (Available/Sold-Out)
- `search` (string, optional): Search in item name and description
- `limit` (integer, optional): Number of items to return (default: 50)
- `offset` (integer, optional): Number of items to skip (default: 0)

**Example:**
```bash
GET /api/inventory?category=Mobiliario&status=Available&limit=10
```

##### GET /inventory/{itemId}
Get a specific inventory item by ID.

**Example:**
```bash
GET /api/inventory/123e4567-e89b-12d3-a456-426614174000
```

##### POST /inventory
Create a new inventory item.

**Request Body:**
```json
{
  "itemName": "Mesa Antigua de Roble",
  "descripcionArticulo": "Mesa de comedor antigua con patas talladas",
  "category": "Mobiliario",
  "initialQuantity": 1,
  "currentQuantity": 1,
  "unitPrice": 2500000,
  "internalNotes": "En excelente estado, restaurada",
  "imageUrls": ["https://example.com/image1.jpg"]
}
```

##### PUT /inventory/{itemId}
Update an existing inventory item.

**Request Body:** (same as POST, but all fields optional)

##### DELETE /inventory/{itemId}
Delete an inventory item.

##### GET /inventory/stats
Get inventory statistics including counts, values, and category distribution.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalItems": 150,
    "availableItems": 120,
    "soldOutItems": 30,
    "totalValue": 45000000,
    "categoryDistribution": [
      {
        "category": "Mobiliario",
        "count": 45
      }
    ]
  }
}
```

### 🌐 Public Endpoints (No Authentication Required)

#### Categories

##### GET /categories
Get all available inventory categories.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Mobiliario",
      "description": "Muebles antiguos y vintage"
    }
  ]
}
```

#### QR Code Access

##### GET /qr/{itemId}
Get inventory item details for QR code scanning (public access).

**Response:**
```json
{
  "success": true,
  "data": {
    "itemId": "123e4567-e89b-12d3-a456-426614174000",
    "itemName": "Mesa Antigua de Roble",
    "descripcionArticulo": "Mesa de comedor antigua con patas talladas",
    "category": "Mobiliario",
    "unitPrice": 2500000,
    "imageUrls": ["https://example.com/image1.jpg"],
    "status": "Available"
  }
}
```

### Health Check

##### GET /health
Check API health status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Data Models

### Inventory Item

```json
{
  "itemId": "uuid",
  "itemName": "string",
  "descripcionArticulo": "string",
  "category": "enum",
  "initialQuantity": "integer",
  "currentQuantity": "integer",
  "unitPrice": "decimal",
  "totalPrice": "decimal",
  "status": "enum",
  "internalNotes": "string",
  "imageUrls": ["string"],
  "qrCodeUrl": "string",
  "lastModifiedBy": "uuid",
  "createDate": "timestamp",
  "updatedDate": "timestamp"
}
```

### Categories

Available categories:
- Mobiliario
- Porcelana
- Cristal
- Joyeria
- Arte
- Libros
- Textiles
- Decoracion
- Herramientas
- Musica
- Relojes
- Otros

### Status Values

- `Available`: Item is available for purchase
- `Sold-Out`: Item is no longer available

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## QR Code Integration

Each inventory item automatically generates a QR code that contains:
- Item ID
- Item name
- Category

The QR code points to: `/public/qr-viewer.html?itemId={itemId}`

This provides a mobile-friendly interface for customers to view item details.

## Role-Based Access Control

- **Admin**: Full access to all endpoints
- **Clerk**: Full access to inventory operations
- **Viewer**: Read-only access via QR codes (no login required)

## Rate Limiting

Currently no rate limiting is implemented, but it's recommended for production use.

## CORS

CORS is enabled for all origins in development. Configure appropriately for production.

## Environment Variables

Required environment variables:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
DB_URL=your_SUPABASE_DB_URL
NODE_ENV=development
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables

3. Run database migrations

4. Start the server:
   ```bash
   npm start
   ```

5. Access API documentation at: `http://localhost:8000/api/docs`

## Testing

Test the API using the interactive documentation or tools like Postman/Insomnia.

Example curl command:
```bash
curl -X GET "http://localhost:8000/api/inventory" \
  -H "Authorization: Bearer your-jwt-token"
``` 