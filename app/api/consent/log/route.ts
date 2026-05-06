import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { appId, consentType, granted } = body

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get client IP and user agent
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const { data: log, error } = await supabase
      .from('consent_logs')
      .insert({
        user_id: user.id,
        app_id: appId,
        consent_type: consentType,
        granted: granted !== false,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single()

    if (error) {
      console.error('Error logging consent:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/consent/log:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
