-- Migration: Expand landing page to 4 carousel sections
-- This migration expands the landing page from 2 sections to 4 sections

-- Update the landing_page_section check constraint to allow sections 1-4
ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_landing_page_section_check;
ALTER TABLE inventory ADD CONSTRAINT inventory_landing_page_section_check CHECK (landing_page_section IN (1, 2, 3, 4));

-- Update the comment to reflect the new range
COMMENT ON COLUMN inventory.landing_page_section IS 'Which carousel section this item belongs to (1, 2, 3, or 4)';

-- Update the index to include the new sections
DROP INDEX IF EXISTS idx_inventory_featured_landing;
CREATE INDEX idx_inventory_featured_landing ON inventory(featured_on_landing, landing_page_section, landing_page_order);
