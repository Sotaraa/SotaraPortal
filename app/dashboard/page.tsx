'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { LogOut, Settings, Layers } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import AppCard from '@/components/AppCard'
import ComingSoonCard from '@/components/ComingSoonCard'

const supabase = createClient()

const COMING_SOON = [
  { id: 'cs-1', name: 'Coming Soon', description: 'A free add-on for all Sotara subscribers. Details will be announced shortly.' },
  { id: 'cs-2', name: 'Coming Soon', description: 'A free add-on for all Sotara subscribers. Details will be announced shortly.' },
  { id: 'cs-3', name: 'Coming Soon', description: 'A free add-on for all Sotara subscribers. Details will be announced shortly.' },
]

type Filter = 'all' | 'subscribed' | 'soon'

interface App {
  id: string
  slug: string
  name: string
  description: string
  icon_url: string
  launch_url: string
  requires_consent: boolean
  consent_items: string[] | null
  isSubscribed: boolean
  subscription: { subscription_tier?: string } | null
  onboarding: { is_completed?: boolean } | null
}

function getGreeting(firstName: string) {
  const h = new Date().getHours()
  const time = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
  return `Good ${time}, ${firstName}`
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    let cancelled = false

    const loadDashboard = async () => {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()
      if (error || !authUser) { router.replace('/auth/login'); return }
      if (cancelled) return
      setUser(authUser)

      const { data: appsData, error: appsError } = await supabase
        .from('apps')
        .select('*')
        .eq('is_active', true)

      if (cancelled) return
      if (appsError) {
        toast.error('Failed to load apps')
        setLoading(false)
        return
      }

      const [{ data: subscriptions }, { data: onboarding }] = await Promise.all([
        supabase.from('user_subscriptions').select('*').eq('user_id', authUser.id).eq('is_active', true),
        supabase.from('user_onboarding_status').select('*').eq('user_id', authUser.id),
      ])

      if (cancelled) return

      const appsWithStatus: App[] = (appsData || []).map((app: any) => ({
        ...app,
        isSubscribed: !!(subscriptions || []).find((s: any) => s.app_id === app.id),
        subscription:  (subscriptions || []).find((s: any) => s.app_id === app.id) ?? null,
        onboarding:    (onboarding   || []).find((o: any) => o.app_id === app.id) ?? null,
      }))

      setApps(appsWithStatus)
      setLoading(false)
    }

    loadDashboard()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.replace('/auth/login')
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there'
  const subscribedCount = apps.filter(a => a.isSubscribed).length
  const displayedApps = filter === 'subscribed' ? apps.filter(a => a.isSubscribed) : apps
  const showApps = filter !== 'soon'
  const showSoon = filter !== 'subscribed'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c1628' }}>
        <div className="text-center space-y-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'linear-gradient(135deg, #1e40af, #1e3a8a)' }}
          >
            <Layers className="w-7 h-7 text-white" />
          </div>
          <div className="flex gap-1.5 justify-center">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: '#4f8ef7',
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:.2;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
      </div>
    )
  }

  return (
    <div className="min-h-screen sotara-grid" style={{ background: '#0c1628' }}>

      {/* Header */}
      <header style={{
        background: 'rgba(12, 22, 40, 0.88)',
        borderBottom: '1px solid #1c2d3e',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

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
                PORTAL
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 12px', borderRadius: 10,
              background: '#131e30', border: '1px solid #213050',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: 'linear-gradient(135deg, #1e40af, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fff',
                fontFamily: 'var(--font-dm-mono)',
              }}>
                {firstName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#3d5278', lineHeight: 1, marginBottom: 2 }}>Signed in as</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#b8c9e0', lineHeight: 1 }}>
                  {user?.user_metadata?.full_name || user?.email}
                </p>
              </div>
            </div>

            <Link
              href="/admin/billing"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 9,
                background: '#131e30', border: '1px solid #213050',
                color: '#5c7294', fontSize: 13, fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#2f4266'
                ;(e.currentTarget as HTMLElement).style.color = '#e8effc'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#213050'
                ;(e.currentTarget as HTMLElement).style.color = '#5c7294'
              }}
            >
              <Settings style={{ width: 14, height: 14 }} />
              Admin
            </Link>

            <button
              onClick={handleSignOut}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 9,
                background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.13)',
                color: '#f87171', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.13)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.28)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.07)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.13)'
              }}
            >
              <LogOut style={{ width: 14, height: 14 }} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Greeting */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            fontSize: 'clamp(26px, 4vw, 36px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#e8effc',
            marginBottom: 8,
          }}>
            {getGreeting(firstName)}
          </h1>
          <p style={{ color: '#3d5278', fontSize: 15, fontWeight: 500 }}>
            {subscribedCount > 0
              ? `You have access to ${subscribedCount} platform${subscribedCount > 1 ? 's' : ''}.`
              : 'Contact your admin to get access to Sotara platforms.'}
          </p>
        </div>

        {/* Filter tabs */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 36,
          background: '#0f1d30', border: '1px solid #1c2d3e',
          borderRadius: 12, padding: 4, width: 'fit-content',
        }}>
          {([
            { id: 'all',        label: 'All Platforms' },
            { id: 'subscribed', label: 'My Apps' },
            { id: 'soon',       label: 'Coming Soon' },
          ] as { id: Filter; label: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                padding: '7px 18px', borderRadius: 9,
                fontSize: 13, fontWeight: 600, border: 'none',
                cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: 'var(--font-jakarta)',
                ...(filter === tab.id ? {
                  background: '#4f8ef7',
                  color: '#fff',
                  boxShadow: '0 0 14px rgba(79,142,247,0.25)',
                } : {
                  background: 'transparent',
                  color: '#3d5278',
                }),
              }}
            >
              {tab.label}
              {tab.id === 'soon' && (
                <span style={{
                  marginLeft: 6, fontSize: 10, fontWeight: 700,
                  background: 'rgba(74,222,128,0.12)', color: '#4ade80',
                  padding: '2px 5px', borderRadius: 4,
                }}>
                  FREE
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Apps grid */}
        {showApps && (
          <section style={{ marginBottom: filter === 'all' ? 56 : 0 }}>
            {filter === 'all' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <h2 style={{ fontSize: 11, fontWeight: 700, color: '#3d5278', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Platforms
                </h2>
                <div style={{ flex: 1, height: 1, background: '#162035' }} />
              </div>
            )}

            {displayedApps.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '60px 24px',
                background: '#0f1d30', border: '1px solid #1c2d3e', borderRadius: 16,
              }}>
                <p style={{ color: '#3d5278', fontSize: 15 }}>No apps to show.</p>
                <p style={{ color: '#213050', fontSize: 13, marginTop: 6 }}>Contact your admin to get subscribed.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                {displayedApps.map((app, i) => (
                  <div key={app.id} className="fade-up" style={{ animationDelay: `${i * 55}ms`, opacity: 0 }}>
                    <AppCard app={app} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Coming soon grid */}
        {showSoon && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <h2 style={{ fontSize: 11, fontWeight: 700, color: '#3d5278', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                Free Add-ons
              </h2>
              <div style={{ flex: 1, height: 1, background: '#162035' }} />
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                color: '#4ade80', background: 'rgba(74,222,128,0.08)',
                border: '1px solid rgba(74,222,128,0.18)',
                padding: '3px 8px', borderRadius: 5,
                whiteSpace: 'nowrap',
              }}>
                INCLUDED FREE
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {COMING_SOON.map((item, i) => (
                <div key={item.id} className="fade-up" style={{ animationDelay: `${(displayedApps.length + i) * 55}ms`, opacity: 0 }}>
                  <ComingSoonCard name={item.name} description={item.description} index={i} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
