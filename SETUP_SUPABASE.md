# Supabase Setup Instructions

## Quick Start

Your Supabase project is ready. Follow these steps to set up the database:

### Option 1: Via Supabase Dashboard (Recommended)

1. **Go to your Supabase project**
   - URL: https://sjkadiuppdyalpmfpbgl.supabase.co
   - Navigate to **SQL Editor**

2. **Create a new query** and copy-paste the entire content below:

```sql
-- Sotara Portal Database Schema
-- Run this in Supabase SQL Editor

-- 0. Create profiles table (user info on first login)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text DEFAULT 'user',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON profiles(auth_user_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Service role can create profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- 1. Create apps table
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

CREATE INDEX IF NOT EXISTS idx_apps_slug ON apps(slug);
CREATE INDEX IF NOT EXISTS idx_apps_is_active ON apps(is_active);

ALTER TABLE apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apps are viewable by everyone" ON apps
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can modify apps" ON apps
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Only admins can update apps" ON apps
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Only admins can delete apps" ON apps
  FOR DELETE USING (auth.jwt() ->> 'role' = 'super_admin');

-- 2. Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id uuid NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  subscription_tier text NOT NULL DEFAULT 'basic',
  is_active boolean DEFAULT true,
  started_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, app_id)
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_app_id ON user_subscriptions(app_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_is_active ON user_subscriptions(is_active);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Only admins can manage subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Only admins can update subscriptions" ON user_subscriptions
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Only admins can delete subscriptions" ON user_subscriptions
  FOR DELETE USING (auth.jwt() ->> 'role' = 'super_admin');

-- 3. Create user_onboarding_status table
CREATE TABLE IF NOT EXISTS user_onboarding_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id uuid NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, app_id)
);

CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding_status(user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_app_id ON user_onboarding_status(app_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_is_completed ON user_onboarding_status(is_completed);

ALTER TABLE user_onboarding_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding status" ON user_onboarding_status
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Users can update own onboarding status" ON user_onboarding_status
  FOR UPDATE USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Authenticated users can insert onboarding status" ON user_onboarding_status
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Only admins can delete onboarding status" ON user_onboarding_status
  FOR DELETE USING (auth.jwt() ->> 'role' = 'super_admin');

-- 4. Create consent_logs table
CREATE TABLE IF NOT EXISTS consent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id uuid NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  consent_type text NOT NULL,
  granted boolean NOT NULL,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_logs_user_id ON consent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_app_id ON consent_logs(app_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_created_at ON consent_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_consent_logs_consent_type ON consent_logs(consent_type);

ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consent logs" ON consent_logs
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Only admins can create consent logs" ON consent_logs
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Consent logs are immutable" ON consent_logs
  FOR UPDATE USING (false);

CREATE POLICY "Consent logs cannot be deleted" ON consent_logs
  FOR DELETE USING (false);

-- 5. Insert default apps
INSERT INTO apps (slug, name, description, icon_url, launch_url, requires_consent, is_active)
VALUES
  ('swiftcues', 'SwiftCues', 'IT Support Ticketing Platform', '🎫', 'https://swiftcues.app', false, true),
  ('ventra', 'Ventra', 'School Visitor Management', '🏫', 'https://ventra.app', true, true),
  ('leave-system', 'Leave Request System', 'Employee Leave Management', '📋', 'https://leave.app', false, true)
ON CONFLICT (slug) DO NOTHING;
```

3. **Execute the query** - Click "Execute" button or press `Ctrl+Enter`

4. **Verify success**:
   - Should see "Rows affected: 3" after the insert query
   - Check **Tables** sidebar - you should see 4 new tables

### Verify Database Setup

Run this query to confirm everything is set up:

```sql
-- Verify tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify default apps
SELECT id, slug, name FROM apps ORDER BY created_at;
```

You should see:
- `apps` (3 rows: swiftcues, ventra, leave-system)
- `consent_logs` (empty)
- `user_onboarding_status` (empty)
- `user_subscriptions` (empty)

---

## Next Steps

1. **Environment variables are already set** in `.env.local`
2. **Deploy to Vercel**:
   - Connect your GitHub repo (https://github.com/Sotaraa/SotaraPortal)
   - Add these env vars in Vercel dashboard:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://sjkadiuppdyalpmfpbgl.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
     NEXT_PUBLIC_APP_URL=<your-vercel-url>
     ```

3. **Test the portal**:
   - Login with Azure OAuth
   - Add a subscription via `/admin/billing`
   - Launch an app from dashboard

---

## Troubleshooting

### "Permission denied" errors on RLS policies
- This is expected during setup (missing JWT)
- Will resolve once users log in with Supabase Auth

### Tables not showing
- Refresh the page
- Check if query executed without errors

### Migration stuck
- Copy each SQL file individually (001-005)
- Run them in order
- Wait for "Success" message before next migration

---

**Supabase Project**: https://sjkadiuppdyalpmfpbgl.supabase.co
**GitHub Repo**: https://github.com/Sotaraa/SotaraPortal
**Status**: Ready for Vercel deployment
