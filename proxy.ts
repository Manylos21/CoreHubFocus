import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const protectedRoutes = ['/dashboard', '/apps', '/documentation', '/builds', '/settings']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  const isLoginPage = request.nextUrl.pathname === '/login'
  const isLogoutRoute = request.nextUrl.pathname === '/auth/logout'

  // Redirect to login if not authenticated and trying to access protected route
  if (isProtectedRoute && !user) {
    const redirectTo = request.nextUrl.pathname + request.nextUrl.search
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', redirectTo)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if authenticated and trying to access login
  if (isLoginPage && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
