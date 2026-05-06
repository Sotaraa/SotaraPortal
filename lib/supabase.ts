import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://sjkadiuppdyalpmfpbgl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqa2FkaXVwcGR5YWxwbWZwYmdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNTMwMzgsImV4cCI6MjA5MzYyOTAzOH0.NmJqd293NLKAcniEPLLCP0bB8jqEZcBWW6A6lN-ammQ'

// Module-level singleton — webpack deduplicates this module so there is exactly
// one _browserClient across every import of this file in the browser bundle.
// More reliable than window.__supabase because it can't be stomped by other scripts
// and it's guaranteed to share the same GoTrueClient instance (no lock cycling).
let _browserClient: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (typeof window === 'undefined') {
    // Server: fully stateless — no localStorage, no token refresh, no URL detection.
    // Prevents GoTrueClient from writing a lock that the browser instance then
    // detects as a "competing instance", which is what caused the rapid getUser() loop.
    return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  }

  if (!_browserClient) {
    _browserClient = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return _browserClient
}
