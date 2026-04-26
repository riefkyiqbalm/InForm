"use client";
import React, { useState } from "react";
import Icon from "@sharedUI/components/IconStyles";
import { FormInput } from "@sharedUI/components/FormInput";
import { ErrorBox } from "@sharedUI/components/ErrorBox";
import { ForgotPassword } from "@sharedUI/components/buttons/ForgotPassword";
import OauthButton from "@/components/auth/OauthButton";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  loading: boolean;
  error: string;
  onError: (msg: string) => void;
}

export function LoginForm({
  onSubmit,
  loading,
  error,
  onError,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [animateMail, setAnimateMail] = useState(false);
  const [animatePass, setAnimatePass] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError("");
    await onSubmit(email, password);
  };

  const fAnimateMail = (e: React.AnimationEvent<HTMLInputElement>) => {
    if (e.animationName === "onAutofillStart") setAnimateMail(false);
  };

  const fAnimatePass = (e: React.AnimationEvent<HTMLInputElement>) => {
    if (e.animationName === "onAutofillStart") setAnimatePass(false);
  };


  return (
    <>
      <form onSubmit={handleSubmit}>
        <ErrorBox message={error} />

            {/* Google Button */}
            <OauthButton

            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with email
                </span>
              </div>
            </div>


        {/* Email */}
        <FormInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => {
            const v = e.target.value;
            setEmail(v);
            if (v === "") setAnimateMail(true);
          }}
          onAnimationStart={fAnimateMail}
          placeholder="Masukkan email"
          iconName="email"
          iconInvert={!animateMail}
          required
          disabled={loading}
        />

        {/* Password */}
        <FormInput
          label="Kata Sandi"
          type={showPass ? "text" : "password"}
          value={password}
          onChange={(e) => {
            const v = e.target.value;
            setPassword(v);
            if (v === "") setAnimatePass(true);
          }}
          onAnimationStart={fAnimatePass}
          placeholder="Masukkan kata sandi"
          iconName="lock"
          iconInvert={!animatePass}
          required
          disabled={loading}
          rightSlot={
            <span onClick={() => setShowPass(!showPass)} style={S.togglePass}>
              <Icon name={showPass ? "eyeoff" : "eye"} size={18} />
            </span>
          }
        />

        {/* Forgot password link */}
        <div style={S.forgotRow}>
          <button
            type="button"
            style={S.forgotLink}
            onClick={() => router.push("/forgot-password")}
          >
            Lupa kata sandi?
          </button>
        </div>
        {/* <ForgotPassword/> */}
        <button type="submit" disabled={loading} style={S.mainBtn}>
          {loading ? (
            <>
              <Icon name="loading" size={18} />
              <span>Memproses…</span>
            </>
          ) : (
            <>
              <Icon name="forward" size={18} />
              <span>Masuk ke InForm</span>
            </>
          )}
        </button>
      </form>

      {/* Forgot password modal */}
      {/* {showForgot && <ForgotPassword onClose={() => setShowForgot(false)} />} */}
    </>
  );
}

const S: Record<string, React.CSSProperties> = {
  togglePass: {
    cursor: "pointer",
    opacity: 0.7,
    display: "flex",
    alignItems: "center",
  },
  forgotRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "-12px",
    marginBottom: "20px",
  },
  forgotLink: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--teal)",
    fontSize: "12px",
    fontWeight: 600,
    padding: 0,
    textDecoration: "none",
    transition: "opacity 0.2s",
  },
  mainBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, var(--teal), #0080cc)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,212,200,.2)",
    transition: "0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
};
