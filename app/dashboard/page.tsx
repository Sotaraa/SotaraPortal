'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { LogOut, Grid3X3, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import AppCard from '@/components/AppCard'
import Link from 'next/link'

// Single client instance for this module — never recreated on re-render
const supabase = createClient()

interface App {
  id: string
  slug: string
  name: string
  description: string
  icon_url: string
  launch_url: string
  requires_consent: boolean
  consent_items: any
  isSubscribed: boolean
  subscription: any
  onboarding: any
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadDashboard = async () => {
      // getUser() validates the JWT against the Supabase Auth server.
      // getSession() only reads localStorage cache — stale/mid-refresh JWTs
      // cause PostgREST 401s on subsequent data queries.
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        router.replace('/auth/login')
        return
      }

      if (cancelled) return
      setUser(authUser)

      // Query apps directly — RLS handles auth, no API route needed
      const { data: appsData, error: appsError } = await supabase
        .from('apps')
        .select('*')
        .eq('is_active', true)

      if (cancelled) return

      if (appsError) {
        console.error('Error fetching apps:', appsError)
        toast.error('Failed to load apps', { id: 'apps-error' })
        setLoading(false)
        return
      }

      // Fetch user's subscriptions and onboarding status
      const { data: subscriptions } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('is_active', true)

      const { data: onboarding } = await supabase
        .from('user_onboarding_status')
        .select('*')
        .eq('user_id', authUser.id)

      if (cancelled) return

      const appsWithStatus = (appsData || []).map((app: any) => {
        const sub = (subscriptions || []).find((s: any) => s.app_id === app.id)
        const ob = (onboarding || []).find((o: any) => o.app_id === app.id)
        return {
          ...app,
          isSubscribed: !!sub,
          subscription: sub || null,
          onboarding: ob || null,
        }
      })

      setApps(appsWithStatus)
      setLoading(false)
    }

    loadDashboard()
    return () => { cancelled = true }
  // router is stable in App Router but excluded to guarantee single run
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.replace('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid3X3 className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-white">Sotara Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-400">Logged in as</p>
              <p className="text-white font-medium">
                {user?.user_metadata?.full_name || user?.email}
              </p>
            </div>
            <Link
              href="/admin/billing"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
              Admin
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Available Apps</h2>
          <p className="text-slate-400">Access all your Sotara applications from one place</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>

        {apps.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">
              No apps available. Please contact your administrator.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
