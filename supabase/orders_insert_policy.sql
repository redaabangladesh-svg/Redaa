-- Allow anyone (guest or logged-in) to create orders and order items at checkout
GRANT SELECT, INSERT, UPDATE ON orders TO anon, authenticated;
GRANT SELECT, INSERT ON order_items TO anon, authenticated;
GRANT UPDATE ON orders TO authenticated;

CREATE POLICY "Anyone can create an order" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can add items to an order" ON order_items
  FOR INSERT WITH CHECK (true);

-- Admin dashboard runs as a regular authenticated (Google-logged-in) browser
-- session, not the service role, so it needs its own read/write policies.
CREATE POLICY "Admin can view all orders" ON orders
  FOR SELECT USING (auth.jwt() ->> 'email' = 'redaabangladesh@gmail.com');
CREATE POLICY "Admin can update all orders" ON orders
  FOR UPDATE USING (auth.jwt() ->> 'email' = 'redaabangladesh@gmail.com');
CREATE POLICY "Admin can view all order items" ON order_items
  FOR SELECT USING (auth.jwt() ->> 'email' = 'redaabangladesh@gmail.com');

-- Auto-generate order_number (e.g. ORD-2026-0001) on insert
CREATE SEQUENCE IF NOT EXISTS orders_order_number_seq START 1;

CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'ORD-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('orders_order_number_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();
