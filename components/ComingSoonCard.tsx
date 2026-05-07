'use client'

// Rotating shimmer accent colors so the 3 cards aren't identical
const ACCENTS = [
  { glow: '139,92,246',  bg: 'rgba(139,92,246,0.08)',  color: '#a78bfa' }, // violet
  { glow: '20,184,166',  bg: 'rgba(20,184,166,0.08)',   color: '#2dd4bf' }, // teal
  { glow: '249,115,22',  bg: 'rgba(249,115,22,0.08)',   color: '#fb923c' }, // orange
]

interface ComingSoonCardProps {
  name: string
  description: string
  index: number
}

export default function ComingSoonCard({ name, description, index }: ComingSoonCardProps) {
  const accent = ACCENTS[index % ACCENTS.length]

  return (
    <div
      className="shimmer-wrap"
      style={{
        background: '#0b1020',
        border: `1px solid #141f35`,
        borderRadius: 14,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        height: '100%',
        minHeight: 196,
        opacity: 0.75,
        position: 'relative',
      }}
    >
      {/* ── Top row ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Pulsing icon placeholder */}
        <div style={{
          width: 48, height: 48, borderRadius: 10, flexShrink: 0,
          background: '#0f1a2e',
          border: '1px solid #1a2540',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: 4,
            background: accent.bg,
            border: `1px solid ${accent.color}30`,
            animation: 'pulse 2.5s ease-in-out infinite',
          }} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{
              fontSize: 15, fontWeight: 700, color: '#2a3a5e',
              letterSpacing: '-0.01em', margin: 0,
            }}>
              {name}
            </h3>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
              padding: '2px 7px', borderRadius: 5,
              background: 'rgba(74,222,128,0.08)', color: '#4ade80',
              fontFamily: 'var(--font-dm-mono)',
            }}>
              FREE
            </span>
          </div>
          <p style={{
            fontSize: 11, color: '#1e2d4d', fontWeight: 600,
            letterSpacing: '0.05em', textTransform: 'uppercase',
            margin: '3px 0 0',
          }}>
            Sotara Add-on
          </p>
        </div>
      </div>

      {/* Description placeholder bar */}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, color: '#1e2d4d', lineHeight: 1.65, margin: 0 }}>
          {description}
        </p>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 12, borderTop: '1px solid #0f1929',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: '#253047',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: accent.color,
            opacity: 0.5,
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 12, fontWeight: 500 }}>Coming soon</span>
        </div>

        <button
          disabled
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 14px', borderRadius: 8,
            background: 'rgba(20,28,48,0.8)',
            border: '1px solid #1a2540',
            color: '#1e2d4d',
            fontSize: 12, fontWeight: 700,
            cursor: 'not-allowed',
            fontFamily: 'var(--font-jakarta)',
            letterSpacing: '0.01em',
          }}
        >
          Notify Me
        </button>
      </div>

      {/* "Coming Soon" diagonal ribbon */}
      <div style={{
        position: 'absolute', top: 14, right: -1,
        fontSize: 9, fontWeight: 800, letterSpacing: '0.08em',
        padding: '3px 10px',
        background: accent.bg,
        color: accent.color,
        borderRadius: '6px 0 0 6px',
        border: `1px solid ${accent.color}25`,
        borderRight: 'none',
        fontFamily: 'var(--font-dm-mono)',
      }}>
        SOON
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }`}</style>
    </div>
  )
}
