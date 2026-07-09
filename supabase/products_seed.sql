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


-- Seeding mock products for Redaa catalog with variants
INSERT INTO products (
  name_en, name_bn, slug, price, sale_price, stock, images,
  description_en, description_bn, short_description_en, short_description_bn,
  is_featured, category_id, variants
) VALUES
  (
    'Premium Embroidered Black Panjabi',
    'প্রিমিয়াম ব্ল্যাক এমব্রয়ডারি পাঞ্জাবি',
    'premium-embroidered-black-panjabi',
    2850,
    2250,
    50,
    ARRAY['/product-1.webp'],
    'Crafted from premium quality cotton fabric with intricate embroidery on the collar and placket. Perfect for festivals and special occasions.',
    'কলার এবং প্ল্যাকেটে সূক্ষ্ম এমব্রয়ডারি কাজ সহ প্রিমিয়াম মানের সুতি কাপড় থেকে তৈরি। উৎসব এবং বিশেষ অনুষ্ঠানের জন্য উপযুক্ত।',
    'Premium cotton embroidered Panjabi for Eid and special occasions.',
    'ঈদ এবং বিশেষ অনুষ্ঠানের জন্য প্রিমিয়াম কটন এমব্রয়ডারি পাঞ্জাবি।',
    true,
    (SELECT id FROM categories WHERE slug = 'panjabi' LIMIT 1),
    '[{"color_en":"Black","color_bn":"কালো","color_code":"#121212","size_en":"S","size_bn":"S","stock":10,"price":2850,"sale_price":2250},{"color_en":"Black","color_bn":"কালো","color_code":"#121212","size_en":"M","size_bn":"M","stock":15,"price":2850,"sale_price":2250},{"color_en":"Black","color_bn":"কালো","color_code":"#121212","size_en":"L","size_bn":"L","stock":12,"price":2850,"sale_price":2250},{"color_en":"Black","color_bn":"কালো","color_code":"#121212","size_en":"XL","size_bn":"XL","stock":8,"price":2850,"sale_price":2250},{"color_en":"Black","color_bn":"কালো","color_code":"#121212","size_en":"XXL","size_bn":"XXL","stock":5,"price":2850,"sale_price":2250},{"color_en":"Slate","color_bn":"স্লেট","color_code":"#5C6B73","size_en":"S","size_bn":"S","stock":5,"price":2850,"sale_price":2250},{"color_en":"Slate","color_bn":"স্লেট","color_code":"#5C6B73","size_en":"M","size_bn":"M","stock":10,"price":2850,"sale_price":2250},{"color_en":"Slate","color_bn":"স্লেট","color_code":"#5C6B73","size_en":"L","size_bn":"L","stock":10,"price":2850,"sale_price":2250},{"color_en":"Slate","color_bn":"স্লেট","color_code":"#5C6B73","size_en":"XL","size_bn":"XL","stock":5,"price":2850,"sale_price":2250},{"color_en":"Slate","color_bn":"স্লেট","color_code":"#5C6B73","size_en":"XXL","size_bn":"XXL","stock":2,"price":2850,"sale_price":2250},{"color_en":"Brown","color_bn":"ব্রাউন","color_code":"#8E704D","size_en":"S","size_bn":"S","stock":4,"price":2850,"sale_price":2250},{"color_en":"Brown","color_bn":"ব্রাউন","color_code":"#8E704D","size_en":"M","size_bn":"M","stock":8,"price":2850,"sale_price":2250},{"color_en":"Brown","color_bn":"ব্রাউন","color_code":"#8E704D","size_en":"L","size_bn":"L","stock":8,"price":2850,"sale_price":2250},{"color_en":"Brown","color_bn":"ব্রাউন","color_code":"#8E704D","size_en":"XL","size_bn":"XL","stock":3,"price":2850,"sale_price":2250},{"color_en":"Beige","color_bn":"বেইজ","color_code":"#BFA89E","size_en":"S","size_bn":"S","stock":4,"price":2850,"sale_price":2250},{"color_en":"Beige","color_bn":"বেইজ","color_code":"#BFA89E","size_en":"M","size_bn":"M","stock":8,"price":2850,"sale_price":2250},{"color_en":"Beige","color_bn":"বেইজ","color_code":"#BFA89E","size_en":"L","size_bn":"L","stock":8,"price":2850,"sale_price":2250},{"color_en":"Beige","color_bn":"বেইজ","color_code":"#BFA89E","size_en":"XL","size_bn":"XL","stock":4,"price":2850,"sale_price":2250}]'::jsonb
  ),
  (
    'Classic Kabli Panjabi Suit',
    'ক্লাসিক কাবলি পাঞ্জাবি সুট',
    'classic-kabli-panjabi-suit',
    3450,
    2850,
    35,
    ARRAY['/product-2.webp'],
    'Elegant Kabli suit featuring a matching pajama. Designed with high-quality fabric for ultimate comfort and style.',
    'ম্যাচিং পায়জামা সহ মার্জিত কাবলি সেট। সর্বোচ্চ আরাম এবং স্টাইলের জন্য উচ্চ মানের কাপড় দিয়ে ডিজাইন করা হয়েছে।',
    'Premium Kabli Panjabi suit set with matching pajama.',
    'ম্যাচিং পায়জামা সহ প্রিমিয়াম কাবলি পাঞ্জাবি সেট।',
    true,
    (SELECT id FROM categories WHERE slug = 'panjabi' LIMIT 1),
    '[{"color_en":"Black","color_bn":"কালো","color_code":"#121212","size_en":"S","size_bn":"S","stock":5,"price":3450,"sale_price":2850},{"color_en":"Black","color_bn":"কালো","color_code":"#121212","size_en":"M","size_bn":"M","stock":8,"price":3450,"sale_price":2850},{"color_en":"Black","color_bn":"কালো","color_code":"#121212","size_en":"L","size_bn":"L","stock":8,"price":3450,"sale_price":2850},{"color_en":"Black","color_bn":"কালো","color_code":"#121212","size_en":"XL","size_bn":"XL","stock":4,"price":3450,"sale_price":2850},{"color_en":"Slate","color_bn":"স্লেট","color_code":"#5C6B73","size_en":"S","size_bn":"S","stock":4,"price":3450,"sale_price":2850},{"color_en":"Slate","color_bn":"স্লেট","color_code":"#5C6B73","size_en":"M","size_bn":"M","stock":6,"price":3450,"sale_price":2850},{"color_en":"Slate","color_bn":"স্লেট","color_code":"#5C6B73","size_en":"L","size_bn":"L","stock":6,"price":3450,"sale_price":2850},{"color_en":"Slate","color_bn":"স্লেট","color_code":"#5C6B73","size_en":"XL","size_bn":"XL","stock":3,"price":3450,"sale_price":2850}]'::jsonb
  ),
  (
    'Handmade Premium Prayer Tupi',
    'হ্যান্ডমেড প্রিমিয়াম নামাজের টুপি',
    'handmade-premium-prayer-tupi',
    650,
    490,
    100,
    ARRAY['/product-3.webp'],
    'Beautifully hand-crafted premium prayer cap. Soft, breathable cotton threads, comfortable for all-day wear.',
    'সুন্দরভাবে হাতে বোনা প্রিমিয়াম টুপি। নরম, আরামদায়ক সুতি সুতা দিয়ে তৈরি, যা সারাদিন পরার জন্য আরামদায়ক।',
    'Handcrafted premium quality soft cotton prayer cap.',
    'হাতে তৈরি প্রিমিয়াম মানের নরম সুতি টুপি।',
    true,
    (SELECT id FROM categories WHERE slug = 'tupi' LIMIT 1),
    '[{"color_en":"White","color_bn":"সাদা","color_code":"#FFFFFF","size_en":"S","size_bn":"S","stock":20,"price":650,"sale_price":490},{"color_en":"White","color_bn":"সাদা","color_code":"#FFFFFF","size_en":"M","size_bn":"M","stock":30,"price":650,"sale_price":490},{"color_en":"White","color_bn":"সাদা","color_code":"#FFFFFF","size_en":"L","size_bn":"L","stock":25,"price":650,"sale_price":490},{"color_en":"White","color_bn":"সাদা","color_code":"#FFFFFF","size_en":"XL","size_bn":"XL","stock":15,"price":650,"sale_price":490},{"color_en":"Black","color_bn":"কালো","color_code":"#121212","size_en":"S","size_bn":"S","stock":10,"price":650,"sale_price":490},{"color_en":"Black","color_bn":"কালো","color_code":"#121212","size_en":"M","size_bn":"M","stock":15,"price":650,"sale_price":490},{"color_en":"Black","color_bn":"কালো","color_code":"#121212","size_en":"L","size_bn":"L","stock":15,"price":650,"sale_price":490},{"color_en":"Black","color_bn":"কালো","color_code":"#121212","size_en":"XL","size_bn":"XL","stock":8,"price":650,"sale_price":490}]'::jsonb
  ),
  (
    'Pure Cotton Premium Rumal',
    'পিউর কটন প্রিমিয়াম রুমাল',
    'pure-cotton-premium-rumal',
    180,
    130,
    200,
    ARRAY['/product-4.webp'],
    'High absorbance pure cotton handkerchief. Soft texture that is gentle on skin, durable stitched edges.',
    'উচ্চ শোষণ ক্ষমতা সম্পন্ন খাঁটি সুতি রুমাল। নরম টেক্সচার যা ত্বকে আরাম দেয়, টেকসই সেলাই করা প্রান্ত।',
    'Highly absorbent, ultra-soft pure cotton handkerchief.',
    'উচ্চ শোষণ ক্ষমতা সম্পন্ন, অতি-নরম খাঁটি সুতি রুমাল।',
    true,
    (SELECT id FROM categories WHERE slug = 'rumal' LIMIT 1),
    '[{"color_en":"White","color_bn":"সাদা","color_code":"#FFFFFF","stock":100,"price":180,"sale_price":130},{"color_en":"Black","color_bn":"কালো","color_code":"#121212","stock":80,"price":180,"sale_price":130},{"color_en":"Blue","color_bn":"নীল","color_code":"#1E3A8A","stock":50,"price":180,"sale_price":130}]'::jsonb
  ),
  (
    'Royal Cotton White Panjabi',
    'রয়্যাল কটন হোয়াইট পাঞ্জাবি',
    'royal-cotton-white-panjabi',
    2450,
    1850,
    60,
    ARRAY['/product-5.webp'],
    'Timeless white cotton Panjabi with minimalist design. Light, breathable, and highly comfortable.',
    'ন্যূনতম ডিজাইনের সাদা সুতি পাঞ্জাবি। হালকা, আরামদায়ক এবং দীর্ঘস্থায়ী।',
    'Classic white cotton Panjabi with minimalist styling.',
    'ন্যূনতম স্টাইলিশ ডিজাইন সহ ক্লাসিক সাদা সুতি পাঞ্জাবি।',
    false,
    (SELECT id FROM categories WHERE slug = 'panjabi' LIMIT 1),
    '[{"color_en":"White","color_bn":"সাদা","color_code":"#FFFFFF","size_en":"S","size_bn":"S","stock":15,"price":2450,"sale_price":1850},{"color_en":"White","color_bn":"সাদা","color_code":"#FFFFFF","size_en":"M","size_bn":"M","stock":20,"price":2450,"sale_price":1850},{"color_en":"White","color_bn":"সাদা","color_code":"#FFFFFF","size_en":"L","size_bn":"L","stock":20,"price":2450,"sale_price":1850},{"color_en":"White","color_bn":"সাদা","color_code":"#FFFFFF","size_en":"XL","size_bn":"XL","stock":10,"price":2450,"sale_price":1850},{"color_en":"White","color_bn":"সাদা","color_code":"#FFFFFF","size_en":"XXL","size_bn":"XXL","stock":5,"price":2450,"sale_price":1850}]'::jsonb
  ),
  (
    'Premium Georgette Orna',
    'প্রিমিয়াম জর্জেট ওড়না',
    'premium-georgette-orna',
    1150,
    850,
    45,
    ARRAY['/product-6.webp'],
    'Luxury georgette Dupatta featuring golden lace borders. Lightweight, elegant, and perfect for matching with local outfits.',
    'গোল্ডেন লেস বর্ডার সহ লাক্সারি জর্জেট ওড়না। ওজনে হালকা, মার্জিত এবং যেকোনো থ্রি-পিসের সাথে মানানসই।',
    'Elegant georgette dupatta with luxury golden lace border.',
    'লাক্সারিগোল্ডেন লেস বর্ডার সহ মার্জিত জর্জেট ওড়না।',
    true,
    (SELECT id FROM categories WHERE slug = 'orna' LIMIT 1),
    '[{"color_en":"Black","color_bn":"কালো","color_code":"#121212","stock":30,"price":1150,"sale_price":850},{"color_en":"Beige","color_bn":"বেইজ","color_code":"#BFA89E","stock":25,"price":1150,"sale_price":850},{"color_en":"Blue","color_bn":"নীল","color_code":"#1E3A8A","stock":15,"price":1150,"sale_price":850}]'::jsonb
  ),
  (
    'Exclusive Velvet Prayer Tupi',
    'এক্সক্লুসিভ ভেলভেট টুপি',
    'exclusive-velvet-prayer-tupi',
    550,
    399,
    80,
    ARRAY['/product-7.webp'],
    'Premium velvet finish cap with comfortable inner lining. Sleek, stylish design that sits perfectly.',
    'ভেতরে নরম লাইনিং সহ প্রিমিয়াম ভেলভেট টুপি। মসৃণ, স্টাইলিশ ডিজাইন যা মাথায় পারফেক্ট ফিট হয়।',
    'Premium velvet cap with inner soft lining.',
    'নরম লাইনিং সহ প্রিমিয়াম ভেলভেট টুপি।',
    false,
    (SELECT id FROM categories WHERE slug = 'tupi' LIMIT 1),
    '[{"color_en":"Black","color_bn":"কালো","color_code":"#121212","size_en":"S","size_bn":"S","stock":10,"price":550,"sale_price":399},{"color_en":"Black","color_bn":"কালো","color_code":"#121212","size_en":"M","size_bn":"M","stock":15,"price":550,"sale_price":399},{"color_en":"Black","color_bn":"কালো","color_code":"#121212","size_en":"L","size_bn":"L","stock":15,"price":550,"sale_price":399},{"color_en":"Black","color_bn":"কালো","color_code":"#121212","size_en":"XL","size_bn":"XL","stock":10,"price":550,"sale_price":399},{"color_en":"Navy","color_bn":"নেভি ব্লু","color_code":"#0A1128","size_en":"S","size_bn":"S","stock":8,"price":550,"sale_price":399},{"color_en":"Navy","color_bn":"নেভি ব্লু","color_code":"#0A1128","size_en":"M","size_bn":"M","stock":12,"price":550,"sale_price":399},{"color_en":"Navy","color_bn":"নেভি ব্লু","color_code":"#0A1128","size_en":"L","size_bn":"L","stock":10,"price":550,"sale_price":399},{"color_en":"Maroon","color_bn":"মেরুন","color_code":"#4A0E17","size_en":"M","size_bn":"M","stock":10,"price":550,"sale_price":399},{"color_en":"Maroon","color_bn":"মেরুন","color_code":"#4A0E17","size_en":"L","size_bn":"L","stock":8,"price":550,"sale_price":399}]'::jsonb
  ),
  (
    'Premium Satin Hand Embroidered Rumal',
    'প্রিমিয়াম সাটিন নকশি রুমাল',
    'premium-satin-hand-embroidered-rumal',
    290,
    199,
    120,
    ARRAY['/product-8.webp'],
    'Luxury satin handkerchief with hand-embroidered floral motifs. Perfect as a gift or for formal wear.',
    'হাতে এমব্রয়ডারি করা ফুলের মোটিফ সহ লাক্সারি সাটিন রুমাল। উপহার হিসেবে বা ফরমাল ব্যবহারের জন্য পারফেক্ট।',
    'Hand-embroidered floral satin luxury handkerchief.',
    'হাতে তৈরি ফুলের এমব্রয়ডারি সহ লাক্সারি সাটিন রুমাল।',
    false,
    (SELECT id FROM categories WHERE slug = 'rumal' LIMIT 1),
    '[{"color_en":"White","color_bn":"সাদা","color_code":"#FFFFFF","stock":50,"price":290,"sale_price":199},{"color_en":"Pink","color_bn":"গোলাপী","color_code":"#E8C5C8","stock":40,"price":290,"sale_price":199},{"color_en":"Peach","color_bn":"পিচ","color_code":"#F3D3C4","stock":30,"price":290,"sale_price":199}]'::jsonb
  ),
  (
    'Designer Cotton Dupatta Orna',
    'ডিজাইনার কটন ওড়না',
    'designer-cotton-dupatta-orna',
    950,
    690,
    50,
    ARRAY['/product-9.webp'],
    '100% pure cotton designer Orna with beautiful floral prints and tassels. Highly breathable and fashionable.',
    'সুন্দর ফ্লোরাল প্রিন্ট এবং ঝালর সহ ১০০% খাঁটি সুতি ওড়না। আরামদায়ক এবং অত্যন্ত ফ্যাশনেবল।',
    'Pure cotton designer Orna with floral prints.',
    'ফ্লোরাল প্রিন্ট ও ঝালর সহ খাঁটি সুতি ডিজাইনার ওড়না।',
    false,
    (SELECT id FROM categories WHERE slug = 'orna' LIMIT 1),
    '[{"color_en":"Black","color_bn":"কালো","color_code":"#121212","stock":20,"price":950,"sale_price":690},{"color_en":"Pink","color_bn":"গোলাপী","color_code":"#E8C5C8","stock":15,"price":950,"sale_price":690},{"color_en":"Blue","color_bn":"নীল","color_code":"#1E3A8A","stock":15,"price":950,"sale_price":690}]'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;
