'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Plus, Trash2, Search, Layers } from 'lucide-react'
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

const TIER_STYLES: Record<string, { bg: string; color: string }> = {
  enterprise: { bg: 'rgba(168,85,247,0.1)',  color: '#c084fc' },
  pro:        { bg: 'rgba(79,142,247,0.1)',   color: '#60a5fa' },
  basic:      { bg: 'rgba(100,116,139,0.1)', color: '#94a3b8' },
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
      if (!user) { router.replace('/auth/login'); return }

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
        body: JSON.stringify({ userId: newUserId.trim(), appId: selectedAppId, subscriptionTier: selectedTier }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to add subscription')
        return
      }

      const newSub = await response.json()
      setAllSubscriptions(prev => [{
        ...newSub,
        app: apps.find(a => a.id === selectedAppId)!,
      }, ...prev])
      toast.success('Subscription added')
      setNewUserId('')
      setSelectedAppId('')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (sub: Subscription) => {
    if (!confirm(`Remove ${sub.app?.name} for this user?`)) return
    const res = await fetch(`/api/subscriptions?id=${sub.id}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Failed to remove subscription'); return }
    setAllSubscriptions(prev => prev.filter(s => s.id !== sub.id))
    toast.success('Subscription removed')
  }

  const displayed = filterUserId.trim()
    ? allSubscriptions.filter(s => s.user_id.includes(filterUserId.trim()))
    : allSubscriptions

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px',
    background: '#0f1d30', border: '1px solid #1f3048',
    borderRadius: 9, color: '#e8effc',
    fontSize: 13, fontFamily: 'var(--font-jakarta)',
    outline: 'none', transition: 'border-color 0.15s',
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c1628' }}>
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'linear-gradient(135deg, #1e40af, #1e3a8a)' }}>
            <Layers className="w-7 h-7 text-white" />
          </div>
          <div className="flex gap-1.5 justify-center">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#4f8ef7', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:.2;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#0c1628' }}>

      {/* Header */}
      <header style={{
        background: 'rgba(12, 22, 40, 0.88)',
        borderBottom: '1px solid #1c2d3e',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link
              href="/dashboard"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8,
                background: '#131e30', border: '1px solid #213050',
                color: '#5c7294', fontSize: 13, fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#e8effc'; (e.currentTarget as HTMLElement).style.borderColor = '#2f4266' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#5c7294'; (e.currentTarget as HTMLElement).style.borderColor = '#213050' }}
            >
              <ArrowLeft style={{ width: 14, height: 14 }} />
              Dashboard
            </Link>

            <div style={{ width: 1, height: 20, background: '#1c2d3e' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 16px rgba(79,130,246,0.2)',
              }}>
                <Layers style={{ width: 17, height: 17, color: '#fff' }} />
              </div>
              <div>
                <span style={{
                  fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em',
                  background: 'linear-gradient(90deg, #e8effc, #93c5fd)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  SOTARA
                </span>
                <span style={{ color: '#2a3d56', fontSize: 13, fontWeight: 600, marginLeft: 6 }}>
                  ADMIN
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              padding: '6px 14px', borderRadius: 9,
              background: '#131e30', border: '1px solid #213050',
            }}>
              <span style={{ fontSize: 12, color: '#3d5278', marginRight: 6 }}>Total</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#4f8ef7', fontFamily: 'var(--font-dm-mono)' }}>
                {allSubscriptions.length}
              </span>
              <span style={{ fontSize: 12, color: '#3d5278', marginLeft: 4 }}>subscriptions</span>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, alignItems: 'start' }}>

          {/* Add Subscription form */}
          <div style={{
            background: '#152035', border: '1px solid #1f3048',
            borderRadius: 14, padding: '24px',
            position: 'sticky', top: 88,
          }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#e8effc', marginBottom: 4 }}>
              Add Subscription
            </h2>
            <p style={{ fontSize: 12, color: '#3d5278', marginBottom: 20 }}>
              Find the user UUID in Supabase under Authentication / Users.
            </p>

            <form onSubmit={handleAddSubscription} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#5c7294', display: 'block', marginBottom: 6 }}>
                  User UUID
                </label>
                <input
                  type="text"
                  value={newUserId}
                  onChange={e => setNewUserId(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  style={{ ...inputStyle, fontFamily: 'var(--font-dm-mono)', fontSize: 12 }}
                  onFocus={e => (e.target.style.borderColor = '#4f8ef7')}
                  onBlur={e => (e.target.style.borderColor = '#1f3048')}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#5c7294', display: 'block', marginBottom: 6 }}>
                  Platform
                </label>
                <select
                  value={selectedAppId}
                  onChange={e => setSelectedAppId(e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#4f8ef7')}
                  onBlur={e => (e.target.style.borderColor = '#1f3048')}
                >
                  <option value="">Select a platform...</option>
                  {apps.map(app => (
                    <option key={app.id} value={app.id}>{app.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#5c7294', display: 'block', marginBottom: 6 }}>
                  Tier
                </label>
                <select
                  value={selectedTier}
                  onChange={e => setSelectedTier(e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#4f8ef7')}
                  onBlur={e => (e.target.style.borderColor = '#1f3048')}
                >
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '10px 16px', borderRadius: 9, marginTop: 4,
                  background: submitting ? 'rgba(79,142,247,0.1)' : '#4f8ef7',
                  border: '1px solid rgba(79,142,247,0.3)',
                  color: submitting ? '#4f8ef7' : '#fff',
                  fontSize: 13, fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'var(--font-jakarta)',
                }}
              >
                <Plus style={{ width: 15, height: 15 }} />
                {submitting ? 'Adding...' : 'Add Subscription'}
              </button>
            </form>
          </div>

          {/* Subscriptions table */}
          <div style={{
            background: '#152035', border: '1px solid #1f3048',
            borderRadius: 14, padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#e8effc' }}>
                All Subscriptions
                <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 500, color: '#3d5278' }}>
                  {displayed.length} shown
                </span>
              </h2>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: '#3d5278' }} />
                <input
                  type="text"
                  value={filterUserId}
                  onChange={e => setFilterUserId(e.target.value)}
                  placeholder="Filter by user UUID..."
                  style={{
                    paddingLeft: 32, paddingRight: 14, paddingTop: 8, paddingBottom: 8,
                    background: '#0f1d30', border: '1px solid #1f3048', borderRadius: 9,
                    color: '#e8effc', fontSize: 12,
                    fontFamily: 'var(--font-dm-mono)',
                    outline: 'none', width: 240, transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#4f8ef7')}
                  onBlur={e => (e.target.style.borderColor = '#1f3048')}
                />
              </div>
            </div>

            {displayed.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <p style={{ color: '#3d5278', fontSize: 14 }}>No subscriptions found.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {displayed.map(sub => {
                  const ts = TIER_STYLES[sub.subscription_tier] ?? TIER_STYLES.basic
                  return (
                    <div
                      key={sub.id}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 16px', borderRadius: 10,
                        background: '#0f1d30', border: '1px solid #182438',
                        transition: 'border-color 0.15s', gap: 12,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = '#1f3048')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = '#182438')}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, color: '#c8d3ea', fontSize: 14 }}>
                            {sub.app?.name ?? 'Unknown'}
                          </span>
                          <span style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                            padding: '2px 6px', borderRadius: 4,
                            background: ts.bg, color: ts.color,
                            fontFamily: 'var(--font-dm-mono)',
                          }}>
                            {sub.subscription_tier.toUpperCase()}
                          </span>
                        </div>
                        <p style={{ fontSize: 11, color: '#2a3d56', fontFamily: 'var(--font-dm-mono)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sub.user_id}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(sub)}
                        title="Remove subscription"
                        style={{
                          padding: '7px 8px', borderRadius: 8,
                          background: 'transparent', border: '1px solid transparent',
                          color: '#2a3d56', cursor: 'pointer',
                          transition: 'all 0.15s', flexShrink: 0,
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'
                          ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.2)'
                          ;(e.currentTarget as HTMLElement).style.color = '#f87171'
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = 'transparent'
                          ;(e.currentTarget as HTMLElement).style.borderColor = 'transparent'
                          ;(e.currentTarget as HTMLElement).style.color = '#2a3d56'
                        }}
                      >
                        <Trash2 style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
