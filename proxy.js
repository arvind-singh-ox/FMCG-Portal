import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'ifactory-demo-secret-key-2024')

async function verifyTokenEdge(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch {
    return null
  }
}

export default async function proxy(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value
  const userMeta = request.cookies.get('user_meta')?.value

  // Protected routes: /portal/*
  if (pathname.startsWith('/portal')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const decoded = await verifyTokenEdge(token)
    if (!decoded) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.set('token', '', { maxAge: 0, path: '/' })
      response.cookies.set('user_meta', '', { maxAge: 0, path: '/' })
      return response
    }

    return NextResponse.next()
  }

  // Guest routes: redirect to portal if already logged in (but allow signup with new utm_source)
  if (pathname === '/login' || (pathname === '/signup' && !request.nextUrl.searchParams.has('utm_source'))) {
    if (token) {
      const decoded = await verifyTokenEdge(token)
      if (decoded) {
        let portal = '/portal/cement-plant'
        if (userMeta) {
          try {
            const user = JSON.parse(atob(userMeta))
            if (user.industry === 'fmcg' || (user.utmSource && user.utmSource.includes('fmcg'))) {
              portal = '/portal/fmcg'
            } else if (user.utmSource && user.utmSource.includes('steel-plant')) {
              portal = '/portal/steel-plant'
            }
          } catch {}
        }
        return NextResponse.redirect(new URL(portal, request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/portal/:path*', '/login', '/signup'],
}
