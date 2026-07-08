-- Run this AFTER deploying the /api/orders, /api/orders/[id], and
-- /api/orders/track routes (they use the service-role key, which bypasses
-- RLS entirely, so none of the policies below affect them).
--
-- ROOT CAUSE this removes: orders/coupons used to be written and read
-- directly from the browser with the anon key. That's why
-- "Anyone can view an order right after creating it" ON orders FOR SELECT
-- USING (true) existed — guest checkout needed SELECT to pass on the
-- INSERT...RETURNING step, but USING (true) has no row filter, so it also
-- let any anon client SELECT * FROM orders and read every customer's PII.
-- Same story for the "Public can increment coupon usage" UPDATE policy —
-- intended as a narrow increment, actually full write access to any coupon.
-- Now that checkout/coupon-redemption happen server-side via service role,
-- neither policy needs to exist.

-- Orders / order_items: browser no longer touches these directly
REVOKE INSERT, SELECT, UPDATE ON orders FROM anon;
REVOKE INSERT, SELECT ON order_items FROM anon;

DROP POLICY IF EXISTS "Anyone can create an order" ON orders;
DROP POLICY IF EXISTS "Anyone can view an order right after creating it" ON orders;
DROP POLICY IF EXISTS "Anyone can add items to an order" ON order_items;

-- Kept as-is (authenticated, already scoped correctly):
--   "Admin can view all orders" / "Admin can update all orders"
--   "Admin can view all order items"
--   "Customers view own orders" (auth_user_id join)

-- Add the matching customer-owned read for order_items so the account
-- page's order history still works for logged-in customers.
DROP POLICY IF EXISTS "Customers view own order items" ON order_items;
CREATE POLICY "Customers view own order items" ON order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE customer_id IN (
        SELECT id FROM customers WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Coupons: remove public write entirely, redemption now happens server-side only
DROP POLICY IF EXISTS "Public can increment coupon usage" ON coupons;
REVOKE UPDATE ON coupons FROM anon;
-- "Public can view active coupons" (SELECT true) stays — needed so checkout
-- can validate a typed-in coupon code client-side; discount codes existing
-- isn't PII, this is a much lower-risk read than the orders table was.

-- Stock decrement used by /api/orders after a successful order insert
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id uuid, p_qty int)
RETURNS void
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products SET stock = GREATEST(stock - p_qty, 0) WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Only the service-role client (used exclusively by /api/orders) calls this —
-- anon/authenticated must NOT be able to drain stock on arbitrary products directly.
REVOKE EXECUTE ON FUNCTION decrement_stock(uuid, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION decrement_stock(uuid, int) TO service_role;
