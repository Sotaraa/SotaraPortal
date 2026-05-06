'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          router.replace('/dashboard')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Sotara Portal</h1>
          <p className="text-slate-400">Access all your apps in one place</p>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700">
          <Auth
            supabaseClient={supabase}
            providers={['azure']}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#3b82f6',
                    brandAccent: '#1e40af',
                    brandButtonText: 'white',
                    defaultButtonBackground: '#1e293b',
                    defaultButtonBackgroundHover: '#334155',
                    defaultButtonBorder: '#475569',
                    defaultButtonText: '#e2e8f0',
                    dividerBackground: '#334155',
                    inputBackground: '#0f172a',
                    inputBorder: '#334155',
                    inputBorderFocus: '#3b82f6',
                    inputBorderHover: '#475569',
                    inputLabelText: '#cbd5e1',
                    inputPlaceholder: '#64748b',
                    inputText: '#f1f5f9',
                    messageText: '#cbd5e1',
                    messageTextDanger: '#ef4444',
                    anchorTextColor: '#3b82f6',
                    anchorTextHoverColor: '#1e40af',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '0.5rem',
                    buttonBorderRadius: '0.5rem',
                    inputBorderRadius: '0.5rem',
                  },
                  space: {
                    spaceSmall: '8px',
                    spaceMedium: '16px',
                    spaceLarge: '24px',
                  },
                  fontSizes: {
                    baseBodySize: '14px',
                    baseButtonSize: '14px',
                    baseInputSize: '14px',
                    baseLabelSize: '14px',
                  },
                },
              },
            }}
            redirectTo={`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`}
          />
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Secured by Sotara • Azure AD Protected
        </p>
      </div>
    </div>
  )
}
