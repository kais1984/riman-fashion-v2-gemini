/* Riman Fashion - combined schema. Paste ALL of this into the Supabase dashboard SQL Editor and click Run. Safe to re-run. */
-- ============================================
-- RIMAN FASHION - Complete Database Schema
-- Idempotent version - safe to re-run
-- ============================================

-- ============================================
-- 1. PROFILES (extends Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.is_admin());

-- Public safe columns only via view (no email/phone)
CREATE OR REPLACE VIEW profiles_public AS
  SELECT id, name, avatar_url FROM profiles;

GRANT SELECT ON profiles_public TO anon;
GRANT SELECT ON profiles_public TO authenticated;

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM site_settings
        WHERE key = 'admin_emails'
          AND NEW.email = ANY (SELECT jsonb_array_elements_text(value))
      ) THEN 'admin'
      ELSE 'client'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. PRODUCTS
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  product_type TEXT NOT NULL CHECK (product_type IN ('sale', 'rent', 'both')),
  sale_price INTEGER,
  rental_price INTEGER,
  security_deposit INTEGER,
  images TEXT[] NOT NULL DEFAULT '{}',
  video_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('Bridal Gown', 'Evening Dress', 'Accessory', 'Fine Jewelry')),
  style TEXT[] NOT NULL DEFAULT '{}',
  color TEXT[] NOT NULL DEFAULT '{}',
  fabric TEXT,
  designer TEXT,
  sizes TEXT[] NOT NULL DEFAULT '{}',
  is_new BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  glb_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (
  public.is_admin()
) WITH CHECK (
  public.is_admin()
);

-- ============================================
-- 3. CUSTOMERS
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'United Arab Emirates',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(email)
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage customers" ON customers;
DROP POLICY IF EXISTS "Admins can manage customers" ON customers;
CREATE POLICY "Admins can manage customers" ON customers FOR ALL USING (
  public.is_admin()
);

-- ============================================
-- 4. ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  user_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled')
  ),
  type TEXT NOT NULL CHECK (type IN ('sale', 'rental', 'mixed')),
  subtotal INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
CREATE POLICY "Admins can manage orders" ON orders FOR UPDATE
  USING (public.is_admin());

-- ============================================
-- 5. ORDER ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT REFERENCES products(id) NOT NULL,
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  size TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  rental_start_date DATE,
  rental_end_date DATE,
  security_deposit INTEGER,
  deposit_status TEXT DEFAULT 'pending' CHECK (deposit_status IN ('pending', 'collected', 'refunded', 'partially_refunded')),
  deposit_deductions INTEGER DEFAULT 0,
  deposit_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
CREATE POLICY "Users can view their own order items" ON order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR public.is_admin()))
  );

DROP POLICY IF EXISTS "Admins can manage order items" ON order_items;
DROP POLICY IF EXISTS "Admins can manage order items" ON order_items;
CREATE POLICY "Admins can manage order items" ON order_items FOR ALL USING (
  public.is_admin()
);

-- ============================================
-- 6. RENTAL BOOKINGS
-- ============================================
CREATE TABLE IF NOT EXISTS rental_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_item_id UUID REFERENCES order_items(id),
  product_id TEXT REFERENCES products(id) NOT NULL,
  user_id UUID REFERENCES profiles(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (
    status IN ('confirmed', 'active', 'returned', 'overdue', 'cancelled')
  ),
  deposit_collected INTEGER DEFAULT 0,
  deposit_refunded INTEGER DEFAULT 0,
  condition_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

ALTER TABLE rental_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Rental bookings viewable by owner or admin" ON rental_bookings;
DROP POLICY IF EXISTS "Rental bookings viewable by owner or admin" ON rental_bookings;
CREATE POLICY "Rental bookings viewable by owner or admin" ON rental_bookings FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage rental bookings" ON rental_bookings;
DROP POLICY IF EXISTS "Admins can manage rental bookings" ON rental_bookings;
CREATE POLICY "Admins can manage rental bookings" ON rental_bookings FOR ALL USING (
  public.is_admin()
);

-- Prevent overlapping rentals
DROP TRIGGER IF EXISTS check_double_booking ON rental_bookings;
DROP FUNCTION IF EXISTS prevent_double_booking();
CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM rental_bookings
    WHERE product_id = NEW.product_id
    AND id != NEW.id
    AND status NOT IN ('cancelled')
    AND NEW.start_date <= end_date
    AND NEW.end_date >= start_date
  ) THEN
    RAISE EXCEPTION 'Product is already booked for this date range';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER check_double_booking
  BEFORE INSERT OR UPDATE ON rental_bookings
  FOR EACH ROW EXECUTE FUNCTION prevent_double_booking();

-- ============================================
-- 7. WISHLISTS
-- ============================================
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT REFERENCES products(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own wishlist" ON wishlist_items;
DROP POLICY IF EXISTS "Users can view their own wishlist" ON wishlist_items;
CREATE POLICY "Users can view their own wishlist" ON wishlist_items FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own wishlist" ON wishlist_items;
DROP POLICY IF EXISTS "Users can manage their own wishlist" ON wishlist_items;
CREATE POLICY "Users can manage their own wishlist" ON wishlist_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 8. REVIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT REFERENCES products(id) NOT NULL,
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Approved reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Approved reviews are viewable by everyone" ON reviews;
CREATE POLICY "Approved reviews are viewable by everyone" ON reviews FOR SELECT
  USING (is_approved = true OR public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
CREATE POLICY "Authenticated users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;
CREATE POLICY "Admins can manage reviews" ON reviews FOR ALL USING (
  public.is_admin()
);

-- ============================================
-- 9. CONTACT SUBMISSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  inquiry_type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
CREATE POLICY "Anyone can submit contact form" ON contact_submissions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admins can manage contact submissions" ON contact_submissions;
CREATE POLICY "Admins can manage contact submissions" ON contact_submissions FOR ALL USING (
  public.is_admin()
);

-- ============================================
-- 10. SITE CONTENT
-- ============================================
CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Site content is viewable by everyone" ON site_content;
DROP POLICY IF EXISTS "Site content is viewable by everyone" ON site_content;
CREATE POLICY "Site content is viewable by everyone" ON site_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage site content" ON site_content;
DROP POLICY IF EXISTS "Admins can manage site content" ON site_content;
CREATE POLICY "Admins can manage site content" ON site_content FOR ALL USING (
  public.is_admin()
);

-- Seed default content (only if not exists)
INSERT INTO site_content (key, value) VALUES ('hero', '{
  "title": "Reverie & Essence",
  "subtitle": "Sharjah''s Most Majestic Couture",
  "cta": "Request A Private Viewing",
  "bgImage": "https://images.unsplash.com/photo-1594553423282-55ad0c034431?auto=format&fit=crop&w=2000&q=80"
}'::jsonb) ON CONFLICT (key) DO NOTHING;

INSERT INTO site_content (key, value) VALUES ('about', '{
  "title": "The Riman Legacy",
  "description": "Founded in the vibrant cultural landscape of Sharjah, Riman Fashion was born from a passion for preserving traditional artistry while embracing contemporary design. Our atelier is the zenith of luxury, where every thread is woven with royal intent."
}'::jsonb) ON CONFLICT (key) DO NOTHING;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_rental_bookings_product_dates ON rental_bookings(product_id, start_date, end_date) WHERE status != 'cancelled';
CREATE INDEX IF NOT EXISTS idx_rental_bookings_status ON rental_bookings(status);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions(status);

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
DROP POLICY IF EXISTS "Site settings are viewable by everyone" ON site_settings;
CREATE POLICY "Site settings are viewable by everyone" ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;
CREATE POLICY "Admins can manage site settings" ON site_settings FOR ALL USING (
  public.is_admin()
) WITH CHECK (
  public.is_admin()
);

-- Seed default settings
INSERT INTO site_settings (key, value) VALUES ('branding', '{
  "siteName": "Atelier Riman",
  "tagline": "Sharjah''s Most Majestic Couture",
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
  "metaDescription": "Atelier Riman - Sharjah''s premier bridal and evening couture atelier.",
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

INSERT INTO site_settings (key, value) VALUES ('admin_emails', '["riman4share@gmail.com"]'::jsonb) ON CONFLICT (key) DO NOTHING;


-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  service_type TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Anyone can create an appointment (for the booking form)
DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments;
CREATE POLICY "Anyone can create appointments" ON appointments FOR INSERT WITH CHECK (true);

-- Only admins can view/update/delete appointments
DROP POLICY IF EXISTS "Admins can view appointments" ON appointments;
CREATE POLICY "Admins can view appointments" ON appointments FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "Admins can update appointments" ON appointments;
CREATE POLICY "Admins can update appointments" ON appointments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "Admins can delete appointments" ON appointments;
CREATE POLICY "Admins can delete appointments" ON appointments FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Add collection_year and silhouette columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS collection_year INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS silhouette TEXT;

-- Add index for filtering
CREATE INDEX IF NOT EXISTS idx_products_collection_year ON products(collection_year);
CREATE INDEX IF NOT EXISTS idx_products_silhouette ON products(silhouette);

-- Add payment fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('atelier', 'card'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;


-- Gallery items table
CREATE TABLE gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'bridal',
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'photo',
  thumbnail_url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_gallery_category ON gallery_items(category);
CREATE INDEX idx_gallery_featured ON gallery_items(is_featured) WHERE is_featured = true;
CREATE INDEX idx_gallery_sort ON gallery_items(sort_order);

-- RLS policies
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON gallery_items;
CREATE POLICY "Public read access" ON gallery_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin insert" ON gallery_items;
CREATE POLICY "Admin insert" ON gallery_items
  FOR INSERT WITH CHECK (
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admin update" ON gallery_items;
CREATE POLICY "Admin update" ON gallery_items
  FOR UPDATE USING (
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admin delete" ON gallery_items;
CREATE POLICY "Admin delete" ON gallery_items
  FOR DELETE USING (
    public.is_admin()
  );

-- Storage policies (run after creating 'gallery' bucket in Dashboard)
-- CREATE POLICY "Public read access for gallery storage" ON storage.objects
--   FOR SELECT USING (bucket_id = 'gallery');
-- CREATE POLICY "Authenticated upload to gallery" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated delete from gallery" ON storage.objects
--   FOR DELETE USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');


-- Fix gallery RLS policies to require admin role (not just authenticated)
-- This matches the pattern used by all other admin-managed tables

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Authenticated insert" ON gallery_items;
DROP POLICY IF EXISTS "Authenticated update" ON gallery_items;
DROP POLICY IF EXISTS "Authenticated delete" ON gallery_items;

-- Create admin-only policies (matching products, categories, etc.)
DROP POLICY IF EXISTS "Admin insert" ON gallery_items;
CREATE POLICY "Admin insert" ON gallery_items
  FOR INSERT WITH CHECK (
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admin update" ON gallery_items;
CREATE POLICY "Admin update" ON gallery_items
  FOR UPDATE USING (
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admin delete" ON gallery_items;
CREATE POLICY "Admin delete" ON gallery_items
  FOR DELETE USING (
    public.is_admin()
  );


-- ============================================
-- Restrict profiles SELECT policy
-- Only expose safe columns (id, name, avatar_url) publicly
-- Admins and the user themselves can see full profile
-- ============================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Users can see their own full profile
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins can see all profiles (for admin dashboard)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    public.is_admin()
  );

-- Public can only see safe columns via a view
CREATE OR REPLACE VIEW profiles_public AS
  SELECT id, name, avatar_url FROM profiles;

GRANT SELECT ON profiles_public TO anon;
GRANT SELECT ON profiles_public TO authenticated;


-- Fix infinite recursion in admin RLS policy
-- The old policy self-referenced profiles, causing infinite recursion.
-- Using SECURITY DEFINER function breaks the cycle.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT public.is_admin();
$$;

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.is_admin());

-- ============================================
-- STORAGE - Buckets & policies for imagery
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true),
       ('gallery', 'gallery', true),
       ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read product-images" ON storage.objects;
CREATE POLICY "Public read product-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public read gallery" ON storage.objects;
CREATE POLICY "Public read gallery"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Public read review-photos" ON storage.objects;
CREATE POLICY "Public read review-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'review-photos');

DROP POLICY IF EXISTS "Auth upload product-images" ON storage.objects;
CREATE POLICY "Admin upload product-images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Auth update product-images" ON storage.objects;
CREATE POLICY "Admin update product-images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Auth delete product-images" ON storage.objects;
CREATE POLICY "Admin delete product-images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Auth upload gallery" ON storage.objects;
CREATE POLICY "Admin upload gallery"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gallery' AND public.is_admin());

DROP POLICY IF EXISTS "Auth update gallery" ON storage.objects;
CREATE POLICY "Admin update gallery"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'gallery' AND public.is_admin());

DROP POLICY IF EXISTS "Auth delete gallery" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete gallery" ON storage.objects;
CREATE POLICY "Admin delete gallery"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'gallery' AND public.is_admin());

-- Review photos: customers may upload (validated client-side: images <=5MB),
-- but only admins can overwrite or delete.
DROP POLICY IF EXISTS "Auth upload review-photos" ON storage.objects;
CREATE POLICY "Auth upload review-photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'review-photos');

DROP POLICY IF EXISTS "Admin update review-photos" ON storage.objects;
CREATE POLICY "Admin update review-photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'review-photos' AND public.is_admin());

DROP POLICY IF EXISTS "Admin delete review-photos" ON storage.objects;
CREATE POLICY "Admin delete review-photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'review-photos' AND public.is_admin());

