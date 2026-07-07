-- Categories used by the storefront filter/shop pages
INSERT INTO categories (name_en, name_bn, slug) VALUES
  ('Flower Tub', 'ফ্লাওয়ার টাব', 'flower-tub'),
  ('Tree Plant', 'ট্রি প্ল্যান্ট', 'tree-plant'),
  ('Wall Stand', 'ওয়াল স্ট্যান্ড', 'wall-stand')
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
  FOR ALL USING (auth.jwt() ->> 'email' = 'info.sicilybd@gmail.com');
CREATE POLICY "Admin can manage categories" ON categories
  FOR ALL USING (auth.jwt() ->> 'email' = 'info.sicilybd@gmail.com');

-- Seed the existing 12-product catalog into the real products table
INSERT INTO products (name_en, name_bn, slug, price, sale_price, stock, images, category_id, is_featured, seo_title_en, seo_title_bn)
SELECT
  v.name_en, v.name_bn, v.slug, v.price, v.sale_price, v.stock,
  ARRAY[v.image],
  (SELECT id FROM categories WHERE slug = v.category_slug),
  v.is_featured,
  v.name_en, v.name_bn
FROM (VALUES
  ('Premium Quality Bird Nest', 'প্রিমিয়াম কোয়ালিটি বার্ড নেস্ট', 'premium-quality-bird-nest', 1250, 990, 8, '/02.09.23.jpg', 'wall-stand', true),
  ('Premium Orchid Bouquet', 'ঘর সাজান আভিজাত্যে প্রিমিয়াম অর্কিড', 'premium-orchid-bouquet', 850, NULL, 20, '/37-5.jpg', 'flower-tub', true),
  ('Premium Areca Palm', 'প্রিমিয়াম এরিকা পাম বড় কাঠের টব সহ', 'premium-areca-palm', 1500, 1200, 4, '/38-7.jpg', 'wall-stand', false),
  ('Premium Orchid in Ceramic Pot', 'সিরামিক টবে প্রিমিয়াম অর্কিড', 'premium-orchid-ceramic-pot', 920, 750, 3, '/47-3.jpg', 'flower-tub', false),
  ('Serene Yellow Orchid', 'হলুদ অর্কিডের স্নিগ্ধতায় সাজুক ঘর', 'serene-yellow-orchid', 1100, NULL, 5, '/49.jpg', 'wall-stand', false),
  ('Metal Stand with Flower Tub', 'মেটাল স্ট্যান্ড উইথ ফ্লাওয়ার টব', 'metal-stand-flower-tub', 1550, 1390, 15, '/51-2.jpg', 'wall-stand', true),
  ('Eye-catching Premium Orchid', 'নজরকাড়া প্রিমিয়াম অর্কিড সিরামিক টব সহ', 'eyecatching-premium-orchid', 950, 850, 12, '/55-3.jpg', 'flower-tub', false),
  ('Handcrafted Mahogany Frame', 'হ্যান্ডক্রাফটেড মেহগনি ফ্রেম', 'handcrafted-mahogany-frame', 1800, 1490, 9, '/38-7.jpg', 'wall-stand', false),
  ('Premium Magnolia in Ceramic Pot', 'সিরামিক টবে প্রিমিয়াম ম্যাগনোলিয়া', 'premium-magnolia-ceramic-pot', 1150, 990, 6, '/Magnolia-Flower.png', 'flower-tub', false),
  ('Modern A-Frame Wall Shelf', 'মডার্ন এ-ফ্রেম ওয়াল শেলফ', 'modern-aframe-wall-shelf', 1350, NULL, 7, '/file_000000001bbc720894d5059a36ed2d3e.png', 'wall-stand', false),
  ('Thai Banana Tree', 'ইনডোর ডেকোরে ইউনিক লুক থাই বানানা ট্রি', 'thai-banana-tree', 2200, 1890, 5, '/banana-tree.jpg', 'tree-plant', true),
  ('Green Fern Plant', 'সবুজ ফার্ন প্ল্যান্ট', 'green-fern-plant', 1200, 990, 14, '/55-3.jpg', 'tree-plant', false)
) AS v(name_en, name_bn, slug, price, sale_price, stock, image, category_slug, is_featured)
ON CONFLICT (slug) DO NOTHING;
