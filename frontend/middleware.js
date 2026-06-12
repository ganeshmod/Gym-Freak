import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

const protectedRoutes = ['/user-profile', '/orders'];
const authRoutes = ['/auth'];
const excludeRoutes = ['/auth/account-verification'];

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('authUser')?.value;

  const startsWithAny = (prefixes, str) => prefixes.some(p => str.startsWith(p));

  if (startsWithAny(excludeRoutes, path)) return NextResponse.next();

  if (token) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      console.log("Token valid for user:", payload.userId)

      if (startsWithAny(authRoutes, path)) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      return NextResponse.next();

    } catch (err) {
      console.log("Token verification failed:", err.message)
      const res = NextResponse.redirect(new URL('/auth/login', request.url));
      res.cookies.set('authUser', '', { maxAge: 0 });
      return res;
    }
  } else {
    console.log("No token found, checking protected routes")
    if (startsWithAny(protectedRoutes, path)) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/',                // home
    '/auth/:path*',     // login/register
    '/user-profile/:path*',  // protected
    '/orders/:path*'    // protected
  ]
};