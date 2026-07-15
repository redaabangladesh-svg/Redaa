-- ============================================================
-- Consolidated patches on top of supabase_setup_all.sql
-- Safe to re-run (uses IF NOT EXISTS / DROP POLICY IF EXISTS)
-- ============================================================

-- 1. Missing column: cost_price (needed for admin profit/loss reports)
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price NUMERIC DEFAULT 0;

-- 2. Missing table: wishlist_items
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (customer_id, product_id)
);
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Customers manage own wishlist" ON wishlist_items;
CREATE POLICY "Customers manage own wishlist" ON wishlist_items
  FOR ALL USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

-- 3. Auto order_number generation (ORD-2026-0001)
CREATE SEQUENCE IF NOT EXISTS orders_order_number_seq START 1;
GRANT USAGE, SELECT ON SEQUENCE orders_order_number_seq TO anon, authenticated;

CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'ORD-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('orders_order_number_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_order_number ON orders;
CREATE TRIGGER trg_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- 4. Admin policies (admin dashboard runs as a normal authenticated
--    Google session, not service_role, so it needs its own RLS rules)
DROP POLICY IF EXISTS "Admin can view all orders" ON orders;
CREATE POLICY "Admin can view all orders" ON orders
  FOR SELECT USING (auth.jwt() ->> 'email' = 'redaabangladesh@gmail.com');

DROP POLICY IF EXISTS "Admin can update all orders" ON orders;
CREATE POLICY "Admin can update all orders" ON orders
  FOR UPDATE USING (auth.jwt() ->> 'email' = 'redaabangladesh@gmail.com');

DROP POLICY IF EXISTS "Admin can view all order items" ON order_items;
CREATE POLICY "Admin can view all order items" ON order_items
  FOR SELECT USING (auth.jwt() ->> 'email' = 'redaabangladesh@gmail.com');

DROP POLICY IF EXISTS "Admin can view all customers" ON customers;
CREATE POLICY "Admin can view all customers" ON customers
  FOR SELECT USING (auth.jwt() ->> 'email' = 'redaabangladesh@gmail.com');

DROP POLICY IF EXISTS "Admin can update all customers" ON customers;
CREATE POLICY "Admin can update all customers" ON customers
  FOR UPDATE USING (auth.jwt() ->> 'email' = 'redaabangladesh@gmail.com');

DROP POLICY IF EXISTS "Admin can manage coupons" ON coupons;
CREATE POLICY "Admin can manage coupons" ON coupons
  FOR ALL USING (auth.jwt() ->> 'email' = 'redaabangladesh@gmail.com');

DROP POLICY IF EXISTS "Admin can manage settings" ON settings;
CREATE POLICY "Admin can manage settings" ON settings
  FOR ALL USING (auth.jwt() ->> 'email' = 'redaabangladesh@gmail.com');

DROP POLICY IF EXISTS "Admin can manage reviews" ON reviews;
CREATE POLICY "Admin can manage reviews" ON reviews
  FOR ALL USING (auth.jwt() ->> 'email' = 'redaabangladesh@gmail.com');

-- 5. Public-read policies the base script didn't include
GRANT SELECT ON settings TO anon, authenticated;
GRANT INSERT, UPDATE ON settings TO authenticated;
DROP POLICY IF EXISTS "Public can view settings" ON settings;
CREATE POLICY "Public can view settings" ON settings FOR SELECT USING (true);

GRANT SELECT ON reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON reviews TO authenticated;

-- 6. Checkout goes through /api/orders (service_role), so the browser
--    (anon/authenticated) never needs direct write access to orders —
--    keep those revoked. Service role bypasses RLS entirely and is
--    covered by the grants below.
REVOKE INSERT, SELECT, UPDATE ON orders FROM anon;
REVOKE INSERT, SELECT ON order_items FROM anon;
REVOKE UPDATE ON coupons FROM anon;
GRANT SELECT ON orders TO authenticated;
GRANT SELECT ON order_items TO authenticated;

-- 7. authenticated role needs table-level access for customer self-service
--    (RLS policies above still scope it to their own rows)
GRANT SELECT, INSERT, UPDATE, DELETE ON customers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON customer_addresses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON wishlist_items TO authenticated;
GRANT SELECT ON customers TO anon;

-- 8. service_role must be able to touch everything (checkout, admin
--    dashboard mutations, image upload records all go through it)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
