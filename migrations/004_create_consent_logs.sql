-- Create consent_logs table
CREATE TABLE IF NOT EXISTS consent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id uuid NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  consent_type text NOT NULL, -- 'data_api', 'site_rules', 'terms_of_service', etc.
  granted boolean NOT NULL, -- true = granted, false = revoked
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_consent_logs_user_id ON consent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_app_id ON consent_logs(app_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_created_at ON consent_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_consent_logs_consent_type ON consent_logs(consent_type);

-- Enable RLS
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own consent logs
CREATE POLICY "Users can view own consent logs" ON consent_logs
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'super_admin');

-- Policy: Only super admins can insert (via API)
CREATE POLICY "Only admins can create consent logs" ON consent_logs
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'super_admin');

-- Policy: Consent logs are immutable (no update/delete after creation)
CREATE POLICY "Consent logs are immutable" ON consent_logs
  FOR UPDATE USING (false);

CREATE POLICY "Consent logs cannot be deleted" ON consent_logs
  FOR DELETE USING (false);
