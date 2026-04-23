"use client";

// app/(auth)/verify-email/page.tsx
//
// Connects to the backend flow:
//
//   REGISTRATION FLOW:
//     1. User fills register form
//     2. AuthContext.register() → POST /api/auth/verify → creates user, sends email
//     3. AuthContext redirects to /verify-email  (no token, shows WaitingView)
//     4. User clicks email link → GET /api/auth/verify?token=...
//     5. Route validates token, updates DB, redirects to /verify-email?success=1
//     6. This page reads ?success=1 → shows SuccessView → auto-redirect to /login
//
//   ERROR / RESEND FLOW:
//     - GET /api/auth/resend_verification?token=... fails → redirect to /verify-email?error=...
//     - This page reads ?error=... → shows ErrorView
//     - User clicks "Kirim Ulang" → POST /api/auth/resend-verification { email }
//
// The page never calls POST /api/auth/verify-email — the backend uses GET redirects.

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import {
  VerifyBackground,
  AuthCard,
  WaitingView,
  VerifyingView,
  SuccessView,
  ErrorView,
  type VerifyState,
} from "@/components/verifyEmail";

// Error code → human-readable message
const ERROR_MESSAGES: Record<string, string> = {
  invalid_token: "Tautan verifikasi tidak valid. Minta tautan baru di bawah.",
  token_expired: "Tautan verifikasi sudah kedaluwarsa (berlaku 24 jam). Minta tautan baru.",
};

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const success    = searchParams.get("success");   // "1" when route redirected after verify
  const errorCode  = searchParams.get("error");     // "invalid_token" | "token_expired" | null
  // email is passed as query param by AuthContext after register so resend knows who to email
  const emailParam = searchParams.get("email") ?? "";

  const [state, setState]       = useState<VerifyState>(() => {
    if (success === "1") return "success";
    if (errorCode)       return "error";
    return "waiting";
  });

  const [errorMessage, setErrorMessage]   = useState(
    errorCode ? (ERROR_MESSAGES[errorCode] ?? "Verifikasi gagal.") : ""
  );
  const [email, setEmail]                 = useState(emailParam);
  const [isResending, setIsResending]     = useState(false);
  const autoRedirectDone = useRef(false);

  // Auto-redirect to /login after success
  useEffect(() => {
    if (state !== "success" || autoRedirectDone.current) return;
    autoRedirectDone.current = true;
    setTimeout(() => router.push("/login"), 3000);
  }, [state, router]);

  // Resend verification email
  const handleResend = useCallback(async () => {
    if (!email) {
      // If we don't have the email (e.g. user navigated directly), ask them to register again
      router.push("/login");
      return;
    }

    setIsResending(true);
    try {
      const res = await fetch("/api/auth/resend_verification", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.error ?? "Gagal mengirim ulang email.");
        setState("error");
        return;
      }

      // Reset to waiting so user knows it was sent
      setState("waiting");
      setErrorMessage("");
    } catch {
      setErrorMessage("Gagal mengirim ulang email. Periksa koneksi Anda.");
      setState("error");
    } finally {
      setIsResending(false);
    }
  }, [email, router]);

  return (
    <VerifyBackground>
      <AuthCard>
        {state === "waiting"   && (
          <WaitingView onResend={handleResend} isResending={isResending} />
        )}
        {state === "verifying" && <VerifyingView />}
        {state === "success"   && <SuccessView />}
        {state === "error"     && (
          <ErrorView
            message={errorMessage}
            onResend={handleResend}
            isResending={isResending}
          />
        )}
      </AuthCard>
    </VerifyBackground>
  );
}