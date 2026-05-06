import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
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

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()

    if (existingProfile) {
      return NextResponse.json(existingProfile)
    }

    // Create new profile for first-time user
    const email = user.email || ''
    const fullName = user.user_metadata?.full_name || email.split('@')[0]

    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert({
        auth_user_id: user.id,
        email,
        full_name: fullName,
        role: 'user',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating profile:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(newProfile)
  } catch (error) {
    console.error('Error in provision:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
