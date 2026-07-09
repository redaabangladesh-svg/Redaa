-- ============================================================
-- REDAA — Full Database Setup (Run once in Supabase SQL Editor)
-- ============================================================
-- Drop existing tables (fresh install)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS blocked_phones CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS sms_log CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customer_addresses CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- ── 1. CATEGORIES ────────────────────────────────────────────
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en    TEXT NOT NULL,
  name_bn    TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  image      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. PRODUCTS ──────────────────────────────────────────────
CREATE TABLE products (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en              TEXT NOT NULL,
  name_bn              TEXT NOT NULL,
  slug                 TEXT UNIQUE NOT NULL,
  price                NUMERIC NOT NULL,
  sale_price           NUMERIC,
  stock                INTEGER DEFAULT 0,
  images               TEXT[] DEFAULT '{}',
  description_en       TEXT,
  description_bn       TEXT,
  short_description_en TEXT,
  short_description_bn TEXT,
  category_id          UUID REFERENCES categories(id),
  variants             JSONB DEFAULT '[]',
  landing_page_active  BOOLEAN DEFAULT false,
  landing_content      JSONB DEFAULT '{}',
  seo_title_en         TEXT,
  seo_title_bn         TEXT,
  seo_description_en   TEXT,
  seo_description_bn   TEXT,
  is_featured          BOOLEAN DEFAULT false,
  low_stock_threshold  INTEGER DEFAULT 5,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. CUSTOMERS (auth_user_id included from start) ──────────
CREATE TABLE customers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  email        TEXT,
  phone        TEXT NOT NULL DEFAULT ('pending-' || gen_random_uuid()::TEXT),
  address      TEXT,
  district     TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent  NUMERIC DEFAULT 0,
  is_blocked   BOOLEAN DEFAULT false,
  block_reason TEXT,
  tags         TEXT[] DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. CUSTOMER ADDRESSES ────────────────────────────────────
CREATE TABLE customer_addresses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    UUID REFERENCES customers(id) ON DELETE CASCADE,
  label          TEXT NOT NULL DEFAULT 'Home',
  recipient_name TEXT NOT NULL,
  phone          TEXT NOT NULL,
  address        TEXT NOT NULL,
  district       TEXT NOT NULL,
  area           TEXT,
  is_default     BOOLEAN DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. ORDERS ────────────────────────────────────────────────
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    TEXT UNIQUE NOT NULL,
  customer_id     UUID REFERENCES customers(id),
  customer_name   TEXT NOT NULL,
  phone           TEXT NOT NULL,
  address         TEXT NOT NULL,
  district        TEXT NOT NULL,
  area            TEXT,
  subtotal        NUMERIC NOT NULL,
  delivery_charge NUMERIC DEFAULT 0,
  discount        NUMERIC DEFAULT 0,
  total           NUMERIC NOT NULL,
  payment_method  TEXT NOT NULL,
  payment_status  TEXT DEFAULT 'pending',
  order_status    TEXT DEFAULT 'new',
  courier         TEXT,
  tracking_number TEXT,
  source          TEXT DEFAULT 'website',
  fraud_score     INTEGER DEFAULT 0,
  fraud_flags     TEXT[] DEFAULT '{}',
  coupon_code     TEXT,
  notes           TEXT,
  sms_sent        BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. ORDER ITEMS ───────────────────────────────────────────
CREATE TABLE order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  variant      JSONB,
  qty          INTEGER NOT NULL,
  price        NUMERIC NOT NULL
);

-- ── 7. COUPONS ───────────────────────────────────────────────
CREATE TABLE coupons (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code       TEXT UNIQUE NOT NULL,
  type       TEXT NOT NULL,
  value      NUMERIC NOT NULL,
  min_order  NUMERIC DEFAULT 0,
  max_uses   INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. SMS LOG ───────────────────────────────────────────────
CREATE TABLE sms_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone      TEXT NOT NULL,
  message    TEXT NOT NULL,
  status     TEXT DEFAULT 'pending',
  order_id   UUID REFERENCES orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 9. SETTINGS ──────────────────────────────────────────────
CREATE TABLE settings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT UNIQUE NOT NULL,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 10. BLOCKED PHONES ───────────────────────────────────────
CREATE TABLE blocked_phones (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone      TEXT UNIQUE NOT NULL,
  reason     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 11. REVIEWS ──────────────────────────────────────────────
CREATE TABLE reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID REFERENCES products(id),
  customer_name TEXT NOT NULL,
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  image         TEXT,
  is_approved   BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE categories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons            ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_log            ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_phones     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews            ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Categories & Products: public read
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read products"   ON products   FOR SELECT USING (true);

-- Reviews: public read approved only
CREATE POLICY "Public read approved reviews" ON reviews FOR SELECT USING (is_approved = true);

-- Coupons: public read active
CREATE POLICY "Public read active coupons" ON coupons FOR SELECT USING (is_active = true);

-- Customers: own row only
CREATE POLICY "Customer read own profile"   ON customers FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Customer update own profile" ON customers FOR UPDATE USING (auth.uid() = auth_user_id);
CREATE POLICY "Customer insert own profile" ON customers FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Customer Addresses: own rows only
CREATE POLICY "Customer read own addresses"   ON customer_addresses FOR SELECT USING (
  customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Customer insert own address"   ON customer_addresses FOR INSERT WITH CHECK (
  customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Customer update own address"   ON customer_addresses FOR UPDATE USING (
  customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Customer delete own address"   ON customer_addresses FOR DELETE USING (
  customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
);

-- Orders: customers view own orders
CREATE POLICY "Customers view own orders" ON orders FOR SELECT USING (
  customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
);

-- Order Items: customers view own
CREATE POLICY "Customers view own order items" ON order_items FOR SELECT USING (
  order_id IN (
    SELECT id FROM orders WHERE customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  )
);

-- Revoke direct browser access (API routes use service_role)
REVOKE INSERT, SELECT, UPDATE ON orders      FROM anon;
REVOKE INSERT, SELECT          ON order_items FROM anon;
REVOKE UPDATE                  ON coupons     FROM anon;

-- ============================================================
-- HELPER FUNCTION: decrement stock
-- ============================================================
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id uuid, p_qty int)
RETURNS void
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products SET stock = GREATEST(stock - p_qty, 0) WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION decrement_stock(uuid, int) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION decrement_stock(uuid, int) TO service_role;

-- ============================================================
-- FUNCTION: Auto-create customer row on Google login
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO customers (auth_user_id, name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Customer'),
    NEW.email,
    'pending-' || NEW.id::TEXT
  )
  ON CONFLICT (auth_user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- DEFAULT SETTINGS
-- ============================================================
INSERT INTO settings (key, value) VALUES
  ('delivery_inside_dhaka',  '60'),
  ('delivery_outside_dhaka', '120'),
  ('store_name',             'Redaa'),
  ('store_phone',            '01970452723'),
  ('store_address',          'Dhaka, Bangladesh'),
  ('ssl_enabled',            'false')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
