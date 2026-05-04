"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@sharedUI/context/SharedAuthContext";
import { parseErrorMessage } from "@/lib/errors";
import { useSearchParams } from "next/navigation";

import Background  from "@sharedUI/components/Background";
import Welcome     from "@sharedUI/components/Welcome";
import { Card }           from "@sharedUI/components/Cards";
import { TabButtons }     from "@sharedUI/components/Tabbutons";
import { LogInForm }      from "@/components/auth/LoginForm";
import { RegisterForm }   from "@/components/auth/RegisterForm";
import { ErrorBox } from "@sharedUI/components/ErrorBox";

type Panel = "login" | "register";

export function useAuthError() {
  const params = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const err = params.get("error");

    if (err === "AccountHasPassword") {
      setErrorMsg("Akun ini sudah menggunakan password. Silakan login dengan email dan password anda atau Ubah email google di browser anda.");
      return;
    }
    if (err === "OAuthAccountNotLinked") {
      setErrorMsg("Email ini terdaftar dengan metode login lain.");
      return;
    }
    if (err === "AccessDenied") {
      setErrorMsg("Akses ditolak. Silakan coba lagi.");
      return;
    }
    if (err === "ExpiredLink") {
      setErrorMsg("Tautan login telah kedaluwarsa. Silakan minta tautan baru.");
      return;
    }
    if (err === "InvalidLink") {
      setErrorMsg("Tautan login tidak valid. Silakan minta tautan baru.");
      return;
    }
    if (err) {
      setErrorMsg("Terjadi kesalahan saat login. Silakan coba lagi.");
    }
  }, [params]);

  return errorMsg;
}

export default function AuthPanel() {
  const { register, loading, user } = useAuth();
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<Panel>("login");
  const [error,       setError]       = useState("");
  const errorMsg                      = useAuthError();

  useEffect(() => {
    if (!loading && user?.id) {
      router.replace(`/chat/${user.id}`);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ ...S.root, justifyContent: "center" }}>
        <div style={S.bgGrid} />
      </div>
    );
  }

  const handleRegister = async (email: string, password: string, username: string) => {
    try {
      await register(email, password, username);
    } catch (err: unknown) {
      setError(parseErrorMessage(err, "Pendaftaran gagal."));
    }
  };

  return (
    <div style={S.root}>
      <div style={S.container}>
        <Background />
        {errorMsg && <ErrorBox message={errorMsg} />}
        <Welcome />
        <Card>
          <TabButtons
            active={activePanel}
            onChange={(panel) => {
              setActivePanel(panel);
              setError("");
            }}
          />

          {activePanel === "login" ? (
            <LogInForm
              loading={loading}
              error={error}
              onError={setError}
            />
          ) : (
            <RegisterForm
              onSubmit={handleRegister}
              loading={loading}
              error={error}
              onError={setError}
            />
          )}

          <div style={S.footer}>
            Dengan melanjutkan, Anda menyetujui{" "}
            <a href="/terms" style={S.link}>
              Ketentuan Layanan
            </a>
          </div>
        </Card>
      </div>

      <style jsx global>{`
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0) scale(1); }
          50%       { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes onAutofillStart { from {} to {} }

        input:-webkit-autofill {
          animation-name: onAutofillStart;
        }
      `}</style>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  root: {
    background: "var(--bg)",
    color: "var(--text)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "sans-serif",
  },
  bgGrid: {
    position: "absolute",
    inset: 0,
  },
  container: {
    width: "100%",
    maxWidth: "440px",
    padding: "20px",
    position: "relative",
    zIndex: 10,
    animation: "fadeUp 0.6s ease-out",
  },
  footer: {
    textAlign: "center",
    marginTop: "24px",
    fontSize: "12px",
    color: "var(--muted)",
  },
  link: {
    color: "var(--teal)",
    textDecoration: "none",
  },
};
