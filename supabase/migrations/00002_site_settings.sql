-- ============================================
-- SITE SETTINGS - Persistent admin settings
-- ============================================

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Site settings are viewable by everyone" ON site_settings;
CREATE POLICY "Site settings are viewable by everyone" ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;
CREATE POLICY "Admins can manage site settings" ON site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Seed default settings
INSERT INTO site_settings (key, value) VALUES ('branding', '{
  "siteName": "Atelier Riman",
  "tagline": "Sharjah'\''s Most Majestic Couture",
  "logoText": "Riman"
}'::jsonb) ON CONFLICT (key) DO NOTHING;

INSERT INTO site_settings (key, value) VALUES ('contact', '{
  "email": "hello@rimanfashion.com",
  "phone": "+971 50 123 4567",
  "address": "Al Zahra St, Sharjah, UAE",
  "hours": "Sat-Thu, 10am - 8pm"
}'::jsonb) ON CONFLICT (key) DO NOTHING;

INSERT INTO site_settings (key, value) VALUES ('social', '{
  "instagram": "@rimanfashion",
  "whatsapp": "+971501234567",
  "facebook": "rimanfashion",
  "twitter": "rimanfashion",
  "youtube": "rimanfashion",
  "tiktok": "@rimanfashion",
  "pinterest": "rimanfashion"
}'::jsonb) ON CONFLICT (key) DO NOTHING;

INSERT INTO site_settings (key, value) VALUES ('features', '{
  "newsletter": true,
  "whatsappBtn": true,
  "preloader": true,
  "instagramFeed": true,
  "cookieBanner": true,
  "scrollReveal": true,
  "threeDViewer": true
}'::jsonb) ON CONFLICT (key) DO NOTHING;

INSERT INTO site_settings (key, value) VALUES ('advanced', '{
  "metaDescription": "Atelier Riman - Sharjah'\''s premier bridal and evening couture atelier.",
  "ogImageUrl": "",
  "keywords": "bridal gowns, evening dresses, couture, Sharjah, UAE",
  "gaId": "",
  "plausibleDomain": "",
  "fathomSiteId": "",
  "maintenanceMode": false,
  "maintenanceMessage": "Our atelier is currently being curated. We will return shortly.",
  "customHeadCode": ""
}'::jsonb) ON CONFLICT (key) DO NOTHING;

INSERT INTO site_settings (key, value) VALUES ('policies', '{
  "rentalPeriodDays": 7,
  "depositAmount": 5000,
  "insuranceText": "7-day hire period includes eco-friendly dry cleaning and couture insurance.",
  "lateReturnFee": "AED 500 per day",
  "shippingInfo": "Complimentary delivery within UAE and GCC.",
  "returnPolicy": "All sales are final. Rental items must be returned within the agreed period."
}'::jsonb) ON CONFLICT (key) DO NOTHING;
