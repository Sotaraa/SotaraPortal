'use client'

import { useState } from 'react'
import { X, CheckCircle2, ShieldCheck } from 'lucide-react'

interface ConsentModalProps {
  appName: string
  consentItems: string[]
  onAccept: () => void
  onCancel: () => void
}

export default function ConsentModal({ appName, consentItems, onAccept, onCancel }: ConsentModalProps) {
  const [checked, setChecked] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-800 rounded-xl border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Access {appName}</h2>
              <p className="text-sm text-slate-400">Review and accept to continue</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Consent items */}
        <div className="p-6 space-y-3">
          <p className="text-sm text-slate-400 mb-4">
            By accessing this app you agree to the following:
          </p>
          {(consentItems.length > 0 ? consentItems : ['Access your profile information']).map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-300">{item}</span>
            </div>
          ))}
        </div>

        {/* Checkbox */}
        <div className="px-6 pb-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-500 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800 cursor-pointer"
            />
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
              I have read and accept the terms above
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            disabled={!checked}
            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors font-medium"
          >
            Accept & Launch
          </button>
        </div>
      </div>
    </div>
  )
}
