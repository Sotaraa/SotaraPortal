import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://sjkadiuppdyalpmfpbgl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqa2FkaXVwcGR5YWxwbWZwYmdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNTMwMzgsImV4cCI6MjA5MzYyOTAzOH0.NmJqd293NLKAcniEPLLCP0bB8jqEZcBWW6A6lN-ammQ'

// Browser singleton — one GoTrueClient for the entire app lifetime
let browserClient: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (typeof window === 'undefined') {
    return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  if (!browserClient) {
    browserClient = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return browserClient
}
