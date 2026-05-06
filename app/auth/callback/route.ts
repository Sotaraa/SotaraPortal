import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)

  // Redirect to dashboard - auth is handled client-side by Supabase UI
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}
