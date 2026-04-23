"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RootPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Jika proses loading selesai
    if (!loading) {
      if (isAuthenticated && user?.id) {
        // Jika sudah login, lempar ke chat spesifik ID user
        router.replace(`/chat/${user.id}`);
      } else {
        // Jika belum login, lempar ke login
        router.replace("/login");
      }
    }
  }, [isAuthenticated, user, loading, router]);

  // Tampilkan loading screen sederhana saat proses redirect
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
}