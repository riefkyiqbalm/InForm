import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware untuk menangani proteksi rute.
 * Mendukung autentikasi manual (_auth_token) dan Google OAuth (next-auth).
 */
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // 1. Ambil token kustom (setelah login manual atau sinkronisasi)
  const customToken = request.cookies.get('_auth_token')?.value;
  
  // 2. Ambil token sesi bawaan Next-Auth (Fallback saat transisi Google Login)
  // Next-Auth menggunakan nama berbeda untuk HTTP dan HTTPS (__Secure-)
  const nextAuthToken = 
    request.cookies.get('next-auth.session-token')?.value;
    // request.cookies.get('__Secure-next-auth.session-token')?.value;

  // Anggap pengguna terautentikasi jika salah satu token ditemukan
  const isAuthenticated = !!customToken || !!nextAuthToken;

  // ── 1. BYPASS API & ASET STATIS ──────────────────────────────────────────
  // Sangat penting untuk melewati rute /api/auth agar callback Google lancar
  if (
    path.startsWith('/api') || 
    path.startsWith('/_next') || 
    path.includes('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // ── 2. DEFINISI PATH ─────────────────────────────────────────────────────
  const isGuestOnlyPath = path === '/login' || path === '/register' ||'';
  const isPublicPath = isGuestOnlyPath || 
                       path === '/verify-email' || 
                       path === '/forgot-password' || 
                       path === '/new-password';

  // ── 3. LOGIKA REDIRECT ───────────────────────────────────────────────────

  // A. Jika Pengguna Sudah Login:
  if (isAuthenticated) {
    // Jika mencoba akses Login/Register atau Halaman Utama (/), arahkan ke Chat
    if (isGuestOnlyPath ) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // B. Jika Pengguna Belum Login:
  if (!isAuthenticated) {
    // Jika mencoba akses halaman terproteksi (seperti /chat)
    if (!isPublicPath) {
      // Redirect ke login jika mencoba akses halaman internal atau root (/)
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Menjalankan middleware pada semua path kecuali file statis dengan ekstensi
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}