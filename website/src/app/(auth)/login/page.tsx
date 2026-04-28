"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@sharedUI/context/SharedAuthContext";
import { parseErrorMessage } from "@/lib/errors";

// ── keep your existing components ────────────────────────────────────────────
import Background  from "@sharedUI/components/Background";
import Welcome     from "@sharedUI/components/Welcome";

// ── new broken-down components ────────────────────────────────────────────────
import { Card }           from "@sharedUI/components/Cards";
import { TabButtons }     from "@sharedUI/components/Tabbutons";
import { LogInForm }      from "@/components/auth/LoginForm";
import { RegisterForm }   from "@/components/auth/RegisterForm";

type Panel = "login" | "register";

export default function AuthPanel() {
  const { login, register, loading, user } = useAuth();
  const router = useRouter();

  const [activePanel, setActivePanel] = useState<Panel>("login");
  const [error,       setError]       = useState("");

  // Wait for session resolution before redirecting (avoids /chat/undefined flash)
  useEffect(() => {
    if (!loading && user?.id) {
      router.replace(`/chat/${user.id}`);
    }
  }, [user, loading, router]);

  // Show blank bg while session resolves
  if (loading) {
    return (
      <div style={{ ...S.root, justifyContent: "center" }}>
        <div style={S.bgGrid} />
      </div>
    );
  }

  // ── login handler ──────────────────────────────────────────────────────────
  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(parseErrorMessage(err, "Login gagal. Periksa kembali akun Anda."));
    }
  };

  // ── register handler ───────────────────────────────────────────────────────
  const handleRegister = async ( email: string, password: string, username: string ) => {
    try {
      await register( email, password, username );
    } catch (err: unknown) {
      setError(parseErrorMessage(err, "Pendaftaran gagal."));
    }
  };

  return (
    <div style={S.root}>
      <div style={S.container}>
        <Background />
        <Welcome />
        <Card>
          {/* Tab switcher */}
          <TabButtons
            active={activePanel}
            onChange={(panel) => {
              setActivePanel(panel);
              setError("");
            }}
          />

          {/* Active form */}
          {activePanel === "login" ? (
            <LogInForm
              onSubmit={handleLogin}
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

          {/* Footer */}
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