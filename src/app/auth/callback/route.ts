import { createClient } from '@/src/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // If there's an OAuth error from Supabase
  if (error) {
    console.error('OAuth error:', error, error_description)
    return NextResponse.redirect(`${origin}/auth/error?message=${error_description}`)
  }

  if (code) {
    try {
      const supabase = await createClient()
      const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        return NextResponse.redirect(`${origin}/auth/error?message=${sessionError.message}`)
      }
      
      if (data.user) {
        // Success - redirect to dashboard
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    } catch (err) {
      console.error('Callback error:', err)
      return NextResponse.redirect(`${origin}/auth/error?message=unexpected_error`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error?message=no_code`)
}
