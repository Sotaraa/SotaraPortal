# Sotara Portal Database Migrations

These migrations set up the database schema for the Sotara Portal.

## How to Run Migrations

### Option 1: Via Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of each migration file (001, 002, 003, 004, 005 in order) and execute them

### Option 2: Via Supabase CLI
```bash
supabase migration up
```

### Option 3: Manual via psql (if you have direct DB access)
```bash
psql postgresql://user:password@host/dbname < 001_create_apps.sql
psql postgresql://user:password@host/dbname < 002_create_user_subscriptions.sql
psql postgresql://user:password@host/dbname < 003_create_user_onboarding_status.sql
psql postgresql://user:password@host/dbname < 004_create_consent_logs.sql
psql postgresql://user:password@host/dbname < 005_insert_default_apps.sql
```

## Migration Files

| File | Purpose |
|------|---------|
| `001_create_apps.sql` | Creates `apps` table for registering available applications |
| `002_create_user_subscriptions.sql` | Creates `user_subscriptions` table for tracking user app access |
| `003_create_user_onboarding_status.sql` | Creates `user_onboarding_status` table for tracking completion |
| `004_create_consent_logs.sql` | Creates `consent_logs` table for audit trail (GDPR compliance) |
| `005_insert_default_apps.sql` | Inserts 3 default apps (SwiftCues, Ventra, Leave System) |

## Verify Migrations

After running migrations, verify they worked by running this in the Supabase SQL Editor:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check default apps were inserted
SELECT id, slug, name FROM apps;
```

You should see:
- `apps` table with 3 rows
- `user_subscriptions` table (empty)
- `user_onboarding_status` table (empty)
- `consent_logs` table (empty)
