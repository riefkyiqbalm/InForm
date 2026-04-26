'use client';

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ChatProvider } from "@sharedUI/context/ChatContext";
import { FormProvider } from "@sharedUI/context/FormContext";
import { ToastProvider } from "@sharedUI/context/ToastContext";

/**
 * Komponen Gatekeeper ini bertugas memantau status login.
 * Jika user logout, ChatProvider akan dihancurkan (unmount),
 * sehingga seluruh state chat lama terhapus total dari memori.
 */
function ChatGatekeeper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  // 1. Jika masih loading mengecek token, jangan render apa-apa dulu atau beri spinner
  if (loading) {
    return <>{children}</>;
  }

  // 2. Jika TIDAK login, jangan bungkus dengan ChatProvider.
  // Ini memastikan saat logout, ChatProvider benar-benar hilang dari React Tree.
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // 3. Jika login, baru aktifkan ChatProvider.
  // Saat berganti akun, ChatProvider akan dibuat ulang (remount) 
  // dan akan memicu fetch data yang baru secara otomatis.
  return (
    <ChatProvider>
      {children}
    </ChatProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <ChatGatekeeper>
          <FormProvider>
          {children}
          </FormProvider>
        </ChatGatekeeper>
      </ToastProvider>
    </AuthProvider>
  );
}