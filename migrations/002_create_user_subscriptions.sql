-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id uuid NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  subscription_tier text NOT NULL DEFAULT 'basic', -- 'basic', 'pro', 'enterprise'
  is_active boolean DEFAULT true,
  started_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  -- Ensure each user has at most one subscription per app
  UNIQUE(user_id, app_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_app_id ON user_subscriptions(app_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_is_active ON user_subscriptions(is_active);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'super_admin');

-- Policy: Only super admins can insert/update/delete
CREATE POLICY "Only admins can manage subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Only admins can update subscriptions" ON user_subscriptions
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Only admins can delete subscriptions" ON user_subscriptions
  FOR DELETE USING (auth.jwt() ->> 'role' = 'super_admin');
