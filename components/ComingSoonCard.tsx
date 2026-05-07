'use client'

const ACCENTS = [
  { glow: '139,92,246',  bg: 'rgba(139,92,246,0.07)', color: '#a78bfa' },
  { glow: '20,184,166',  bg: 'rgba(20,184,166,0.07)',  color: '#2dd4bf' },
  { glow: '249,115,22',  bg: 'rgba(249,115,22,0.07)',  color: '#fb923c' },
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
        background: '#101b2e',
        border: '1px solid #182335',
        borderRadius: 14,
        padding: '20px',
        display: 'flex', flexDirection: 'column', gap: 16,
        height: '100%', minHeight: 196,
        opacity: 0.7,
        position: 'relative',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 10, flexShrink: 0,
          background: '#0d1828',
          border: '1px solid #1c2d3e',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: 4,
            background: accent.bg,
            border: `1px solid ${accent.color}28`,
            animation: 'cs-pulse 2.5s ease-in-out infinite',
          }} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#2a3d56', letterSpacing: '-0.01em', margin: 0 }}>
              {name}
            </h3>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
              padding: '2px 7px', borderRadius: 4,
              background: 'rgba(74,222,128,0.07)', color: '#4ade80',
              fontFamily: 'var(--font-dm-mono)',
            }}>
              FREE
            </span>
          </div>
          <p style={{ fontSize: 11, color: '#1c2d3e', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', margin: '3px 0 0' }}>
            Sotara Add-on
          </p>
        </div>
      </div>

      <p style={{ fontSize: 13, color: '#1e2d40', lineHeight: 1.65, margin: 0, flex: 1 }}>
        {description}
      </p>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 14, borderTop: '1px solid #131e2e',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#223044' }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: accent.color, opacity: 0.5,
            animation: 'cs-pulse 2s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 12, fontWeight: 500 }}>Coming soon</span>
        </div>

        <button disabled style={{
          padding: '6px 14px', borderRadius: 8,
          background: 'rgba(15,26,42,0.8)', border: '1px solid #1c2d3e',
          color: '#1e2d40', fontSize: 12, fontWeight: 700,
          cursor: 'not-allowed', fontFamily: 'var(--font-jakarta)',
        }}>
          Notify Me
        </button>
      </div>

      {/* SOON ribbon */}
      <div style={{
        position: 'absolute', top: 14, right: -1,
        fontSize: 9, fontWeight: 800, letterSpacing: '0.08em',
        padding: '3px 10px',
        background: accent.bg, color: accent.color,
        borderRadius: '6px 0 0 6px',
        border: `1px solid ${accent.color}20`, borderRight: 'none',
        fontFamily: 'var(--font-dm-mono)',
      }}>
        SOON
      </div>

      <style>{`@keyframes cs-pulse { 0%,100%{opacity:.35} 50%{opacity:.9} }`}</style>
    </div>
  )
}
