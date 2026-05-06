-- Create apps table
CREATE TABLE IF NOT EXISTS apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon_url text,
  launch_url text NOT NULL,
  requires_consent boolean DEFAULT false,
  consent_items jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_apps_slug ON apps(slug);
CREATE INDEX IF NOT EXISTS idx_apps_is_active ON apps(is_active);

-- Enable RLS
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view active apps
CREATE POLICY "Apps are viewable by everyone" ON apps
  FOR SELECT USING (is_active = true);

-- Policy: Only super admins can insert/update/delete
CREATE POLICY "Only admins can modify apps" ON apps
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Only admins can update apps" ON apps
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Only admins can delete apps" ON apps
  FOR DELETE USING (auth.jwt() ->> 'role' = 'super_admin');
