import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, DM_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sotara Portal',
  description: 'Access all Sotara platforms from one unified portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${dmMono.variable} h-full`}>
      <body className="min-h-full antialiased" style={{ background: '#0c1628', color: '#e8effc' }}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#162035',
              color: '#e8effc',
              border: '1px solid #213050',
              borderRadius: '10px',
              fontFamily: 'var(--font-jakarta)',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#4ade80', secondary: '#162035' } },
            error:   { iconTheme: { primary: '#f87171', secondary: '#162035' } },
          }}
        />
      </body>
    </html>
  )
}
