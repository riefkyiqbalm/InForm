'use client';

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/context/AuthContext";
import { ChatProvider } from "@sharedUI/context/ChatContext";
import { FormProvider } from "@sharedUI/context/FormContext";
import { ToastProvider } from "@sharedUI/context/ToastContext";
import { SessionSync } from "@/components/SessionSync";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        {/* SessionSync reads NextAuth session and updates AuthContext */}
        <SessionSync />
        
        <ToastProvider>
          <ChatProvider>
            <FormProvider>
              {children}
            </FormProvider>
          </ChatProvider>
        </ToastProvider>
      </AuthProvider>
    </SessionProvider>
  );
}