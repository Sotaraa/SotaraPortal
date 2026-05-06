'use client'

import { ArrowRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import ConsentModal from './ConsentModal'

const supabase = createClient()

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

interface AppCardProps {
  app: App
}

const tierColors: Record<string, string> = {
  enterprise: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  pro: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  basic: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

export default function AppCard({ app }: AppCardProps) {
  const [launching, setLaunching] = useState(false)
  const [showConsent, setShowConsent] = useState(false)

  const isOnboarded = app.onboarding?.is_completed ?? true
  const needsConsent = app.requires_consent && !isOnboarded
  const tier = app.subscription?.subscription_tier ?? 'basic'

  const doLaunch = async () => {
    if (app.requires_consent) {
      // Log consent acceptance
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('consent_logs').insert({
            user_id: user.id,
            app_id: app.id,
            consent_given: true,
            consent_items: app.consent_items ?? [],
          })
          await supabase
            .from('user_onboarding_status')
            .upsert({ user_id: user.id, app_id: app.id, is_completed: true })
        }
      } catch {
        // Non-fatal — still launch the app
      }
    }
    window.open(app.launch_url, '_blank')
  }

  const handleLaunch = async () => {
    if (!app.isSubscribed) {
      toast.error('Contact your admin to get access')
      return
    }

    if (needsConsent) {
      setShowConsent(true)
      return
    }

    setLaunching(true)
    try {
      await doLaunch()
    } finally {
      setLaunching(false)
    }
  }

  const handleConsentAccept = async () => {
    setShowConsent(false)
    setLaunching(true)
    try {
      await doLaunch()
    } finally {
      setLaunching(false)
    }
  }

  const buttonLabel = !app.isSubscribed
    ? 'Not Subscribed'
    : needsConsent
    ? 'Accept & Launch'
    : launching
    ? 'Launching...'
    : 'Launch App'

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
        className={`bg-slate-800 rounded-xl border transition-all overflow-hidden group ${
          !app.isSubscribed
            ? 'border-slate-700/50 opacity-60'
            : 'border-slate-700 hover:border-slate-600 hover:shadow-xl hover:shadow-blue-500/10'
        }`}
      >
        {/* Icon header */}
        <div className="h-28 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center group-hover:from-slate-600 group-hover:to-slate-700 transition-colors relative">
          <span className="text-5xl">{app.icon_url}</span>
          {app.isSubscribed && (
            <span className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full border font-medium ${tierColors[tier] ?? tierColors.basic}`}>
              {tier}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-white mb-1">{app.name}</h3>
          <p className="text-slate-400 text-sm mb-4 line-clamp-2">{app.description}</p>

          {/* Status */}
          <div className="mb-4">
            {!app.isSubscribed ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>No access — contact admin</span>
              </div>
            ) : needsConsent ? (
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>Consent required</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ready to launch</span>
              </div>
            )}
          </div>

          {/* Button */}
          <button
            onClick={handleLaunch}
            disabled={!app.isSubscribed || launching}
            className={`w-full px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
              !app.isSubscribed
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : needsConsent
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {buttonLabel}
            {app.isSubscribed && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </>
  )
}
