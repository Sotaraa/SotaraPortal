-- Create user_onboarding_status table
CREATE TABLE IF NOT EXISTS user_onboarding_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id uuid NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  -- Ensure each user has at most one onboarding status per app
  UNIQUE(user_id, app_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding_status(user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_app_id ON user_onboarding_status(app_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_is_completed ON user_onboarding_status(is_completed);

-- Enable RLS
ALTER TABLE user_onboarding_status ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own onboarding status
CREATE POLICY "Users can view own onboarding status" ON user_onboarding_status
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'super_admin');

-- Policy: Users can update their own onboarding status
CREATE POLICY "Users can update own onboarding status" ON user_onboarding_status
  FOR UPDATE USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'super_admin');

-- Policy: System should be able to insert/create onboarding records
-- (portal API will handle this)
CREATE POLICY "Authenticated users can insert onboarding status" ON user_onboarding_status
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Only admins can delete onboarding status" ON user_onboarding_status
  FOR DELETE USING (auth.jwt() ->> 'role' = 'super_admin');
