const { createClient } = require('@supabase/supabase-js');

// Ensure dotenv is loaded
require('dotenv').config();

// Check if required environment variables are set
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase environment variables not set. Please create a .env file with:');
  console.warn('   SUPABASE_URL=your_supabase_project_url');
  console.warn('   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key');
  console.warn('   SUPABASE_JWT_SECRET=your_jwt_secret_key');
  console.warn('');
  console.warn('For now, creating a mock client for development...');
  
  // Create a mock client for development
  const mockSupabase = {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        })
      })
    })
  };
  
  module.exports = mockSupabase;
} else {
  console.log('✅ Creating real Supabase client...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  module.exports = supabase;
}