-- Public needs to read settings (announcement bar, seasonal banner
-- shown on the storefront); only admin can write.
GRANT SELECT ON settings TO anon, authenticated;
GRANT INSERT, UPDATE ON settings TO authenticated;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Admin can manage settings" ON settings
  FOR ALL USING (auth.jwt() ->> 'email' = 'redaabangladesh@gmail.com');
