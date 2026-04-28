"use client";

import React, { useEffect } from "react";
// Menggunakan import standar untuk Next.js
import { useRouter } from "next/navigation";
/** * Menggunakan referensi context yang sesuai. 
 * Jika @sharedUI tidak terbaca di editor ini, pastikan path alias di tsconfig sudah benar.
 */
import { useAuth } from "@sharedUI/context/SharedAuthContext";

/**
 * RootPage (/) - Menangani distribusi user setelah login
 */
export default function RootPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Jangan lakukan apapun jika AuthContext masih dalam proses validasi awal
    if (loading) return;

    if (isAuthenticated && user?.id) {
      // Jika sudah punya data user lengkap, langsung ke chat spesifik
      router.replace(`/chat/${user.id}`);
    } else if (!isAuthenticated) {
      // Jika benar-benar tidak terautentikasi, lempar ke login
      router.replace("/login");
    }
  }, [isAuthenticated, user, loading, router]);

  // Tampilan loading yang konsisten dengan tema aplikasi
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0d1117]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
        <p className="text-gray-400 text-sm font-medium animate-pulse">
          Menyiapkan sesi Anda...
        </p>
      </div>
    </div>
  );
}