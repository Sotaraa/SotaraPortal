import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://sjkadiuppdyalpmfpbgl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqa2FkaXVwcGR5YWxwbWZwYmdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNTMwMzgsImV4cCI6MjA5MzYyOTAzOH0.NmJqd293NLKAcniEPLLCP0bB8jqEZcBWW6A6lN-ammQ'

declare global {
  interface Window {
    __supabase: ReturnType<typeof createSupabaseClient> | undefined
  }
}

export function createClient() {
  if (typeof window === 'undefined') {
    // Server: no session persistence — prevents GoTrueClient lock collisions
    // with the browser instance that hydrates after SSR
    return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
  }
  // Browser: one instance for the entire lifetime of the tab
  if (!window.__supabase) {
    window.__supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return window.__supabase
}
