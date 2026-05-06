'use client'

import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface App {
  id: string
  slug: string
  name: string
  description: string
  icon_url: string
  launch_url: string
  isSubscribed: boolean
  subscription: any
  onboarding: any
  requires_consent: boolean
}

interface AppCardProps {
  app: App
}

export default function AppCard({ app }: AppCardProps) {
  const [launching, setLaunching] = useState(false)

  const isOnboarded = app.onboarding?.is_completed || false
  const needsOnboarding = app.requires_consent && !isOnboarded

  const handleLaunch = async () => {
    if (!app.isSubscribed) {
      toast.error('You are not subscribed to this app')
      return
    }

    if (needsOnboarding) {
      // TODO: Redirect to onboarding flow
      toast('Please complete onboarding first', { icon: '⚙️' })
      return
    }

    setLaunching(true)
    try {
      // Mark as launched and open app
      window.open(app.launch_url, '_blank')
    } finally {
      setLaunching(false)
    }
  }

  // Determine button state
  const isDisabled = !app.isSubscribed
  const buttonText = !app.isSubscribed
    ? 'Not Subscribed'
    : needsOnboarding
      ? 'Complete Setup'
      : 'Launch App'

  return (
    <div
      className={`bg-slate-800 rounded-xl border transition-all overflow-hidden group ${
        isDisabled
          ? 'border-slate-700 opacity-60'
          : 'border-slate-700 hover:border-slate-600 hover:shadow-xl hover:shadow-blue-500/10'
      }`}
    >
      {/* Icon & Header */}
      <div className="h-32 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center group-hover:from-slate-600 group-hover:to-slate-700 transition-colors">
        <span className="text-6xl">{app.icon_url}</span>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">{app.name}</h3>
        <p className="text-slate-400 text-sm mb-6 h-10">{app.description}</p>

        {/* Status Badge */}
        <div className="mb-6">
          {!app.isSubscribed ? (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Not subscribed</span>
            </div>
          ) : isOnboarded ? (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ready to launch</span>
            </div>
          ) : needsOnboarding ? (
            <div className="flex items-center gap-2 text-amber-400 text-sm">
              <span className="w-4 h-4 rounded-full bg-amber-400/20 border border-amber-400/50"></span>
              <span>Requires onboarding</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ready</span>
            </div>
          )}
        </div>

        {/* Launch Button */}
        <button
          onClick={handleLaunch}
          disabled={isDisabled || launching}
          className={`w-full px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
            isDisabled
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : app.isSubscribed && isOnboarded
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
          }`}
        >
          {launching ? 'Launching...' : buttonText}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
