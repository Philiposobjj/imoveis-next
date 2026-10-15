
import { createServerClient } from '@supabase/ssr'
import { type EmailOtpType } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type')
  const code = url.searchParams.get('code')

  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(
      new URL('/admin/login?error=config', url.origin)
    )
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options)
        })
      },
    },
  })

  let error = null

  if (tokenHash && type === 'email') {
    const result = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'email',
    })
    error = result.error
  } else if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code)
    error = result.error
  } else {
    error = new Error('Link de confirmação inválido ou incompleto.')
  }

  if (error) {
    console.error('Erro ao confirmar e-mail:', error.message)

    return NextResponse.redirect(
      new URL('/admin/login?error=confirmation', url.origin)
    )
  }

  return NextResponse.redirect(
    new URL('/admin/login?confirmed=1', url.origin)
  )
}

