import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all active apps with user's subscription status
    const { data: apps, error } = await supabase
      .from('apps')
      .select(
        `
        id,
        slug,
        name,
        description,
        icon_url,
        launch_url,
        requires_consent,
        consent_items,
        user_subscriptions(id, subscription_tier, is_active),
        user_onboarding_status(id, is_completed)
      `
      )
      .eq('is_active', true)
      .eq('user_subscriptions.user_id', user.id)

    if (error) {
      console.error('Error fetching apps:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform to include subscription and onboarding info
    const appsWithStatus = apps.map((app: any) => ({
      ...app,
      isSubscribed: (app.user_subscriptions || []).length > 0,
      subscription: (app.user_subscriptions || [])[0] || null,
      onboarding: (app.user_onboarding_status || [])[0] || null,
    }))

    return NextResponse.json(appsWithStatus)
  } catch (error) {
    console.error('Error in /api/apps:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
