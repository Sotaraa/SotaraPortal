'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Plus, Trash2, Search } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const supabase = createClient()

interface App {
  id: string
  slug: string
  name: string
}

interface Subscription {
  id: string
  user_id: string
  subscription_tier: string
  is_active: boolean
  started_at: string
  app: App
}

export default function BillingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [apps, setApps] = useState<App[]>([])
  const [allSubscriptions, setAllSubscriptions] = useState<Subscription[]>([])
  const [filterUserId, setFilterUserId] = useState('')
  const [newUserId, setNewUserId] = useState('')
  const [selectedAppId, setSelectedAppId] = useState('')
  const [selectedTier, setSelectedTier] = useState('basic')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth/login')
        return
      }

      const [{ data: appsData }, { data: subsData }] = await Promise.all([
        supabase.from('apps').select('id, slug, name').eq('is_active', true),
        supabase
          .from('user_subscriptions')
          .select('id, user_id, subscription_tier, is_active, started_at, app:apps(id, slug, name)')
          .eq('is_active', true)
          .order('started_at', { ascending: false }),
      ])

      setApps(appsData || [])
      setAllSubscriptions((subsData || []) as unknown as Subscription[])
      setLoading(false)
    }

    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserId.trim() || !selectedAppId) {
      toast.error('Enter a user UUID and select an app')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: newUserId.trim(),
          appId: selectedAppId,
          subscriptionTier: selectedTier,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to add subscription')
        return
      }

      const newSub = await response.json()
      setAllSubscriptions((prev) => [
        {
          ...newSub,
          app: apps.find((a) => a.id === selectedAppId)!,
        },
        ...prev,
      ])
      toast.success('Subscription added')
      setNewUserId('')
      setSelectedAppId('')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (sub: Subscription) => {
    if (!confirm(`Remove ${sub.app.name} subscription for user ${sub.user_id.slice(0, 8)}...?`)) return

    const res = await fetch(`/api/subscriptions?id=${sub.id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('Failed to remove subscription')
      return
    }
    setAllSubscriptions((prev) => prev.filter((s) => s.id !== sub.id))
    toast.success('Subscription removed')
  }

  const displayed = filterUserId.trim()
    ? allSubscriptions.filter((s) => s.user_id.includes(filterUserId.trim()))
    : allSubscriptions

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
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold text-white">Admin — Subscriptions</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Add Subscription */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-lg font-bold text-white mb-5">Add Subscription</h2>

              <form onSubmit={handleAddSubscription} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    User UUID
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Copy from Supabase → Authentication → Users
                  </p>
                  <input
                    type="text"
                    value={newUserId}
                    onChange={(e) => setNewUserId(e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">App</label>
                  <select
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select an app...</option>
                    {apps.map((app) => (
                      <option key={app.id} value={app.id}>{app.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Tier</label>
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

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {submitting ? 'Adding...' : 'Add Subscription'}
                </button>
              </form>
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">
                  All Subscriptions
                  <span className="ml-2 text-sm font-normal text-slate-400">({displayed.length})</span>
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={filterUserId}
                    onChange={(e) => setFilterUserId(e.target.value)}
                    placeholder="Filter by user UUID..."
                    className="pl-9 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm font-mono w-64"
                  />
                </div>
              </div>

              {displayed.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No subscriptions found</p>
              ) : (
                <div className="space-y-2">
                  {displayed.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-4 bg-slate-700/60 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium text-white">{sub.app?.name ?? '—'}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            sub.subscription_tier === 'enterprise'
                              ? 'bg-purple-500/20 text-purple-300'
                              : sub.subscription_tier === 'pro'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-slate-500/30 text-slate-300'
                          }`}>
                            {sub.subscription_tier}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono truncate">
                          {sub.user_id}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(sub)}
                        className="ml-4 p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors flex-shrink-0"
                        title="Remove subscription"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
