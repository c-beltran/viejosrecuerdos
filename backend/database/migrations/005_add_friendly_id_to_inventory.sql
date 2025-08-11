-- Migration: Add friendly ID to inventory table
-- This adds a human-readable ID that combines category code + sequential number

-- Add friendlyId column
ALTER TABLE inventory ADD COLUMN "friendlyId" VARCHAR(10) UNIQUE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_friendly_id ON inventory("friendlyId");

-- Create function to generate friendly ID
CREATE OR REPLACE FUNCTION generate_friendly_id(category_input inventory_category)
RETURNS VARCHAR(10) AS $$
DECLARE
    category_code VARCHAR(1);
    next_number INTEGER;
    friendly_id VARCHAR(10);
BEGIN
    -- Map category to single letter code
    CASE category_input
        WHEN 'Mobiliario' THEN category_code := 'M';
        WHEN 'Porcelana' THEN category_code := 'P';
        WHEN 'Cristal' THEN category_code := 'C';
        WHEN 'Joyeria' THEN category_code := 'J';
        WHEN 'Arte' THEN category_code := 'A';
        WHEN 'Libros' THEN category_code := 'L';
        WHEN 'Textiles' THEN category_code := 'T';
        WHEN 'Decoracion' THEN category_code := 'D';
        WHEN 'Herramientas' THEN category_code := 'H';
        WHEN 'Musica' THEN category_code := 'U';
        WHEN 'Relojes' THEN category_code := 'R';
        WHEN 'Otros' THEN category_code := 'O';
        ELSE category_code := 'X';
    END CASE;
    
    -- Get next sequential number for this category
    SELECT COALESCE(MAX(CAST(SUBSTRING("friendlyId" FROM 2) AS INTEGER)), 0) + 1
    INTO next_number
    FROM inventory 
    WHERE "friendlyId" LIKE category_code || '%';
    
    -- Format as 4-digit number with leading zeros
    friendly_id := category_code || LPAD(next_number::TEXT, 4, '0');
    
    RETURN friendly_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate friendly ID on insert
CREATE OR REPLACE FUNCTION set_friendly_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."friendlyId" IS NULL THEN
        NEW."friendlyId" := generate_friendly_id(NEW.category);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER set_inventory_friendly_id
    BEFORE INSERT ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION set_friendly_id();

-- Add comment for documentation
COMMENT ON COLUMN inventory."friendlyId" IS 'Human-readable ID combining category code (M/P/C/J/A/L/T/D/H/U/R/O) + 4-digit sequential number (0001, 0002, etc.)';
COMMENT ON FUNCTION generate_friendly_id(inventory_category) IS 'Generates friendly ID in format: CategoryCode + 4-digit number (e.g., M0001, P0001)'; 