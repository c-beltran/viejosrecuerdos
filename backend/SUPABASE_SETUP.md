# Supabase Database Connection Setup

## 🔍 Getting the Correct Database URL

### Step 1: Go to Supabase Dashboard
1. Open your Supabase project dashboard
2. Navigate to **Settings → Database**

### Step 2: Check Database Status
- Make sure your database is **not paused**
- If it's paused, click **"Resume"** to start it

### Step 3: Get the Connection String
You have **two options** for connecting:

#### Option A: Direct Connection (Recommended for development)
1. In **Settings → Database**, find **"Connection string"**
2. Copy the **URI** format:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@grmyycdrzhhtbjsmqvrg.supabase.co:5432/postgres
   ```
3. Replace `[YOUR-PASSWORD]` with your actual database password

#### Option B: Connection Pooling (Recommended for production)
1. In **Settings → Database**, find **"Connection pooling"**
2. Copy the **URI** format:
   ```
   postgresql://postgres.grmyycdrzhhtbjsmqvrg:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

### Step 4: Update Your .env File
```bash
# Replace the SUPABASE_DB_URL in your .env file
SUPABASE_DB_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@grmyycdrzhhtbjsmqvrg.supabase.co:5432/postgres
```

### Step 5: Test the Connection
```bash
npm start
```

## 🔧 Troubleshooting

### If connection still fails:

1. **Check your password**: Make sure you're using the database password, not your Supabase account password
2. **Try connection pooling**: Use the pooler URL instead
3. **Check database status**: Make sure the database is not paused
4. **Check IP restrictions**: Make sure your IP is not blocked

### RLS (Row Level Security) Considerations:

Since RLS is enabled, you need to ensure:

1. **Service Role Key**: The backend uses the `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS
2. **Database User**: The database connection should use the `postgres` user with full privileges
3. **RLS Policies**: Make sure your RLS policies allow the `postgres` user to access the tables

#### Check RLS Policies:
```sql
-- In Supabase SQL Editor, run:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

#### If RLS is blocking access:
```sql
-- Temporarily disable RLS for testing (run in Supabase SQL Editor):
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
-- Re-enable after testing:
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
```

### Common Issues:
- **ETIMEDOUT**: Database might be paused or password incorrect
- **ENOTFOUND**: Hostname is wrong
- **Authentication failed**: Password is incorrect

## 📋 Quick Test
Run this to test your connection:
```bash
node -e "
require('dotenv').config();
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.SUPABASE_DB_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: false
});
sequelize.authenticate()
  .then(() => console.log('✅ Connection successful!'))
  .catch(err => console.log('❌ Connection failed:', err.message));
"
``` 