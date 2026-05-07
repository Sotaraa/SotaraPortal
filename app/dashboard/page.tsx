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

// Placeholder free add-ons — update slugs/names when platforms are ready
const COMING_SOON = [
  { id: 'cs-1', name: 'Add-on Platform', description: 'A free add-on for all Sotara subscribers. Details coming soon.' },
  { id: 'cs-2', name: 'Add-on Platform', description: 'A free add-on for all Sotara subscribers. Details coming soon.' },
  { id: 'cs-3', name: 'Add-on Platform', description: 'A free add-on for all Sotara subscribers. Details coming soon.' },
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
  return `Good ${time}, ${firstName}.`
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

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#07090e' }}>
        <div className="text-center space-y-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2"
            style={{ background: 'linear-gradient(135deg, #1e40af, #1e3a8a)' }}
          >
            <Layers className="w-7 h-7 text-white" />
          </div>
          <div className="flex gap-1.5 justify-center">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-blue-500"
                style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
          <p style={{ color: '#4b5573', fontSize: 13 }}>Loading your portal</p>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:.2;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
      </div>
    )
  }

  // ── Main ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen sotara-grid" style={{ background: '#07090e' }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{
        background: 'rgba(7, 9, 14, 0.85)',
        borderBottom: '1px solid #121929',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(79,130,246,0.25)',
            }}>
              <Layers style={{ width: 17, height: 17, color: '#fff' }} />
            </div>
            <div>
              <span style={{
                fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, #eef2ff, #93c5fd)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                SOTARA
              </span>
              <span style={{ color: '#2a3a5e', fontSize: 13, fontWeight: 600, marginLeft: 6 }}>
                PORTAL
              </span>
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* User pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 12px', borderRadius: 10,
              background: '#0c1324', border: '1px solid #1a2540',
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
                <p style={{ fontSize: 12, color: '#4b5573', lineHeight: 1, marginBottom: 2 }}>Signed in as</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#c8d3ea', lineHeight: 1 }}>
                  {user?.user_metadata?.full_name || user?.email}
                </p>
              </div>
            </div>

            {/* Admin */}
            <Link href="/admin/billing" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 9,
              background: '#0c1324', border: '1px solid #1a2540',
              color: '#6b7fa8', fontSize: 13, fontWeight: 600,
              textDecoration: 'none', transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#2a3a5e'
              ;(e.currentTarget as HTMLElement).style.color = '#eef2ff'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#1a2540'
              ;(e.currentTarget as HTMLElement).style.color = '#6b7fa8'
            }}>
              <Settings style={{ width: 14, height: 14 }} />
              Admin
            </Link>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 9,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                color: '#f87171', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.3)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.15)'
              }}
            >
              <LogOut style={{ width: 14, height: 14 }} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Greeting */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 38px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#eef2ff',
            marginBottom: 8,
          }}>
            {getGreeting(firstName)}
          </h1>
          <p style={{ color: '#4b5573', fontSize: 15, fontWeight: 500 }}>
            {subscribedCount > 0
              ? `You have access to ${subscribedCount} platform${subscribedCount > 1 ? 's' : ''}. Launch anytime below.`
              : 'Contact your admin to get access to Sotara platforms.'}
          </p>
        </div>

        {/* Filter tabs */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 36,
          background: '#0b1020', border: '1px solid #1a2540',
          borderRadius: 12, padding: 4, width: 'fit-content',
        }}>
          {([
            { id: 'all', label: 'All Platforms' },
            { id: 'subscribed', label: 'My Apps' },
            { id: 'soon', label: 'Coming Soon' },
          ] as { id: Filter; label: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                padding: '7px 18px',
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'var(--font-jakarta)',
                ...(filter === tab.id ? {
                  background: '#4f8ef7',
                  color: '#fff',
                  boxShadow: '0 0 16px rgba(79,142,247,0.3)',
                } : {
                  background: 'transparent',
                  color: '#4b5573',
                }),
              }}
            >
              {tab.label}
              {tab.id === 'soon' && (
                <span style={{
                  marginLeft: 6, fontSize: 10, fontWeight: 700,
                  background: 'rgba(74,222,128,0.15)', color: '#4ade80',
                  padding: '2px 5px', borderRadius: 4,
                }}>
                  FREE
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Apps Grid ─────────────────────────────────────────────────── */}
        {showApps && (
          <section style={{ marginBottom: filter === 'all' ? 60 : 0 }}>
            {filter === 'all' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#4b5573', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Platforms
                </h2>
                <div style={{ flex: 1, height: 1, background: '#111929' }} />
              </div>
            )}

            {displayedApps.length === 0 && filter === 'subscribed' ? (
              <div style={{
                textAlign: 'center', padding: '60px 24px',
                background: '#0b1020', border: '1px solid #1a2540',
                borderRadius: 16,
              }}>
                <p style={{ color: '#4b5573', fontSize: 15 }}>
                  You don&apos;t have access to any apps yet.
                </p>
                <p style={{ color: '#2a3a5e', fontSize: 13, marginTop: 6 }}>
                  Contact your admin to get subscribed.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 16,
              }}>
                {displayedApps.map((app, i) => (
                  <div
                    key={app.id}
                    className="fade-up"
                    style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}
                  >
                    <AppCard app={app} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Coming Soon Grid ──────────────────────────────────────────── */}
        {showSoon && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: '#4b5573', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Free Add-ons · Coming Soon
              </h2>
              <div style={{ flex: 1, height: 1, background: '#111929' }} />
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                color: '#4ade80', background: 'rgba(74,222,128,0.1)',
                border: '1px solid rgba(74,222,128,0.2)',
                padding: '3px 8px', borderRadius: 5,
              }}>
                INCLUDED FREE
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 16,
            }}>
              {COMING_SOON.map((item, i) => (
                <div
                  key={item.id}
                  className="fade-up"
                  style={{ animationDelay: `${(displayedApps.length + i) * 60}ms`, opacity: 0 }}
                >
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
