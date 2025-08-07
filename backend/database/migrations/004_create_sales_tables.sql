-- Create sales table for transaction records
CREATE TABLE IF NOT EXISTS sales (
  "saleId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "clientId" UUID REFERENCES clients("clientId") ON DELETE SET NULL,
  "saleDate" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  "totalAmount" DECIMAL(10,2) NOT NULL CHECK ("totalAmount" >= 0),
  "paymentMethod" VARCHAR(50) NOT NULL DEFAULT 'Cash' CHECK ("paymentMethod" IN ('Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Check')),
  "status" VARCHAR(20) NOT NULL DEFAULT 'Completed' CHECK ("status" IN ('Pending', 'Completed', 'Cancelled', 'Refunded')),
  "notes" TEXT,
  "createdBy" UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create sale_items table for individual items in a sale
CREATE TABLE IF NOT EXISTS sale_items (
  "saleItemId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "saleId" UUID NOT NULL REFERENCES sales("saleId") ON DELETE CASCADE,
  "itemId" UUID NOT NULL REFERENCES inventory("itemId") ON DELETE CASCADE,
  "quantity" INTEGER NOT NULL DEFAULT 1 CHECK ("quantity" > 0),
  "unitPrice" DECIMAL(10,2) NOT NULL CHECK ("unitPrice" >= 0),
  "totalPrice" DECIMAL(10,2) NOT NULL CHECK ("totalPrice" >= 0),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_client ON sales("clientId");
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales("saleDate");
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_created_by ON sales("createdBy");
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items("saleId");
CREATE INDEX IF NOT EXISTS idx_sale_items_item ON sale_items("itemId");

-- Enable RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sales table
-- Policy for admins (full access)
CREATE POLICY "Admins have full access to sales" ON sales
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policy for clerks (full access)
CREATE POLICY "Clerks have full access to sales" ON sales
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'clerk'
        )
    );

-- Policy for viewers (read-only access)
CREATE POLICY "Viewers can read sales" ON sales
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'viewer'
        )
    );

-- Create RLS policies for sale_items table
-- Policy for admins (full access)
CREATE POLICY "Admins have full access to sale_items" ON sale_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policy for clerks (full access)
CREATE POLICY "Clerks have full access to sale_items" ON sale_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'clerk'
        )
    );

-- Policy for viewers (read-only access)
CREATE POLICY "Viewers can read sale_items" ON sale_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'viewer'
        )
    );

-- Create function to update inventory quantity after sale
CREATE OR REPLACE FUNCTION update_inventory_after_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- Update inventory quantity
    UPDATE inventory 
    SET 
        "currentQuantity" = "currentQuantity" - NEW.quantity,
        "updatedDate" = timezone('utc', now()),
        "lastModifiedBy" = (SELECT "createdBy" FROM sales WHERE "saleId" = NEW."saleId")
    WHERE "itemId" = NEW."itemId";
    
    -- Update status to 'Sold-Out' if quantity becomes 0
    UPDATE inventory 
    SET "status" = 'Sold-Out'
    WHERE "itemId" = NEW."itemId" 
    AND "currentQuantity" = 0;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update inventory after sale
CREATE TRIGGER trigger_update_inventory_after_sale
    AFTER INSERT ON sale_items
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_after_sale();

-- Create function to calculate sale total
CREATE OR REPLACE FUNCTION calculate_sale_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Update sale total amount
    UPDATE sales 
    SET "totalAmount" = (
        SELECT COALESCE(SUM("totalPrice"), 0)
        FROM sale_items 
        WHERE "saleId" = NEW."saleId"
    )
    WHERE "saleId" = NEW."saleId";
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate sale total
CREATE TRIGGER trigger_calculate_sale_total
    AFTER INSERT OR UPDATE OR DELETE ON sale_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_sale_total(); 