GRANT SELECT, UPDATE ON coupons TO anon, authenticated;
GRANT INSERT, DELETE ON coupons TO authenticated;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Public can increment coupon usage" ON coupons FOR UPDATE USING (true);
CREATE POLICY "Admin can manage coupons" ON coupons
  FOR ALL USING (auth.jwt() ->> 'email' = 'info.sicilybd@gmail.com');
