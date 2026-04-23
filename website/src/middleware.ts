// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('_auth_token')?.value;

  // ── STRATEGI BYPASS API ───────────────────────────────────────────────────
  // Sangat Penting: Jika request mengarah ke API, jangan lakukan redirect.
  // Ini memastikan registrasi (POST) tidak kehilangan body data karena redirect.
  if (path.startsWith('/api')) {
    return NextResponse.next();
  }

  // ── DEFINISI PATH ─────────────────────────────────────────────────────────
  const isGuestOnlyPath = path === '/login' || path === '/register';
  const isVerifyPath = path === '/verify-email';
  const isPublicPath = isGuestOnlyPath || isVerifyPath || path === '/forgot-password' || path === '/new-password';

  // ── LOGIKA REDIRECT HALAMAN ───────────────────────────────────────────────

  // 1. Jika sudah login tapi coba masuk ke Login/Register -> Lempar ke dashboard
  if (token && isGuestOnlyPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Jika sudah login dan buka /verify-email -> IZINKAN (Kasus Edit Profile)
  if (token && isVerifyPath) {
    return NextResponse.next();
  }

  // 3. Jika belum login dan coba akses halaman terproteksi -> Lempar ke Login
  // Kecualikan path '/' jika itu adalah landing page publik
  if (!token && !isPublicPath && path !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Jalankan middleware pada semua path kecuali:
     * - _next/static (file statis)
     * - _next/image (optimasi gambar)
     * - favicon.ico (ikon browser)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}