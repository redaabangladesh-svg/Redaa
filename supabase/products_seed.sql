-- Categories used by the storefront filter/shop pages
INSERT INTO categories (name_en, name_bn, slug) VALUES
  ('Panjabi', 'পাঞ্জাবি', 'panjabi'),
  ('Tupi', 'টুপি', 'tupi'),
  ('Rumal', 'রুমাল', 'rumal'),
  ('Orna', 'ওড়না', 'orna')
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
