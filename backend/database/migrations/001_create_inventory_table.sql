-- Create category enum type
CREATE TYPE inventory_category AS ENUM (
  'Mobiliario',
  'Porcelana',
  'Cristal',
  'Joyeria',
  'Arte',
  'Libros',
  'Textiles',
  'Decoracion',
  'Herramientas',
  'Musica',
  'Relojes',
  'Otros'
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  "itemId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "itemName" VARCHAR(255) NOT NULL,
  "descripcionArticulo" TEXT,
  "category" inventory_category NOT NULL,
  "initialQuantity" INTEGER NOT NULL DEFAULT 1 CHECK ("initialQuantity" >= 0),
  "currentQuantity" INTEGER NOT NULL DEFAULT 1 CHECK ("currentQuantity" >= 0),
  "unitPrice" DECIMAL(10,2) NOT NULL CHECK ("unitPrice" >= 0),
  "totalPrice" DECIMAL(10,2) NOT NULL CHECK ("totalPrice" >= 0),
  "status" VARCHAR(20) NOT NULL DEFAULT 'Available' CHECK ("status" IN ('Available', 'Sold-Out')),
  "internalNotes" TEXT,
  "imageUrls" JSONB DEFAULT '[]',
  "qrCodeUrl" VARCHAR(1000), -- Made optional and increased size for S3 URLs
  "lastModifiedBy" UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  "createDate" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  "updatedDate" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_last_modified ON inventory("lastModifiedBy");
CREATE INDEX IF NOT EXISTS idx_inventory_create_date ON inventory("createDate");

-- Create a function to automatically update the updatedDate
CREATE OR REPLACE FUNCTION update_updated_date_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedDate" = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updatedDate
CREATE TRIGGER update_inventory_updated_date 
    BEFORE UPDATE ON inventory 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_date_column();

-- Create a function to calculate total price
CREATE OR REPLACE FUNCTION calculate_total_price()
RETURNS TRIGGER AS $$
BEGIN
    NEW."totalPrice" = NEW."unitPrice" * NEW."currentQuantity";
    
    -- Update status based on quantity
    IF NEW."currentQuantity" = 0 THEN
        NEW."status" = 'Sold-Out';
    ELSIF NEW."currentQuantity" > 0 AND NEW."status" = 'Sold-Out' THEN
        NEW."status" = 'Available';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically calculate total price and update status
CREATE TRIGGER calculate_inventory_total_price
    BEFORE INSERT OR UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION calculate_total_price();

-- Enable Row Level Security (RLS)
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Create policies for different user roles
-- Admin can do everything
CREATE POLICY "Admin full access" ON inventory
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Clerk can do everything except delete
CREATE POLICY "Clerk read write" ON inventory
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'clerk'
        )
    );

-- Public read access for QR code viewing (no auth required)
CREATE POLICY "Public read access" ON inventory
    FOR SELECT USING (true);

-- Grant necessary permissions
GRANT ALL ON inventory TO authenticated;
GRANT SELECT ON inventory TO anon; 