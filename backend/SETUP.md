# Setup Guide for Viejos Recuerdos Backend

## Quick Start

The server can now start without environment variables (using mock services), but you'll need to configure them for full functionality.

## Environment Variables Setup

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret_key

# Database Configuration
DB_URL=postgres://username:password@localhost:5432/viejosrecuerdos

# AWS Configuration (for future image uploads)
AWS_BUCKET=your-s3-bucket
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Server Configuration
NODE_ENV=development
PORT=8000
```

## Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Go to Settings > API
4. Copy the following values:
   - **Project URL** → `SUPABASE_URL`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`
   - **JWT Secret** → `SUPABASE_JWT_SECRET`

## Database Setup

### Option 1: Use Supabase Database (Recommended)

1. In your Supabase project, go to SQL Editor
2. Run the migration script from `backend/database/migrations/001_create_inventory_table.sql`
3. Set `DB_URL` to your Supabase database URL (found in Settings > Database)

### Option 2: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database named `viejosrecuerdos`
3. Run the migration script
4. Set `DB_URL` to your local database URL

## Starting the Server

### Development Mode (with mock services)
```bash
cd backend
npm start
```

The server will start with mock services and show warnings about missing environment variables.

### Production Mode (with real services)
```bash
cd backend
# Set up .env file first
npm start
```

## Testing the API

1. **Health Check**: `GET http://localhost:8000/api/health`
2. **API Documentation**: `GET http://localhost:8000/api/docs`
3. **Categories**: `GET http://localhost:8000/api/categories`

## Current Status

- ✅ Server starts without environment variables
- ✅ Mock services for development
- ✅ API documentation available
- ⚠️ Real database connection requires environment setup
- ⚠️ Authentication requires Supabase setup

## Next Steps

1. Set up Supabase project
2. Configure environment variables
3. Run database migrations
4. Test API endpoints
5. Set up frontend integration 