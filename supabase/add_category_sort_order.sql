-- Adds manual ordering to categories (drag-to-reorder in admin)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INTEGER;

-- Backfill existing rows using their current created_at order
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM categories
)
UPDATE categories c
SET sort_order = ranked.rn
FROM ranked
WHERE c.id = ranked.id AND c.sort_order IS NULL;
