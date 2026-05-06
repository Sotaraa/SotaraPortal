# Sotara Portal

A unified platform launcher for all Sotara applications (like Adobe Creative Cloud). Users get a single login to access all their subscribed apps.

## Features

### ✅ Phase 1-2 Complete
- **Unified Authentication** - Single sign-on via Azure OAuth (Supabase Auth)
- **App Grid Dashboard** - Browse and launch available apps
- **Subscription Management** - Per-app subscriptions (basic, pro, enterprise tiers)
- **Onboarding Tracking** - Track which apps users have completed onboarding for
- **Consent Logging** - Audit trail for GDPR/compliance
- **Admin Panel** - Manage user subscriptions

### 🔄 Available Apps
1. **SwiftCues** - IT Support Ticketing Platform
2. **Ventra** - School Visitor Management
3. **Leave System** - Employee Leave Management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Auth** | Supabase Auth + Azure OAuth |
| **Database** | Supabase Postgres |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Hosting** | Vercel (ready to deploy) |

## Project Structure

```
sotara-portal/
├── app/
│   ├── layout.tsx              # Root layout with Toaster
│   ├── page.tsx                # Redirect to /dashboard
│   ├── auth/
│   │   ├── login/page.tsx      # Azure OAuth login
│   │   └── callback/route.ts   # OAuth redirect handler
│   ├── dashboard/page.tsx      # Main app grid
│   ├── admin/
│   │   └── billing/page.tsx    # Subscription management
│   └── api/
│       ├── apps/              # List subscribed apps
│       ├── subscriptions/      # Manage subscriptions
│       ├── onboarding/         # Track onboarding status
│       └── consent/            # Log consent/permissions
├── components/
│   └── AppCard.tsx             # App display component
├── lib/
│   ├── supabase.ts            # Supabase client
│   └── auth.ts                # Auth utilities
├── migrations/                 # Database setup
├── middleware.ts               # Request handling
└── .env.local                  # Local secrets
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase project (use same as SwiftCues/Ventra)

### Local Development

1. **Install dependencies**
```bash
npm install
```

2. **Setup environment**
```bash
cp .env.local.example .env.local
# Edit with your Supabase URL and keys
```

3. **Run database migrations** (first time only)
   - Go to Supabase Dashboard → SQL Editor
   - Copy & run each migration file in order (001-005) from `./migrations/`
   - See `./migrations/README.md` for details

4. **Start dev server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### First Time Setup

1. **Login** with Azure OAuth
2. **Add subscription**: Go to `/admin/billing`, search your user, add a subscription
3. **Dashboard shows apps**: Now you'll see apps you're subscribed to
4. **Launch app**: Click an app to open in new tab

## API Endpoints

### GET `/api/apps`
List apps user is subscribed to with onboarding status.

### POST `/api/subscriptions`
Create subscription (admin only).

### GET/POST `/api/onboarding/status`
Check/update onboarding completion.

### POST `/api/consent/log`
Log consent for audit trail.

See code comments for request/response formats.

## Deployment to Vercel

1. **Create GitHub repo** and push code
2. **Connect to Vercel** via GitHub integration
3. **Set env vars** in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`

4. **Deploy** - Automatic on push to main

## Next Steps (Phase 3)

- [ ] Create GitHub repository
- [ ] Setup Supabase project (or extend existing one)
- [ ] Run database migrations
- [ ] Deploy to Vercel
- [ ] Configure Azure OAuth for your domain
- [ ] Test end-to-end flow
- [ ] Integrate onboarding flows from each app
- [ ] Build consent prompts

## Database Migrations

Run these in order in Supabase SQL Editor:

1. `001_create_apps.sql` - App registry
2. `002_create_user_subscriptions.sql` - Subscriptions
3. `003_create_user_onboarding_status.sql` - Onboarding tracking
4. `004_create_consent_logs.sql` - Audit trail
5. `005_insert_default_apps.sql` - Seed 3 default apps

See `./migrations/README.md` for more details.

## Built With

- Next.js 14 (Turbopack)
- Supabase (Postgres + Auth)
- Tailwind CSS
- TypeScript
- Lucide React

---

**Status**: Phase 2 Complete - Ready for GitHub & Supabase setup
**Last Updated**: May 6, 2026
