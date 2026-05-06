'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
}

interface App {
  id: string
  slug: string
  name: string
}

interface Subscription {
  id: string
  user_id: string
  app: App
  subscription_tier: string
  is_active: boolean
}

export default function BillingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [apps, setApps] = useState<App[]>([])
  const [subscriptions, setSubscriptions] = useState<{
    [userId: string]: Subscription[]
  }>({})
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedAppId, setSelectedAppId] = useState('')
  const [selectedTier, setSelectedTier] = useState('basic')

  useEffect(() => {
    const loadData = async () => {
      // Check if user is admin
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth/login')
        return
      }

      // Fetch apps
      try {
        const { data: appsData, error: appsError } = await supabase
          .from('apps')
          .select('id, slug, name')
          .eq('is_active', true)

        if (appsError) throw appsError
        setApps(appsData || [])
      } catch (error) {
        console.error('Error fetching apps:', error)
        toast.error('Failed to load apps')
      }

      setLoading(false)
    }

    loadData()
  }, [supabase, router])

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUserId || !selectedAppId) {
      toast.error('Please select user and app')
      return
    }

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          appId: selectedAppId,
          subscriptionTier: selectedTier,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to add subscription')
        return
      }

      toast.success('Subscription added!')
      setSelectedAppId('')
      // Reload subscriptions for this user
      const { data: updated } = await supabase
        .from('user_subscriptions')
        .select(
          `
        id,
        user_id,
        app_id,
        subscription_tier,
        is_active
      `
        )
        .eq('user_id', selectedUserId)

      const withApps = await Promise.all(
        (updated || []).map(async (sub: any) => {
          const { data: app } = await supabase
            .from('apps')
            .select('id, slug, name')
            .eq('id', sub.app_id)
            .single()
          return { ...sub, app }
        })
      )

      setSubscriptions({
        ...subscriptions,
        [selectedUserId]: withApps,
      })
    } catch (error) {
      console.error('Error adding subscription:', error)
      toast.error('Error adding subscription')
    }
  }

  const handleSearchUser = async (email: string) => {
    if (email.length < 2) {
      setUsers([])
      return
    }

    try {
      // Search users from user_subscriptions
      const { data: subscriptionUsers } = await supabase
        .from('user_subscriptions')
        .select('user_id')

      // In a real app, you'd fetch auth user details via a service function
      // For now, we'll show emails from subscriptions
      if (subscriptionUsers) {
        // Simple client-side filter
        const unique = Array.from(
          new Map(
            subscriptionUsers.map((s) => [s.user_id, s.user_id])
          ).values()
        )
        setUsers(
          unique.slice(0, 10).map((id) => ({
            id,
            email: `user-${id.slice(0, 8)}`,
          }))
        )
      }
    } catch (error) {
      console.error('Error searching users:', error)
    }
  }

  const handleSelectUser = async (userId: string) => {
    setSelectedUserId(userId)

    try {
      const { data: subs } = await supabase
        .from('user_subscriptions')
        .select(
          `
        id,
        user_id,
        app_id,
        subscription_tier,
        is_active
      `
        )
        .eq('user_id', userId)

      // Fetch app details separately
      const withApps = await Promise.all(
        (subs || []).map(async (sub: any) => {
          const { data: app } = await supabase
            .from('apps')
            .select('id, slug, name')
            .eq('id', sub.app_id)
            .single()
          return { ...sub, app }
        })
      )

      setSubscriptions({
        ...subscriptions,
        [userId]: withApps,
      })
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      toast.error('Failed to load subscriptions')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-white">Admin - Billing</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Subscription Form */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                Add Subscription
              </h2>

              <form onSubmit={handleAddSubscription} className="space-y-4">
                {/* User Search */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    User Email
                  </label>
                  <input
                    type="email"
                    placeholder="Search user..."
                    onChange={(e) => handleSearchUser(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />

                  {users.length > 0 && (
                    <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                      {users.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleSelectUser(user.id)}
                          className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            selectedUserId === user.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {user.email}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* App Select */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    App
                  </label>
                  <select
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select an app...</option>
                    {apps.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tier Select */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tier
                  </label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Subscription
                </button>
              </form>
            </div>
          </div>

          {/* Subscriptions List */}
          <div className="lg:col-span-2">
            {selectedUserId && subscriptions[selectedUserId] ? (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  User Subscriptions
                </h2>

                {subscriptions[selectedUserId].length === 0 ? (
                  <p className="text-slate-400">
                    No subscriptions for this user yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {subscriptions[selectedUserId].map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-4 bg-slate-700 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-white">
                            {sub.app.name}
                          </p>
                          <p className="text-sm text-slate-400">
                            Tier: {sub.subscription_tier}
                          </p>
                        </div>
                        <button className="p-2 hover:bg-red-600/20 rounded text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 text-center">
                <p className="text-slate-400">
                  Select a user to view subscriptions
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
