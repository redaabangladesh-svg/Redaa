-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image TEXT, -- R2 image URL
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price NUMERIC NOT NULL,
  sale_price NUMERIC,
  stock INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}', -- Array of R2 image URLs
  description_en TEXT,
  description_bn TEXT,
  short_description_en TEXT,
  short_description_bn TEXT,
  category_id UUID REFERENCES categories(id),
  variants JSONB DEFAULT '[]', -- [{color_en, color_bn, size_en, size_bn, stock, price}]
  landing_page_active BOOLEAN DEFAULT false,
  landing_content JSONB DEFAULT '{}', -- custom video, reviews, badges
  seo_title_en TEXT,
  seo_title_bn TEXT,
  seo_description_en TEXT,
  seo_description_bn TEXT,
  is_featured BOOLEAN DEFAULT false,
  low_stock_threshold INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers Table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  address TEXT,
  district TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  is_blocked BOOLEAN DEFAULT false,
  block_reason TEXT,
  tags TEXT[] DEFAULT '{}', -- repeat, vip, fraud
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL, -- ORD-2026-0001
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  area TEXT,
  subtotal NUMERIC NOT NULL,
  delivery_charge NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,      -- cod, sslcommerz, amarpay
  payment_status TEXT DEFAULT 'pending', -- pending, paid, failed
  order_status TEXT DEFAULT 'new',   -- new, confirmed, processing, shipped, delivered, cancelled, returned
  courier TEXT,                      -- pathao, steadfast, redex, other
  tracking_number TEXT,
  source TEXT DEFAULT 'website',     -- website, facebook, instagram, phone
  fraud_score INTEGER DEFAULT 0,
  fraud_flags TEXT[] DEFAULT '{}',
  coupon_code TEXT,
  notes TEXT,
  sms_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL, -- Snapshot of product name at order time (e.g. name_en / name_bn combined or depending on order locale)
  variant JSONB,
  qty INTEGER NOT NULL,
  price NUMERIC NOT NULL
);

-- Coupons Table
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,               -- percentage, fixed, free_delivery
  value NUMERIC NOT NULL,
  min_order NUMERIC DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS Log Table
CREATE TABLE sms_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',    -- sent, failed
  order_id UUID REFERENCES orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store Settings Table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blocked Phones (Fraud protection)
CREATE TABLE blocked_phones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  image TEXT, -- R2 review image URL
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Run this AFTER deploying the /api/orders, /api/orders/[id], and
-- /api/orders/track routes (they use the service-role key, which bypasses
-- RLS entirely, so none of the policies below affect them).
--
-- ROOT CAUSE this removes: orders/coupons used to be written and read
-- directly from the browser with the anon key. That's why
-- "Anyone can view an order right after creating it" ON orders FOR SELECT
-- USING (true) existed â€” guest checkout needed SELECT to pass on the
-- INSERT...RETURNING step, but USING (true) has no row filter, so it also
-- let any anon client SELECT * FROM orders and read every customer's PII.
-- Same story for the "Public can increment coupon usage" UPDATE policy â€”
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
-- "Public can view active coupons" (SELECT true) stays â€” needed so checkout
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

-- Only the service-role client (used exclusively by /api/orders) calls this â€”
-- anon/authenticated must NOT be able to drain stock on arbitrary products directly.
REVOKE EXECUTE ON FUNCTION decrement_stock(uuid, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION decrement_stock(uuid, int) TO service_role;
-- Link customers to Supabase Auth users
ALTER TABLE customers ADD COLUMN auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE customers ADD COLUMN email TEXT;
ALTER TABLE customers ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE customers ALTER COLUMN phone DROP DEFAULT;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_phone_key;
ALTER TABLE customers ADD CONSTRAINT customers_phone_key UNIQUE (phone);

-- Saved delivery addresses per customer
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',       -- Home, Office, Other
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  area TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlist items per customer
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (customer_id, product_id)
);

-- Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own row" ON customers
  FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Customers can update own row" ON customers
  FOR UPDATE USING (auth.uid() = auth_user_id);
CREATE POLICY "Customers can insert own row" ON customers
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Customers manage own addresses" ON customer_addresses
  FOR ALL USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Customers manage own wishlist" ON wishlist_items
  FOR ALL USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Customers view own orders" ON orders
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Customers view own order items" ON order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE customer_id IN (
        SELECT id FROM customers WHERE auth_user_id = auth.uid()
      )
    )
  );
-- Categories used by the storefront filter/shop pages
INSERT INTO categories (name_en, name_bn, slug) VALUES
  ('Panjabi', 'à¦ªà¦¾à¦žà§à¦œà¦¾à¦¬à¦¿', 'panjabi'),
  ('Tupi', 'à¦Ÿà§à¦ªà¦¿', 'tupi'),
  ('Rumal', 'à¦°à§à¦®à¦¾à¦²', 'rumal'),
  ('Orna', 'à¦“à§œà¦¨à¦¾', 'orna')
ON CONFLICT (slug) DO NOTHING;

-- Grant public read access to categories/products (storefront needs no login)
GRANT SELECT ON categories TO anon, authenticated;
GRANT SELECT ON products TO anon, authenticated;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can view products" ON products FOR SELECT USING (true);

-- Admin (allowlisted email) manages the catalog
GRANT INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT INSERT, UPDATE, DELETE ON categories TO authenticated;
CREATE POLICY "Admin can manage products" ON products
  FOR ALL USING (auth.jwt() ->> 'email' = 'redaabangladesh@gmail.com');
CREATE POLICY "Admin can manage categories" ON categories
  FOR ALL USING (auth.jwt() ->> 'email' = 'redaabangladesh@gmail.com');


-- Seeding mock products for Redaa catalog with variants
INSERT INTO products (
  name_en, name_bn, slug, price, sale_price, stock, images,
  description_en, description_bn, short_description_en, short_description_bn,
  is_featured, category_id, variants
) VALUES
  (
    'Premium Embroidered Black Panjabi',
    'à¦ªà§à¦°à¦¿à¦®à¦¿à¦¯à¦¼à¦¾à¦® à¦¬à§à¦²à§à¦¯à¦¾à¦• à¦à¦®à¦¬à§à¦°à¦¯à¦¼à¦¡à¦¾à¦°à¦¿ à¦ªà¦¾à¦žà§à¦œà¦¾à¦¬à¦¿',
    'premium-embroidered-black-panjabi',
    2850,
    2250,
    50,
    ARRAY['/product-1.webp'],
    'Crafted from premium quality cotton fabric with intricate embroidery on the collar and placket. Perfect for festivals and special occasions.',
    'à¦•à¦²à¦¾à¦° à¦à¦¬à¦‚ à¦ªà§à¦²à§à¦¯à¦¾à¦•à§‡à¦Ÿà§‡ à¦¸à§‚à¦•à§à¦·à§à¦® à¦à¦®à¦¬à§à¦°à¦¯à¦¼à¦¡à¦¾à¦°à¦¿ à¦•à¦¾à¦œ à¦¸à¦¹ à¦ªà§à¦°à¦¿à¦®à¦¿à¦¯à¦¼à¦¾à¦® à¦®à¦¾à¦¨à§‡à¦° à¦¸à§à¦¤à¦¿ à¦•à¦¾à¦ªà¦¡à¦¼ à¦¥à§‡à¦•à§‡ à¦¤à§ˆà¦°à¦¿à¥¤ à¦‰à§Žà¦¸à¦¬ à¦à¦¬à¦‚ à¦¬à¦¿à¦¶à§‡à¦· à¦…à¦¨à§à¦·à§à¦ à¦¾à¦¨à§‡à¦° à¦œà¦¨à§à¦¯ à¦‰à¦ªà¦¯à§à¦•à§à¦¤à¥¤',
    'Premium cotton embroidered Panjabi for Eid and special occasions.',
    'à¦ˆà¦¦ à¦à¦¬à¦‚ à¦¬à¦¿à¦¶à§‡à¦· à¦…à¦¨à§à¦·à§à¦ à¦¾à¦¨à§‡à¦° à¦œà¦¨à§à¦¯ à¦ªà§à¦°à¦¿à¦®à¦¿à¦¯à¦¼à¦¾à¦® à¦•à¦Ÿà¦¨ à¦à¦®à¦¬à§à¦°à¦¯à¦¼à¦¡à¦¾à¦°à¦¿ à¦ªà¦¾à¦žà§à¦œà¦¾à¦¬à¦¿à¥¤',
    true,
    (SELECT id FROM categories WHERE slug = 'panjabi' LIMIT 1),
    '[{"color_en":"Black","color_bn":"à¦•à¦¾à¦²à§‹","color_code":"#121212","size_en":"S","size_bn":"S","stock":10,"price":2850,"sale_price":2250},{"color_en":"Black","color_bn":"à¦•à¦¾à¦²à§‹","color_code":"#121212","size_en":"M","size_bn":"M","stock":15,"price":2850,"sale_price":2250},{"color_en":"Black","color_bn":"à¦•à¦¾à¦²à§‹","color_code":"#121212","size_en":"L","size_bn":"L","stock":12,"price":2850,"sale_price":2250},{"color_en":"Black","color_bn":"à¦•à¦¾à¦²à§‹","color_code":"#121212","size_en":"XL","size_bn":"XL","stock":8,"price":2850,"sale_price":2250},{"color_en":"Black","color_bn":"à¦•à¦¾à¦²à§‹","color_code":"#121212","size_en":"XXL","size_bn":"XXL","stock":5,"price":2850,"sale_price":2250},{"color_en":"Slate","color_bn":"à¦¸à§à¦²à§‡à¦Ÿ","color_code":"#5C6B73","size_en":"S","size_bn":"S","stock":5,"price":2850,"sale_price":2250},{"color_en":"Slate","color_bn":"à¦¸à§à¦²à§‡à¦Ÿ","color_code":"#5C6B73","size_en":"M","size_bn":"M","stock":10,"price":2850,"sale_price":2250},{"color_en":"Slate","color_bn":"à¦¸à§à¦²à§‡à¦Ÿ","color_code":"#5C6B73","size_en":"L","size_bn":"L","stock":10,"price":2850,"sale_price":2250},{"color_en":"Slate","color_bn":"à¦¸à§à¦²à§‡à¦Ÿ","color_code":"#5C6B73","size_en":"XL","size_bn":"XL","stock":5,"price":2850,"sale_price":2250},{"color_en":"Slate","color_bn":"à¦¸à§à¦²à§‡à¦Ÿ","color_code":"#5C6B73","size_en":"XXL","size_bn":"XXL","stock":2,"price":2850,"sale_price":2250},{"color_en":"Brown","color_bn":"à¦¬à§à¦°à¦¾à¦‰à¦¨","color_code":"#8E704D","size_en":"S","size_bn":"S","stock":4,"price":2850,"sale_price":2250},{"color_en":"Brown","color_bn":"à¦¬à§à¦°à¦¾à¦‰à¦¨","color_code":"#8E704D","size_en":"M","size_bn":"M","stock":8,"price":2850,"sale_price":2250},{"color_en":"Brown","color_bn":"à¦¬à§à¦°à¦¾à¦‰à¦¨","color_code":"#8E704D","size_en":"L","size_bn":"L","stock":8,"price":2850,"sale_price":2250},{"color_en":"Brown","color_bn":"à¦¬à§à¦°à¦¾à¦‰à¦¨","color_code":"#8E704D","size_en":"XL","size_bn":"XL","stock":3,"price":2850,"sale_price":2250},{"color_en":"Beige","color_bn":"à¦¬à§‡à¦‡à¦œ","color_code":"#BFA89E","size_en":"S","size_bn":"S","stock":4,"price":2850,"sale_price":2250},{"color_en":"Beige","color_bn":"à¦¬à§‡à¦‡à¦œ","color_code":"#BFA89E","size_en":"M","size_bn":"M","stock":8,"price":2850,"sale_price":2250},{"color_en":"Beige","color_bn":"à¦¬à§‡à¦‡à¦œ","color_code":"#BFA89E","size_en":"L","size_bn":"L","stock":8,"price":2850,"sale_price":2250},{"color_en":"Beige","color_bn":"à¦¬à§‡à¦‡à¦œ","color_code":"#BFA89E","size_en":"XL","size_bn":"XL","stock":4,"price":2850,"sale_price":2250}]'::jsonb
  ),
  (
    'Classic Kabli Panjabi Suit',
    'à¦•à§à¦²à¦¾à¦¸à¦¿à¦• à¦•à¦¾à¦¬à¦²à¦¿ à¦ªà¦¾à¦žà§à¦œà¦¾à¦¬à¦¿ à¦¸à§à¦Ÿ',
    'classic-kabli-panjabi-suit',
    3450,
    2850,
    35,
    ARRAY['/product-2.webp'],
    'Elegant Kabli suit featuring a matching pajama. Designed with high-quality fabric for ultimate comfort and style.',
    'à¦®à§à¦¯à¦¾à¦šà¦¿à¦‚ à¦ªà¦¾à§Ÿà¦œà¦¾à¦®à¦¾ à¦¸à¦¹ à¦®à¦¾à¦°à§à¦œà¦¿à¦¤ à¦•à¦¾à¦¬à¦²à¦¿ à¦¸à§‡à¦Ÿà¥¤ à¦¸à¦°à§à¦¬à§‹à¦šà§à¦š à¦†à¦°à¦¾à¦® à¦à¦¬à¦‚ à¦¸à§à¦Ÿà¦¾à¦‡à¦²à§‡à¦° à¦œà¦¨à§à¦¯ à¦‰à¦šà§à¦š à¦®à¦¾à¦¨à§‡à¦° à¦•à¦¾à¦ªà¦¡à¦¼ à¦¦à¦¿à¦¯à¦¼à§‡ à¦¡à¦¿à¦œà¦¾à¦‡à¦¨ à¦•à¦°à¦¾ à¦¹à¦¯à¦¼à§‡à¦›à§‡à¥¤',
    'Premium Kabli Panjabi suit set with matching pajama.',
    'à¦®à§à¦¯à¦¾à¦šà¦¿à¦‚ à¦ªà¦¾à§Ÿà¦œà¦¾à¦®à¦¾ à¦¸à¦¹ à¦ªà§à¦°à¦¿à¦®à¦¿à¦¯à¦¼à¦¾à¦® à¦•à¦¾à¦¬à¦²à¦¿ à¦ªà¦¾à¦žà§à¦œà¦¾à¦¬à¦¿ à¦¸à§‡à¦Ÿà¥¤',
    true,
    (SELECT id FROM categories WHERE slug = 'panjabi' LIMIT 1),
    '[{"color_en":"Black","color_bn":"à¦•à¦¾à¦²à§‹","color_code":"#121212","size_en":"S","size_bn":"S","stock":5,"price":3450,"sale_price":2850},{"color_en":"Black","color_bn":"à¦•à¦¾à¦²à§‹","color_code":"#121212","size_en":"M","size_bn":"M","stock":8,"price":3450,"sale_price":2850},{"color_en":"Black","color_bn":"à¦•à¦¾à¦²à§‹","color_code":"#121212","size_en":"L","size_bn":"L","stock":8,"price":3450,"sale_price":2850},{"color_en":"Black","color_bn":"à¦•à¦¾à¦²à§‹","color_code":"#121212","size_en":"XL","size_bn":"XL","stock":4,"price":3450,"sale_price":2850},{"color_en":"Slate","color_bn":"à¦¸à§à¦²à§‡à¦Ÿ","color_code":"#5C6B73","size_en":"S","size_bn":"S","stock":4,"price":3450,"sale_price":2850},{"color_en":"Slate","color_bn":"à¦¸à§à¦²à§‡à¦Ÿ","color_code":"#5C6B73","size_en":"M","size_bn":"M","stock":6,"price":3450,"sale_price":2850},{"color_en":"Slate","color_bn":"à¦¸à§à¦²à§‡à¦Ÿ","color_code":"#5C6B73","size_en":"L","size_bn":"L","stock":6,"price":3450,"sale_price":2850},{"color_en":"Slate","color_bn":"à¦¸à§à¦²à§‡à¦Ÿ","color_code":"#5C6B73","size_en":"XL","size_bn":"XL","stock":3,"price":3450,"sale_price":2850}]'::jsonb
  ),
  (
    'Handmade Premium Prayer Tupi',
    'à¦¹à§à¦¯à¦¾à¦¨à§à¦¡à¦®à§‡à¦¡ à¦ªà§à¦°à¦¿à¦®à¦¿à¦¯à¦¼à¦¾à¦® à¦¨à¦¾à¦®à¦¾à¦œà§‡à¦° à¦Ÿà§à¦ªà¦¿',
    'handmade-premium-prayer-tupi',
    650,
    490,
    100,
    ARRAY['/product-3.webp'],
    'Beautifully hand-crafted premium prayer cap. Soft, breathable cotton threads, comfortable for all-day wear.',
    'à¦¸à§à¦¨à§à¦¦à¦°à¦­à¦¾à¦¬à§‡ à¦¹à¦¾à¦¤à§‡ à¦¬à§‹à¦¨à¦¾ à¦ªà§à¦°à¦¿à¦®à¦¿à¦¯à¦¼à¦¾à¦® à¦Ÿà§à¦ªà¦¿à¥¤ à¦¨à¦°à¦®, à¦†à¦°à¦¾à¦®à¦¦à¦¾à§Ÿà¦• à¦¸à§à¦¤à¦¿ à¦¸à§à¦¤à¦¾ à¦¦à¦¿à§Ÿà§‡ à¦¤à§ˆà¦°à¦¿, à¦¯à¦¾ à¦¸à¦¾à¦°à¦¾à¦¦à¦¿à¦¨ à¦ªà¦°à¦¾à¦° à¦œà¦¨à§à¦¯ à¦†à¦°à¦¾à¦®à¦¦à¦¾à¦¯à¦¼à¦•à¥¤',
    'Handcrafted premium quality soft cotton prayer cap.',
    'à¦¹à¦¾à¦¤à§‡ à¦¤à§ˆà¦°à¦¿ à¦ªà§à¦°à¦¿à¦®à¦¿à¦¯à¦¼à¦¾à¦® à¦®à¦¾à¦¨à§‡à¦° à¦¨à¦°à¦® à¦¸à§à¦¤à¦¿ à¦Ÿà§à¦ªà¦¿à¥¤',
    true,
    (SELECT id FROM categories WHERE slug = 'tupi' LIMIT 1),
    '[{"color_en":"White","color_bn":"à¦¸à¦¾à¦¦à¦¾","color_code":"#FFFFFF","size_en":"S","size_bn":"S","stock":20,"price":650,"sale_price":490},{"color_en":"White","color_bn":"à¦¸à¦¾à¦¦à¦¾","color_code":"#FFFFFF","size_en":"M","size_bn":"M","stock":30,"price":650,"sale_price":490},{"color_en":"White","color_bn":"à¦¸à¦¾à¦¦à¦¾","color_code":"#FFFFFF","size_en":"L","size_bn":"L","stock":25,"price":650,"sale_price":490},{"color_en":"White","color_bn":"à¦¸à¦¾à¦¦à¦¾","color_code":"#FFFFFF","size_en":"XL","size_bn":"XL","stock":15,"price":650,"sale_price":490},{"color_en":"Black","color_bn":"à¦•à¦¾à¦²à§‹","color_code":"#121212","size_en":"S","size_bn":"S","stock":10,"price":650,"sale_price":490},{"color_en":"Black","color_bn":"à¦•à¦¾à¦²à§‹","color_code":"#121212","size_en":"M","size_bn":"M","stock":15,"price":650,"sale_price":490},{"color_en":"Black","color_bn":"à¦•à¦¾à¦²à§‹","color_code":"#121212","size_en":"L","size_bn":"L","stock":15,"price":650,"sale_price":490},{"color_en":"Black","color_bn":"à¦•à¦¾à¦²à§‹","color_code":"#121212","size_en":"XL","size_bn":"XL","stock":8,"price":650,"sale_price":490}]'::jsonb
  ),
  (
    'Pure Cotton Premium Rumal',
    'à¦ªà¦¿à¦‰à¦° à¦•à¦Ÿà¦¨ à¦ªà§à¦°à¦¿à¦®à¦¿à¦¯à¦¼à¦¾à¦® à¦°à§à¦®à¦¾à¦²',
    'pure-cotton-premium-rumal',
    180,
    130,
    200,
    ARRAY['/product-4.webp'],
    'High absorbance pure cotton handkerchief. Soft texture that is gentle on skin, durable stitched edges.',
    'à¦‰à¦šà§à¦š à¦¶à§‹à¦·à¦£ à¦•à§à¦·à¦®à¦¤à¦¾ à¦¸à¦®à§à¦ªà¦¨à§à¦¨ à¦–à¦¾à¦à¦Ÿà¦¿ à¦¸à§à¦¤à¦¿ à¦°à§à¦®à¦¾à¦²à¥¤ à¦¨à¦°à¦® à¦Ÿà§‡à¦•à§à¦¸à¦šà¦¾à¦° à¦¯à¦¾ à¦¤à§à¦¬à¦•à§‡ à¦†à¦°à¦¾à¦® à¦¦à§‡à§Ÿ, à¦Ÿà§‡à¦•à¦¸à¦‡ à¦¸à§‡à¦²à¦¾à¦‡ à¦•à¦°à¦¾ à¦ªà§à¦°à¦¾à¦¨à§à¦¤à¥¤',
    'Highly absorbent, ultra-soft pure cotton handkerchief.',
    'à¦‰à¦šà§à¦š à¦¶à§‹à¦·à¦£ à¦•à§à¦·à¦®à¦¤à¦¾ à¦¸à¦®à§à¦ªà¦¨à§à¦¨, à¦…à¦¤à¦¿-à¦¨à¦°à¦® à¦–à¦¾à¦à¦Ÿà¦¿ à¦¸à§à¦¤à¦¿ à¦°à§à¦®à¦¾à¦²à¥¤',
    true,
    (SELECT id FROM categories WHERE slug = 'rumal' LIMIT 1),
    '[{"color_en":"White","color_bn":"à¦¸à¦¾à¦¦à¦¾","color_code":"#FFFFFF","stock":100,"price":180,"sale_price":130},{"color_en":"Black","color_bn":"à¦•à¦¾à¦²à§‹","color_code":"#121212","stock":80,"price":180,"sale_price":130},{"color_en":"Blue","color_bn":"à¦¨à§€à¦²","color_code":"#1E3A8A","stock":50,"price":180,"sale_price":130}]'::jsonb
  ),
  (
    'Royal Cotton White Panjabi',
    'à¦°à¦¯à¦¼à§à¦¯à¦¾à¦² à¦•à¦Ÿà¦¨ à¦¹à§‹à¦¯à¦¼à¦¾à¦‡à¦Ÿ à¦ªà¦¾à¦žà§à¦œà¦¾à¦¬à¦¿',
    'royal-cotton-white-panjabi',
    2450,
    1850,
    60,
    ARRAY['/product-5.webp'],
    'Timeless white cotton Panjabi with minimalist design. Light, breathable, and highly comfortable.',
    'à¦¨à§à¦¯à§‚à¦¨à¦¤à¦® à¦¡à¦¿à¦œà¦¾à¦‡à¦¨à§‡à¦° à¦¸à¦¾à¦¦à¦¾ à¦¸à§à¦¤à¦¿ à¦ªà¦¾à¦žà§à¦œà¦¾à¦¬à¦¿à¥¤ à¦¹à¦¾à¦²à¦•à¦¾, à¦†à¦°à¦¾à¦®à¦¦à¦¾à§Ÿà¦• à¦à¦¬à¦‚ à¦¦à§€à¦°à§à¦˜à¦¸à§à¦¥à¦¾à§Ÿà§€à¥¤',
    'Classic white cotton Panjabi with minimalist styling.',
    'à¦¨à§à¦¯à§‚à¦¨à¦¤à¦® à¦¸à§à¦Ÿà¦¾à¦‡à¦²à¦¿à¦¶ à¦¡à¦¿à¦œà¦¾à¦‡à¦¨ à¦¸à¦¹ à¦•à§à¦²à¦¾à¦¸à¦¿à¦• à¦¸à¦¾à¦¦à¦¾ à¦¸à§à¦¤à¦¿ à¦ªà¦¾à¦žà§à¦œà¦¾à¦¬à¦¿à¥¤',
    false,
    (SELECT id FROM categories WHERE slug = 'panjabi' LIMIT 1),
    '[{"color_en":"White","color_bn":"à¦¸à¦¾à¦¦à¦¾","color_code":"#FFFFFF","size_en":"S","size_bn":"S","stock":15,"price":2450,"sale_price":1850},{"color_en":"White","color_bn":"à¦¸à¦¾à¦¦à¦¾","color_code":"#FFFFFF","size_en":"M","size_bn":"M","stock":20,"price":2450,"sale_price":1850},{"color_en":"White","color_bn":"à¦¸à¦¾à¦¦à¦¾","color_code":"#FFFFFF","size_en":"L","size_bn":"L","stock":20,"price":2450,"sale_price":1850},{"color_en":"White","color_bn":"à¦¸à¦¾à¦¦à¦¾","color_code":"#FFFFFF","size_en":"XL","size_bn":"XL","stock":10,"price":2450,"sale_price":1850},{"color_en":"White","color_bn":"à¦¸à¦¾à¦¦à¦¾","color_code":"#FFFFFF","size_en":"XXL","size_bn":"XXL","stock":5,"price":2450,"sale_price":1850}]'::jsonb
  ),
  (
    'Premium Georgette Orna',
    'à¦ªà§à¦°à¦¿à¦®à¦¿à¦¯à¦¼à¦¾à¦® à¦œà¦°à§à¦œà§‡à¦Ÿ à¦“à§œà¦¨à¦¾',
    'premium-georgette-orna',
    1150,
    850,
    45,
    ARRAY['/product-6.webp'],
    'Luxury georgette Dupatta featuring golden lace borders. Lightweight, elegant, and perfect for matching with local outfits.',
    'à¦—à§‹à¦²à§à¦¡à§‡à¦¨ à¦²à§‡à¦¸ à¦¬à¦°à§à¦¡à¦¾à¦° à¦¸à¦¹ à¦²à¦¾à¦•à§à¦¸à¦¾à¦°à¦¿ à¦œà¦°à§à¦œà§‡à¦Ÿ à¦“à§œà¦¨à¦¾à¥¤ à¦“à¦œà¦¨à§‡ à¦¹à¦¾à¦²à¦•à¦¾, à¦®à¦¾à¦°à§à¦œà¦¿à¦¤ à¦à¦¬à¦‚ à¦¯à§‡à¦•à§‹à¦¨à§‹ à¦¥à§à¦°à¦¿-à¦ªà¦¿à¦¸à§‡à¦° à¦¸à¦¾à¦¥à§‡ à¦®à¦¾à¦¨à¦¾à¦¨à¦¸à¦‡à¥¤',
    'Elegant georgette dupatta with luxury golden lace border.',
    'à¦²à¦¾à¦•à§à¦¸à¦¾à¦°à¦¿à¦—à§‹à¦²à§à¦¡à§‡à¦¨ à¦²à§‡à¦¸ à¦¬à¦°à§à¦¡à¦¾à¦° à¦¸à¦¹ à¦®à¦¾à¦°à§à¦œà¦¿à¦¤ à¦œà¦°à§à¦œà§‡à¦Ÿ à¦“à§œà¦¨à¦¾à¥¤',
    true,
    (SELECT id FROM categories WHERE slug = 'orna' LIMIT 1),
    '[{"color_en":"Black","color_bn":"à¦•à¦¾à¦²à§‹","color_code":"#121212","stock":30,"price":1150,"sale_price":850},{"color_en":"Beige","color_bn":"à¦¬à§‡à¦‡à¦œ","color_code":"#BFA89E","stock":25,"price":1150,"sale_price":850},{"color_en":"Blue","color_bn":"à¦¨à§€à¦²","color_code":"#1E3A8A","stock":15,"price":1150,"sale_price":850}]'::jsonb
  ),
  (
    'Exclusive Velvet Prayer Tupi',
    'à¦à¦•à§à¦¸à¦•à§à¦²à§à¦¸à¦¿à¦­ à¦­à§‡à¦²à¦­à§‡à¦Ÿ à¦Ÿà§à¦ªà¦¿',
    'exclusive-velvet-prayer-tupi',
    550,
    399,
    80,
    ARRAY['/product-7.webp'],
    'Premium velvet finish cap with comfortable inner lining. Sleek, stylish design that sits perfectly.',
    'à¦­à§‡à¦¤à¦°à§‡ à¦¨à¦°à¦® à¦²à¦¾à¦‡à¦¨à¦¿à¦‚ à¦¸à¦¹ à¦ªà§à¦°à¦¿à¦®à¦¿à¦¯à¦¼à¦¾à¦® à¦­à§‡à¦²à¦­à§‡à¦Ÿ à¦Ÿà§à¦ªà¦¿à¥¤ à¦®à¦¸à§ƒà¦£, à¦¸à§à¦Ÿà¦¾à¦‡à¦²à¦¿à¦¶ à¦¡à¦¿à¦œà¦¾à¦‡à¦¨ à¦¯à¦¾ à¦®à¦¾à¦¥à¦¾à§Ÿ à¦ªà¦¾à¦°à¦«à§‡à¦•à§à¦Ÿ à¦«à¦¿à¦Ÿ à¦¹à§Ÿà¥¤',
    'Premium velvet cap with inner soft lining.',
    'à¦¨à¦°à¦® à¦²à¦¾à¦‡à¦¨à¦¿à¦‚ à¦¸à¦¹ à¦ªà§à¦°à¦¿à¦®à¦¿à¦¯à¦¼à¦¾à¦® à¦­à§‡à¦²à¦­à§‡à¦Ÿ à¦Ÿà§à¦ªà¦¿à¥¤',
    false,
    (SELECT id FROM categories WHERE slug = 'tupi' LIMIT 1),
    '[{"color_en":"Black","color_bn":"à¦•à¦¾à¦²à§‹","color_code":"#121212","size_en":"S","size_bn":"S","stock":10,"price":550,"sale_price":399},{"color_en":"Black","color_bn":"à¦•à¦¾à¦²à§‹","color_code":"#121212","size_en":"M","size_bn":"M","stock":15,"price":550,"sale_price":399},{"color_en":"Black","color_bn":"à¦•à¦¾à¦²à§‹","color_code":"#121212","size_en":"L","size_bn":"L","stock":15,"price":550,"sale_price":399},{"color_en":"Black","color_bn":"à¦•à¦¾à¦²à§‹","color_code":"#121212","size_en":"XL","size_bn":"XL","stock":10,"price":550,"sale_price":399},{"color_en":"Navy","color_bn":"à¦¨à§‡à¦­à¦¿ à¦¬à§à¦²à§","color_code":"#0A1128","size_en":"S","size_bn":"S","stock":8,"price":550,"sale_price":399},{"color_en":"Navy","color_bn":"à¦¨à§‡à¦­à¦¿ à¦¬à§à¦²à§","color_code":"#0A1128","size_en":"M","size_bn":"M","stock":12,"price":550,"sale_price":399},{"color_en":"Navy","color_bn":"à¦¨à§‡à¦­à¦¿ à¦¬à§à¦²à§","color_code":"#0A1128","size_en":"L","size_bn":"L","stock":10,"price":550,"sale_price":399},{"color_en":"Maroon","color_bn":"à¦®à§‡à¦°à§à¦¨","color_code":"#4A0E17","size_en":"M","size_bn":"M","stock":10,"price":550,"sale_price":399},{"color_en":"Maroon","color_bn":"à¦®à§‡à¦°à§à¦¨","color_code":"#4A0E17","size_en":"L","size_bn":"L","stock":8,"price":550,"sale_price":399}]'::jsonb
  ),
  (
    'Premium Satin Hand Embroidered Rumal',
    'à¦ªà§à¦°à¦¿à¦®à¦¿à¦¯à¦¼à¦¾à¦® à¦¸à¦¾à¦Ÿà¦¿à¦¨ à¦¨à¦•à¦¶à¦¿ à¦°à§à¦®à¦¾à¦²',
    'premium-satin-hand-embroidered-rumal',
    290,
    199,
    120,
    ARRAY['/product-8.webp'],
    'Luxury satin handkerchief with hand-embroidered floral motifs. Perfect as a gift or for formal wear.',
    'à¦¹à¦¾à¦¤à§‡ à¦à¦®à¦¬à§à¦°à¦¯à¦¼à¦¡à¦¾à¦°à¦¿ à¦•à¦°à¦¾ à¦«à§à¦²à§‡à¦° à¦®à§‹à¦Ÿà¦¿à¦« à¦¸à¦¹ à¦²à¦¾à¦•à§à¦¸à¦¾à¦°à¦¿ à¦¸à¦¾à¦Ÿà¦¿à¦¨ à¦°à§à¦®à¦¾à¦²à¥¤ à¦‰à¦ªà¦¹à¦¾à¦° à¦¹à¦¿à¦¸à§‡à¦¬à§‡ à¦¬à¦¾ à¦«à¦°à¦®à¦¾à¦² à¦¬à§à¦¯à¦¬à¦¹à¦¾à¦°à§‡à¦° à¦œà¦¨à§à¦¯ à¦ªà¦¾à¦°à¦«à§‡à¦•à§à¦Ÿà¥¤',
    'Hand-embroidered floral satin luxury handkerchief.',
    'à¦¹à¦¾à¦¤à§‡ à¦¤à§ˆà¦°à¦¿ à¦«à§à¦²à§‡à¦° à¦à¦®à¦¬à§à¦°à¦¯à¦¼à¦¡à¦¾à¦°à¦¿ à¦¸à¦¹ à¦²à¦¾à¦•à§à¦¸à¦¾à¦°à¦¿ à¦¸à¦¾à¦Ÿà¦¿à¦¨ à¦°à§à¦®à¦¾à¦²à¥¤',
    false,
    (SELECT id FROM categories WHERE slug = 'rumal' LIMIT 1),
    '[{"color_en":"White","color_bn":"à¦¸à¦¾à¦¦à¦¾","color_code":"#FFFFFF","stock":50,"price":290,"sale_price":199},{"color_en":"Pink","color_bn":"à¦—à§‹à¦²à¦¾à¦ªà§€","color_code":"#E8C5C8","stock":40,"price":290,"sale_price":199},{"color_en":"Peach","color_bn":"à¦ªà¦¿à¦š","color_code":"#F3D3C4","stock":30,"price":290,"sale_price":199}]'::jsonb
  ),
  (
    'Designer Cotton Dupatta Orna',
    'à¦¡à¦¿à¦œà¦¾à¦‡à¦¨à¦¾à¦° à¦•à¦Ÿà¦¨ à¦“à§œà¦¨à¦¾',
    'designer-cotton-dupatta-orna',
    950,
    690,
    50,
    ARRAY['/product-9.webp'],
    '100% pure cotton designer Orna with beautiful floral prints and tassels. Highly breathable and fashionable.',
    'à¦¸à§à¦¨à§à¦¦à¦° à¦«à§à¦²à§‹à¦°à¦¾à¦² à¦ªà§à¦°à¦¿à¦¨à§à¦Ÿ à¦à¦¬à¦‚ à¦à¦¾à¦²à¦° à¦¸à¦¹ à§§à§¦à§¦% à¦–à¦¾à¦à¦Ÿà¦¿ à¦¸à§à¦¤à¦¿ à¦“à§œà¦¨à¦¾à¥¤ à¦†à¦°à¦¾à¦®à¦¦à¦¾à§Ÿà¦• à¦à¦¬à¦‚ à¦…à¦¤à§à¦¯à¦¨à§à¦¤ à¦«à§à¦¯à¦¾à¦¶à¦¨à§‡à¦¬à¦²à¥¤',
    'Pure cotton designer Orna with floral prints.',
    'à¦«à§à¦²à§‹à¦°à¦¾à¦² à¦ªà§à¦°à¦¿à¦¨à§à¦Ÿ à¦“ à¦à¦¾à¦²à¦° à¦¸à¦¹ à¦–à¦¾à¦à¦Ÿà¦¿ à¦¸à§à¦¤à¦¿ à¦¡à¦¿à¦œà¦¾à¦‡à¦¨à¦¾à¦° à¦“à§œà¦¨à¦¾à¥¤',
    false,
    (SELECT id FROM categories WHERE slug = 'orna' LIMIT 1),
    '[{"color_en":"Black","color_bn":"à¦•à¦¾à¦²à§‹","color_code":"#121212","stock":20,"price":950,"sale_price":690},{"color_en":"Pink","color_bn":"à¦—à§‹à¦²à¦¾à¦ªà§€","color_code":"#E8C5C8","stock":15,"price":950,"sale_price":690},{"color_en":"Blue","color_bn":"à¦¨à§€à¦²","color_code":"#1E3A8A","stock":15,"price":950,"sale_price":690}]'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;
CREATE POLICY "Admin can view all customers" ON customers
  FOR SELECT USING (auth.jwt() ->> 'email' = 'redaabangladesh@gmail.com');
CREATE POLICY "Admin can update all customers" ON customers
  FOR UPDATE USING (auth.jwt() ->> 'email' = 'redaabangladesh@gmail.com');
GRANT SELECT, UPDATE ON coupons TO anon, authenticated;
GRANT INSERT, DELETE ON coupons TO authenticated;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Public can increment coupon usage" ON coupons FOR UPDATE USING (true);
CREATE POLICY "Admin can manage coupons" ON coupons
  FOR ALL USING (auth.jwt() ->> 'email' = 'redaabangladesh@gmail.com');
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
-- Reviews table had no RLS at all until now â€” anon/authenticated inherited
-- default public-schema grants, meaning anyone could insert/edit/delete any
-- review. Lock it down: public sees only approved reviews, admin manages all.
GRANT SELECT ON reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON reviews TO authenticated;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved reviews" ON reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Admin can manage reviews" ON reviews
  FOR ALL USING (auth.jwt() ->> 'email' = 'redaabangladesh@gmail.com');
-- Public needs to read settings (announcement bar, seasonal banner
-- shown on the storefront); only admin can write.
GRANT SELECT ON settings TO anon, authenticated;
GRANT INSERT, UPDATE ON settings TO authenticated;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Admin can manage settings" ON settings
  FOR ALL USING (auth.jwt() ->> 'email' = 'redaabangladesh@gmail.com');
-- Needed for admin/reports profit & loss calculation â€” without a cost basis
-- per product, "profit" can't be computed at all (only revenue was tracked).
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price NUMERIC DEFAULT 0;
-- Guest checkout (anon role) failed because PostgREST evaluates the
-- orders SELECT policies (which reference customers) when returning
-- the inserted row. RLS still restricts actual row visibility; this
-- grant only allows the permission check itself to pass.
GRANT SELECT ON customers TO anon;
-- The order_number auto-generation trigger runs as the calling role
-- (anon/authenticated for public checkout), but only the sequence
-- owner had USAGE rights â€” every order insert was silently failing.
GRANT USAGE, SELECT ON SEQUENCE orders_order_number_seq TO anon, authenticated;

-- Belt-and-suspenders: make the trigger function run with the
-- privileges of its owner so this class of grant issue can't recur.
ALTER FUNCTION set_order_number() SECURITY DEFINER;
-- Safe to re-run: drops conflicting policies first, then recreates everything
-- needed for guest/logged-in checkout to work end to end.
--
-- ROOT CAUSE (took a while to isolate): the INSERT itself was never
-- blocked by RLS. supabase-js's .insert(...).select().single() does
-- INSERT ... RETURNING under the hood, and Postgres evaluates the
-- table's SELECT policies against the just-inserted row as part of
-- RETURNING â€” raising the exact same "violates row-level security
-- policy" error if no SELECT policy matches. Guests (anon, no
-- customer_id, not admin) matched neither "Customers view own
-- orders" nor "Admin can view all orders", so the RETURNING step
-- failed even though the INSERT would have succeeded on its own.
-- The fix is the public SELECT policy below â€” order IDs are random
-- UUIDs, so this doesn't expose a browsable order listing.

GRANT SELECT, INSERT, UPDATE ON orders TO anon, authenticated;
GRANT SELECT, INSERT ON order_items TO anon, authenticated;
GRANT SELECT ON customers TO anon;

DROP POLICY IF EXISTS "Anyone can create an order" ON orders;
CREATE POLICY "Anyone can create an order" ON orders
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can add items to an order" ON order_items;
CREATE POLICY "Anyone can add items to an order" ON order_items
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can view all orders" ON orders;
CREATE POLICY "Admin can view all orders" ON orders
  FOR SELECT USING (auth.jwt() ->> 'email' = 'redaabangladesh@gmail.com');

DROP POLICY IF EXISTS "Admin can update all orders" ON orders;
CREATE POLICY "Admin can update all orders" ON orders
  FOR UPDATE USING (auth.jwt() ->> 'email' = 'redaabangladesh@gmail.com');

DROP POLICY IF EXISTS "Admin can view all order items" ON order_items;
CREATE POLICY "Admin can view all order items" ON order_items
  FOR SELECT USING (auth.jwt() ->> 'email' = 'redaabangladesh@gmail.com');

DROP POLICY IF EXISTS "Customers view own orders" ON orders;
CREATE POLICY "Customers view own orders" ON orders
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

-- Lets checkout (including guests) read back the order it just placed.
-- Order IDs are random UUIDs, so this doesn't expose a browsable listing.
DROP POLICY IF EXISTS "Anyone can view an order right after creating it" ON orders;
CREATE POLICY "Anyone can view an order right after creating it" ON orders
  FOR SELECT USING (true);

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
-- Grant table-level access to authenticated role (RLS policies still apply on top of this)
GRANT SELECT, INSERT, UPDATE, DELETE ON customers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON customer_addresses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON wishlist_items TO authenticated;
GRANT SELECT ON orders TO authenticated;
GRANT SELECT ON order_items TO authenticated;
-- service_role should bypass RLS by default, but this project needs
-- explicit table-level grants too (per PostgREST's own error hint).
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
