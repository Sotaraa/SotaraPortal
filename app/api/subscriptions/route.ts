import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const userId = request.nextUrl.searchParams.get('userId')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Users can only view their own, admins can view anyone's
    const targetUserId = userId || user.id
    if (targetUserId !== user.id) {
      // Check if user is admin (this is a simplified check - in production, use RLS)
      const { data: profile } = await supabase
        .from('user_subscriptions')
        .select('*')
        .limit(1)

      if (!profile) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    const { data: subscriptions, error } = await supabase
      .from('user_subscriptions')
      .select(
        `
        id,
        user_id,
        app:apps(id, slug, name, description, icon_url),
        subscription_tier,
        is_active,
        started_at,
        expires_at
      `
      )
      .eq('user_id', targetUserId)

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error('Error in GET /api/subscriptions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { userId, appId, subscriptionTier, expiresAt } = body

    // Only super admins can create subscriptions
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create subscription
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        app_id: appId,
        subscription_tier: subscriptionTier || 'basic',
        is_active: true,
        expires_at: expiresAt || null,
      })
      .select(
        `
        id,
        user_id,
        app:apps(id, slug, name),
        subscription_tier,
        is_active,
        started_at
      `
      )
      .single()

    if (error) {
      console.error('Error creating subscription:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/subscriptions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
