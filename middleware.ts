import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from './lib/supabase'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // Instantiate the SSR client
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value))
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh auth token
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = req.nextUrl.pathname

  // 1. Not logged in accessing protected routes → send to login
  if (!session && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 2. User is logged in
  if (session) {
    // Try to fetch role — if this fails, we still allow the user through (don't block)
    let role: string | null = null;
    try {
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (data) {
        role = data.role as string | null;
      }
    } catch (_) {
      // Role fetch failed — treat as unknown role, let the request through
    }

    // 3. Logged-in users trying to access auth pages → redirect to their dashboard
    if (path === '/login' || path === '/register') {
      if (role === 'engineer') return NextResponse.redirect(new URL('/dashboard/engineer', req.url));
      if (role === 'client') return NextResponse.redirect(new URL('/dashboard/client', req.url));
      // If role is unknown (DB issue), let them through to login/register
      // so they aren't trapped in a redirect loop
      return res;
    }

    // 4. Client-only routes
    if (path.startsWith('/dashboard/client')) {
      if (role === 'engineer') {
        return NextResponse.redirect(new URL('/dashboard/engineer', req.url));
      }
      // If role unknown, let them through rather than looping
    }

    // 5. Engineer-only routes
    if (path.startsWith('/dashboard/engineer')) {
      if (role === 'client') {
        return NextResponse.redirect(new URL('/dashboard/client', req.url));
      }
      // If role unknown, let them through rather than looping
    }

    // 6. Admin-only routes
    if (path.startsWith('/dashboard/admin')) {
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register'
  ],
}
