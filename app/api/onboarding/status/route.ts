import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const appId = request.nextUrl.searchParams.get('appId')

    if (!appId) {
      return NextResponse.json(
        { error: 'appId parameter is required' },
        { status: 400 }
      )
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: status, error } = await supabase
      .from('user_onboarding_status')
      .select('*')
      .eq('user_id', user.id)
      .eq('app_id', appId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is expected for new users
      console.error('Error fetching onboarding status:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If no record exists, create one
    if (!status) {
      const { data: newStatus, error: insertError } = await supabase
        .from('user_onboarding_status')
        .insert({
          user_id: user.id,
          app_id: appId,
          is_completed: false,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating onboarding status:', insertError)
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        )
      }

      return NextResponse.json(newStatus)
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('Error in /api/onboarding/status:', error)
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
    const { appId, isCompleted } = body

    if (!appId) {
      return NextResponse.json(
        { error: 'appId is required' },
        { status: 400 }
      )
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: updated, error } = await supabase
      .from('user_onboarding_status')
      .upsert({
        user_id: user.id,
        app_id: appId,
        is_completed: isCompleted || false,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating onboarding status:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error in POST /api/onboarding/status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
