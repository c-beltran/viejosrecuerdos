-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  "clientId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) UNIQUE,
  "phone" VARCHAR(50),
  "address" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  "lastModifiedBy" UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients("createdAt");
CREATE INDEX IF NOT EXISTS idx_clients_last_modified ON clients("lastModifiedBy");

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clients table
-- Policy for admins (full access)
CREATE POLICY "Admins have full access to clients" ON clients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policy for clerks (full access)
CREATE POLICY "Clerks have full access to clients" ON clients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'clerk'
        )
    );

-- Policy for viewers (read-only access)
CREATE POLICY "Viewers can read clients" ON clients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'viewer'
        )
    ); 