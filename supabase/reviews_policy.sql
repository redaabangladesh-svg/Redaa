-- Reviews table had no RLS at all until now — anon/authenticated inherited
-- default public-schema grants, meaning anyone could insert/edit/delete any
-- review. Lock it down: public sees only approved reviews, admin manages all.
GRANT SELECT ON reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON reviews TO authenticated;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved reviews" ON reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Admin can manage reviews" ON reviews
  FOR ALL USING (auth.jwt() ->> 'email' = 'redaabangladesh@gmail.com');
