# Database Schema Documentation

## Overview
This document describes the database schema for the Viejos Recuerdos inventory management system.

## Tables

### 1. profiles (Auth Table)
- **Purpose**: User authentication and role management
- **Source**: Supabase Auth + custom profiles table
- **Key Fields**:
  - `user_id` (UUID, PK) - References auth.users
  - `role` (TEXT) - 'admin', 'clerk', 'viewer'
  - `name` (TEXT) - User's display name

### 2. inventory
- **Purpose**: Store inventory items
- **Key Fields**:
  - `itemId` (UUID, PK) - Unique identifier
  - `itemName` (VARCHAR) - Item name
  - `descripcionArticulo` (TEXT) - Item description
  - `category` (VARCHAR) - Item category
  - `initialQuantity` (INTEGER) - Original quantity
  - `currentQuantity` (INTEGER) - Current available quantity
  - `unitPrice` (DECIMAL) - Price per unit
  - `totalPrice` (DECIMAL) - Total value (calculated)
  - `status` (ENUM) - 'Available' or 'Sold-Out'
  - `internalNotes` (TEXT) - Internal notes
  - `imageUrls` (JSONB) - Array of image URLs
  - `qrCodeUrl` (VARCHAR) - QR code URL
  - `lastModifiedBy` (UUID) - References profiles.user_id
  - `createDate` (TIMESTAMP) - Creation date
  - `updatedDate` (TIMESTAMP) - Last update date

### 3. Categories (Application-Level)
- **Purpose**: Predefined categories managed in application code
- **Location**: `backend/src/utils/categories.js`
- **Type**: PostgreSQL ENUM with 12 predefined categories
- **Categories**: Mobiliario, Porcelana, Cristal, Joyeria, Arte, Libros, Textiles, Decoracion, Herramientas, Musica, Relojes, Otros

## Database Triggers

### 1. update_inventory_updated_date
- **Purpose**: Automatically update `updatedDate` on inventory changes
- **Trigger**: BEFORE UPDATE on inventory

### 2. calculate_inventory_total_price
- **Purpose**: Calculate total price and update status based on quantity
- **Trigger**: BEFORE INSERT OR UPDATE on inventory
- **Logic**:
  - `totalPrice = unitPrice * currentQuantity`
  - If `currentQuantity = 0`, set `status = 'Sold-Out'`
  - If `currentQuantity > 0` and `status = 'Sold-Out'`, set `status = 'Available'`

## Row Level Security (RLS)

### inventory table
- **Admin**: Full access (CRUD)
- **Clerk**: Full access (CRUD)
- **Public**: Read-only access (for QR code viewing)

### Categories (ENUM)
- **Access**: Read-only for all users (dropdown selection)
- **Management**: Categories are managed in application code

## Migration Instructions

1. **Run in Supabase SQL Editor**:
   ```sql
   -- Run 001_create_inventory_table.sql
   -- This creates both the inventory table and category ENUM
   ```

2. **Verify Setup**:
   ```sql
   -- Check tables exist
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'inventory';
   
   -- Check enum type exists
   SELECT typname FROM pg_type WHERE typname = 'inventory_category';
   
   -- Check triggers exist
   SELECT trigger_name FROM information_schema.triggers 
   WHERE trigger_schema = 'public';
   ```

## Indexes

### inventory table
- `idx_inventory_category` - For filtering by category
- `idx_inventory_status` - For filtering by status
- `idx_inventory_last_modified` - For tracking changes
- `idx_inventory_create_date` - For sorting by date

### inventory table (category field)
- `idx_inventory_category` - For filtering by category (already included above)

## Categories

The system uses a PostgreSQL ENUM with 12 predefined categories:
1. Mobiliario
2. Porcelana
3. Cristal
4. Joyeria
5. Arte
6. Libros
7. Textiles
8. Decoracion
9. Herramientas
10. Musica
11. Relojes
12. Otros

Categories are managed in `backend/src/utils/categories.js` and can be easily modified there. 