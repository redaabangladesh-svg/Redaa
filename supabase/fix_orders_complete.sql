-- Safe to re-run: drops conflicting policies first, then recreates everything
-- needed for guest/logged-in checkout to work end to end.

GRANT SELECT, INSERT, UPDATE ON orders TO anon, authenticated;
GRANT SELECT, INSERT ON order_items TO anon, authenticated;
GRANT SELECT ON customers TO anon;

DROP POLICY IF EXISTS "Anyone can create an order" ON orders;
CREATE POLICY "Anyone can create an order" ON orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can add items to an order" ON order_items;
CREATE POLICY "Anyone can add items to an order" ON order_items
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can view all orders" ON orders;
CREATE POLICY "Admin can view all orders" ON orders
  FOR SELECT USING (auth.jwt() ->> 'email' = 'info.sicilybd@gmail.com');

DROP POLICY IF EXISTS "Admin can update all orders" ON orders;
CREATE POLICY "Admin can update all orders" ON orders
  FOR UPDATE USING (auth.jwt() ->> 'email' = 'info.sicilybd@gmail.com');

DROP POLICY IF EXISTS "Admin can view all order items" ON order_items;
CREATE POLICY "Admin can view all order items" ON order_items
  FOR SELECT USING (auth.jwt() ->> 'email' = 'info.sicilybd@gmail.com');

-- Auto-generate order_number (e.g. ORD-2026-0001) on insert
CREATE SEQUENCE IF NOT EXISTS orders_order_number_seq START 1;

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

GRANT USAGE, SELECT ON SEQUENCE orders_order_number_seq TO anon, authenticated;
