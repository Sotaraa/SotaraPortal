'use client'

import { useState } from 'react'
import { ArrowUpRight, CheckCircle2, Clock, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import ConsentModal from './ConsentModal'

const supabase = createClient()

const BRANDS: Record<string, { iconBg: string; glow: string; accent: string; label: string }> = {
  swiftcues: { iconBg: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)', glow: '79,130,246',  accent: '#60a5fa', label: 'SC' },
  ventra:    { iconBg: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)', glow: '52,211,153',  accent: '#34d399', label: 'VN' },
  leavehub:  { iconBg: 'linear-gradient(135deg, #d97706 0%, #78350f 100%)', glow: '251,191,36',  accent: '#fbbf24', label: 'LH' },
}

const DEFAULT_BRAND = { iconBg: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)', glow: '148,163,184', accent: '#94a3b8', label: '??' }

const TIER_LABELS: Record<string, { bg: string; color: string }> = {
  enterprise: { bg: 'rgba(168,85,247,0.1)',  color: '#c084fc' },
  pro:        { bg: 'rgba(79,142,247,0.1)',   color: '#60a5fa' },
  basic:      { bg: 'rgba(100,116,139,0.1)', color: '#94a3b8' },
}

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

  const brand      = BRANDS[app.slug] ?? DEFAULT_BRAND
  const tier       = app.subscription?.subscription_tier ?? 'basic'
  const tierStyle  = TIER_LABELS[tier] ?? TIER_LABELS.basic
  const isOnboarded  = app.onboarding?.is_completed ?? true
  const needsConsent = app.requires_consent && !isOnboarded
  const disabled     = !app.isSubscribed

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
    if (disabled)      { toast.error('Contact your admin to get access'); return }
    if (needsConsent)  { setShowConsent(true); return }
    setLaunching(true)
    try { await doLaunch() } finally { setLaunching(false) }
  }

  const handleConsentAccept = async () => {
    setShowConsent(false)
    setLaunching(true)
    try { await doLaunch() } finally { setLaunching(false) }
  }

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
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background:   hovered && !disabled ? '#182438' : '#152035',
          border:       `1px solid ${hovered && !disabled ? `rgba(${brand.glow},0.32)` : '#1f3048'}`,
          borderRadius: 14,
          padding:      '20px',
          cursor:       disabled ? 'default' : 'pointer',
          transition:   'all 0.2s ease',
          opacity:      disabled ? 0.5 : 1,
          boxShadow:    hovered && !disabled
                          ? `0 0 0 1px rgba(${brand.glow},0.06), 0 12px 36px rgba(${brand.glow},0.08)`
                          : '0 2px 10px rgba(0,0,0,0.2)',
          display:      'flex',
          flexDirection:'column',
          gap:          16,
          height:       '100%',
          minHeight:    196,
        }}
      >
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 10, flexShrink: 0,
            background: brand.iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-dm-mono)',
            fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.9)',
            letterSpacing: '0.03em',
            boxShadow: `0 0 18px rgba(${brand.glow},0.2)`,
          }}>
            {app.icon_url?.length <= 3 ? app.icon_url : brand.label}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e8effc', letterSpacing: '-0.01em', margin: 0 }}>
                {app.name}
              </h3>
              {app.isSubscribed && (
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                  padding: '2px 7px', borderRadius: 4,
                  background: tierStyle.bg, color: tierStyle.color,
                  fontFamily: 'var(--font-dm-mono)',
                }}>
                  {tier.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: 13, color: '#4b6280', lineHeight: 1.65, margin: 0, flex: 1 }}>
          {app.description}
        </p>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 14, borderTop: '1px solid #162035', gap: 8,
        }}>
          {/* Status */}
          {!app.isSubscribed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#3d5278' }}>
              <Lock style={{ width: 12, height: 12 }} />
              <span style={{ fontSize: 12, fontWeight: 500 }}>No access</span>
            </div>
          ) : needsConsent ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24' }}>
              <Clock style={{ width: 12, height: 12 }} />
              <span style={{ fontSize: 12, fontWeight: 500 }}>Consent required</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4ade80' }}>
              <CheckCircle2 style={{ width: 12, height: 12 }} />
              <span style={{ fontSize: 12, fontWeight: 500 }}>Ready</span>
            </div>
          )}

          <button
            onClick={handleClick}
            disabled={disabled || launching}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 14px', borderRadius: 8,
              background: disabled
                ? 'rgba(21,32,53,0.6)'
                : needsConsent
                ? 'rgba(217,119,6,0.12)'
                : `rgba(${brand.glow},0.1)`,
              border: `1px solid ${disabled ? '#1f3048' : needsConsent ? 'rgba(217,119,6,0.2)' : `rgba(${brand.glow},0.18)`}`,
              color: disabled ? '#2a3d56' : needsConsent ? '#fbbf24' : brand.accent,
              fontSize: 12, fontWeight: 700,
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              fontFamily: 'var(--font-jakarta)',
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            {launching ? 'Opening...' : needsConsent ? 'Accept & Launch' : 'Open App'}
            {!disabled && <ArrowUpRight style={{ width: 13, height: 13 }} />}
          </button>
        </div>
      </div>
    </>
  )
}
