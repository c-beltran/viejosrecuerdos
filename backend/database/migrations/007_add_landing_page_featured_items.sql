-- Migration: Add landing page featured items support
-- This migration adds fields to control which items appear on the landing page

-- Add featured_on_landing field to mark items for landing page display
ALTER TABLE inventory ADD COLUMN featured_on_landing BOOLEAN DEFAULT FALSE;

-- Add landing_page_order field to control the order of items in carousels
ALTER TABLE inventory ADD COLUMN landing_page_order INTEGER;

-- Add landing_page_section field to specify which carousel section (1 or 2)
ALTER TABLE inventory ADD COLUMN landing_page_section INTEGER CHECK (landing_page_section IN (1, 2));

-- Create index for better performance when querying featured items
CREATE INDEX idx_inventory_featured_landing ON inventory(featured_on_landing, landing_page_section, landing_page_order);

-- Add comment to document the new fields
COMMENT ON COLUMN inventory.featured_on_landing IS 'Whether this item should be displayed on the landing page';
COMMENT ON COLUMN inventory.landing_page_order IS 'Order of this item within its landing page section (1-12)';
COMMENT ON COLUMN inventory.landing_page_section IS 'Which carousel section this item belongs to (1 or 2)';
