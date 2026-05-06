import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser singleton — one GoTrueClient instance for the entire app lifetime.
// Server always gets a fresh instance (no localStorage there anyway).
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
