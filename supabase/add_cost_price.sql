-- Needed for admin/reports profit & loss calculation — without a cost basis
-- per product, "profit" can't be computed at all (only revenue was tracked).
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price NUMERIC DEFAULT 0;
