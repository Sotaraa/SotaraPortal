'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { LogOut, Grid3X3 } from 'lucide-react'
import toast from 'react-hot-toast'
import AppCard from '@/components/AppCard'

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
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth/login')
        return
      }
      setUser(user)

      // Fetch apps
      try {
        const response = await fetch('/api/apps')
        if (response.ok) {
          const data = await response.json()
          setApps(data)
        } else {
          toast.error('Failed to load apps')
        }
      } catch (error) {
        console.error('Error fetching apps:', error)
        toast.error('Error loading apps')
      }

      setLoading(false)
    }

    loadDashboard()
  }, [supabase, router])

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
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid3X3 className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-white">Sotara Portal</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-slate-400">Logged in as</p>
              <p className="text-white font-medium">
                {user?.user_metadata?.full_name || user?.email}
              </p>
            </div>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Available Apps</h2>
          <p className="text-slate-400">
            Access all your Sotara applications from one place
          </p>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>

        {/* Empty State */}
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
