'use client'

import { useState } from 'react'
import { ArrowUpRight, CheckCircle2, AlertCircle, Clock, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import ConsentModal from './ConsentModal'

const supabase = createClient()

// ── Per-app brand identity ─────────────────────────────────────────────────
const BRANDS: Record<string, {
  iconBg: string      // gradient for icon box
  glow: string        // rgba triplet for hover effects
  accent: string      // text/border accent color
  label: string       // short display name for icon
}> = {
  swiftcues: {
    iconBg: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)',
    glow: '79,130,246',
    accent: '#60a5fa',
    label: 'SC',
  },
  ventra: {
    iconBg: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)',
    glow: '52,211,153',
    accent: '#34d399',
    label: 'VN',
  },
  leavehub: {
    iconBg: 'linear-gradient(135deg, #d97706 0%, #78350f 100%)',
    glow: '251,191,36',
    accent: '#fbbf24',
    label: 'LH',
  },
}

const DEFAULT_BRAND = {
  iconBg: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
  glow: '148,163,184',
  accent: '#94a3b8',
  label: '??',
}

const TIER_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  enterprise: { bg: 'rgba(168,85,247,0.12)', color: '#c084fc', label: 'Enterprise' },
  pro:        { bg: 'rgba(79,142,247,0.12)', color: '#60a5fa', label: 'Pro' },
  basic:      { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8', label: 'Basic' },
}

// ─────────────────────────────────────────────────────────────────────────────

interface App {
  id: string
  slug: string
  name: string
  description: string
  icon_url: string
  launch_url: string
  isSubscribed: boolean
  subscription: { subscription_tier?: string } | null
  onboarding: { is_completed?: boolean } | null
  requires_consent: boolean
  consent_items: string[] | null
}

export default function AppCard({ app }: { app: App }) {
  const [hovered, setHovered] = useState(false)
  const [showConsent, setShowConsent] = useState(false)
  const [launching, setLaunching] = useState(false)

  const brand   = BRANDS[app.slug] ?? DEFAULT_BRAND
  const tier    = app.subscription?.subscription_tier ?? 'basic'
  const tierStyle = TIER_STYLES[tier] ?? TIER_STYLES.basic
  const isOnboarded   = app.onboarding?.is_completed ?? true
  const needsConsent  = app.requires_consent && !isOnboarded
  const disabled      = !app.isSubscribed

  // ── Launch logic ──────────────────────────────────────────────────────────
  const doLaunch = async () => {
    if (app.requires_consent) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('consent_logs').insert({
            user_id: user.id, app_id: app.id,
            consent_given: true, consent_items: app.consent_items ?? [],
          })
          await supabase.from('user_onboarding_status')
            .upsert({ user_id: user.id, app_id: app.id, is_completed: true })
        }
      } catch { /* non-fatal */ }
    }
    window.open(app.launch_url, '_blank')
  }

  const handleClick = async () => {
    if (disabled) {
      toast.error('Contact your admin to get access')
      return
    }
    if (needsConsent) { setShowConsent(true); return }
    setLaunching(true)
    try { await doLaunch() } finally { setLaunching(false) }
  }

  const handleConsentAccept = async () => {
    setShowConsent(false)
    setLaunching(true)
    try { await doLaunch() } finally { setLaunching(false) }
  }

  // ── Dynamic card styles ───────────────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    background:    hovered && !disabled ? '#111c30' : '#0d1626',
    border:        `1px solid ${hovered && !disabled ? `rgba(${brand.glow},0.35)` : '#19273d'}`,
    borderRadius:  14,
    padding:       '20px',
    cursor:        disabled ? 'default' : 'pointer',
    transition:    'all 0.2s ease',
    opacity:       disabled ? 0.5 : 1,
    boxShadow:     hovered && !disabled
                     ? `0 0 0 1px rgba(${brand.glow},0.08), 0 12px 40px rgba(${brand.glow},0.1)`
                     : '0 2px 12px rgba(0,0,0,0.25)',
    display:       'flex',
    flexDirection: 'column',
    gap:           16,
    height:        '100%',
    minHeight:     196,
  }

  // ── Status indicator ──────────────────────────────────────────────────────
  const Status = () => {
    if (!app.isSubscribed) return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4b5573' }}>
        <Lock style={{ width: 12, height: 12 }} />
        <span style={{ fontSize: 12, fontWeight: 500 }}>No access</span>
      </div>
    )
    if (needsConsent) return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24' }}>
        <Clock style={{ width: 12, height: 12 }} />
        <span style={{ fontSize: 12, fontWeight: 500 }}>Consent required</span>
      </div>
    )
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4ade80' }}>
        <CheckCircle2 style={{ width: 12, height: 12 }} />
        <span style={{ fontSize: 12, fontWeight: 500 }}>Ready to launch</span>
      </div>
    )
  }

  // ── Button label ──────────────────────────────────────────────────────────
  const btnLabel = launching ? 'Opening...' : needsConsent ? 'Accept & Launch' : 'Open App'
  const btnBg    = disabled
                    ? 'rgba(30,41,59,0.6)'
                    : needsConsent
                    ? 'rgba(217,119,6,0.15)'
                    : hovered
                    ? `rgba(${brand.glow},0.18)`
                    : `rgba(${brand.glow},0.1)`
  const btnColor = disabled ? '#334155' : needsConsent ? '#fbbf24' : brand.accent

  return (
    <>
      {showConsent && (
        <ConsentModal
          appName={app.name}
          consentItems={app.consent_items ?? []}
          onAccept={handleConsentAccept}
          onCancel={() => setShowConsent(false)}
        />
      )}

      <div
        style={cardStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* ── Top row: icon + name + tier ────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          {/* Icon */}
          <div style={{
            width: 48, height: 48, borderRadius: 10, flexShrink: 0,
            background: brand.iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-dm-mono)',
            fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.92)',
            letterSpacing: '0.03em',
            boxShadow: `0 0 20px rgba(${brand.glow},0.25)`,
          }}>
            {app.icon_url?.length <= 3 ? app.icon_url : brand.label}
          </div>

          {/* Name + platform */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h3 style={{
                fontSize: 15, fontWeight: 700,
                color: '#eef2ff', letterSpacing: '-0.01em',
                margin: 0,
              }}>
                {app.name}
              </h3>
              {app.isSubscribed && (
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
                  padding: '2px 7px', borderRadius: 5,
                  background: tierStyle.bg, color: tierStyle.color,
                  fontFamily: 'var(--font-dm-mono)',
                }}>
                  {tierStyle.label.toUpperCase()}
                </span>
              )}
            </div>
            <p style={{
              fontSize: 11, color: '#2a3a5e', fontWeight: 600,
              letterSpacing: '0.05em', textTransform: 'uppercase',
              margin: '3px 0 0',
            }}>
              Sotara Platform
            </p>
          </div>
        </div>

        {/* Description */}
        <p style={{
          fontSize: 13, color: '#5a6e8a', lineHeight: 1.65,
          margin: 0, flex: 1,
        }}>
          {app.description}
        </p>

        {/* ── Footer: status + button ─────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 12,
          borderTop: '1px solid #111929',
          gap: 8,
        }}>
          <Status />

          <button
            onClick={handleClick}
            disabled={disabled || launching}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 14px', borderRadius: 8,
              background: btnBg,
              border: `1px solid ${disabled ? '#1a2540' : `rgba(${brand.glow},0.2)`}`,
              color: btnColor,
              fontSize: 12, fontWeight: 700,
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              fontFamily: 'var(--font-jakarta)',
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {btnLabel}
            {!disabled && <ArrowUpRight style={{ width: 13, height: 13 }} />}
          </button>
        </div>
      </div>
    </>
  )
}
