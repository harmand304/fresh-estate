-- ============================================
-- Update Properties with Local Image Paths
-- and Remove Source URL
-- Run this in pgAdmin4 Query Tool
-- ============================================

-- Update image paths to local files
WITH numbered_properties AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
    FROM properties
)
UPDATE properties p
SET 
    image_url = '/images/image_' || (np.row_num + 49) || '.jpg',
    source_url = NULL
FROM numbered_properties np
WHERE p.id = np.id;

-- Verify the update
SELECT id, title, image_url, source_url FROM properties ORDER BY created_at LIMIT 10;
