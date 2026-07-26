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
CREATE POLICY "Anyone can create appointments" ON appointments FOR INSERT WITH CHECK (true);

-- Only admins can view/update/delete appointments
CREATE POLICY "Admins can view appointments" ON appointments FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admins can update appointments" ON appointments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admins can delete appointments" ON appointments FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Add collection_year and silhouette columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS collection_year INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS silhouette TEXT;

-- Add index for filtering
CREATE INDEX IF NOT EXISTS idx_products_collection_year ON products(collection_year);
CREATE INDEX IF NOT EXISTS idx_products_silhouette ON products(silhouette);