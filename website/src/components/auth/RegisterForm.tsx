"use client";
import React, { useState } from "react";
import Icon  from "@sharedUI/components/IconStyles";
import { FormInput } from "@sharedUI/components/FormInput";
import { ErrorBox } from "@sharedUI/components/ErrorBox";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { checkPasswordStrength, validatePasswordMatch } from "@/lib/validators";

interface RegisterFormProps {
  onSubmit: (name: string, email: string, password: string) => Promise<void>;
  loading:  boolean;
  error:    string;
  onError:  (msg: string) => void;
}

export function RegisterForm({ onSubmit, loading, error, onError }: RegisterFormProps) {
  const [email,           setEmail]           = useState("");
  const [name,            setName]               = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass,        setShowPass]        = useState(false);
  const [passwordStrength,setPasswordStrength]= useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError("");

    if (!checkPasswordStrength(password)) {
      onError("Password Minimal 6 Karakter");
      return;
    }
    if (!validatePasswordMatch(password, confirmPassword)) {
      onError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    await onSubmit(email, password, name);
  };

  return (
    <form onSubmit={handleSubmit}>
      <ErrorBox message={error} />

      {/* Email */}
      <FormInput
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Masukkan email"
        iconName="email"
        required
        disabled={loading}
      />

      {/* Username */}
      <FormInput
        label="Username"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Masukkan username"
        iconName="user"
        required
        disabled={loading}
      />

      {/* Password + strength bar */}
      <div>
        <FormInput
          label="Kata Sandi"
          type={showPass ? "text" : "password"}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordStrength(checkPasswordStrength(e.target.value));
          }}
          placeholder="Masukkan kata sandi"
          iconName="lock"
          required
          disabled={loading}
          rightSlot={
            <span
              onClick={() => setShowPass(!showPass)}
              style={S.togglePass}
            >
              <Icon name={showPass ? "eyeoff" : "eye"} size={18} />
            </span>
          }
        />
        <PasswordStrength score={passwordStrength} />
      </div>

      {/* Confirm password */}
      <FormInput
        label="Konfirmasi Sandi"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Ulangi kata sandi"
        iconName="lock"
        required
        disabled={loading}
      />

      <button type="submit" disabled={loading} style={S.mainBtn}>
        {loading ? (
          <>
            <Icon name="loading" size={18}  />
            <span>Memproses…</span>
          </>
        ) : (
          <>
            <Icon name="new_user" size={18} />
            <span>Buat Akun</span>
          </>
        )}
      </button>
    </form>
  );
}

const S: Record<string, React.CSSProperties> = {
  togglePass: {
    cursor: "pointer",
    opacity: 0.7,
    display: "flex",
    alignItems: "center",
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
    marginTop: "8px",
  },
};