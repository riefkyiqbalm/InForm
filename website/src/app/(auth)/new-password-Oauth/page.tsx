"use-client";
import React from "react";
import { InputPassword } from "@sharedUI/components/emails/InputNewPassword";
import Background from "@sharedUI/components/Background";
import { Card } from "@sharedUI/components/Cards";

export default function forgotPassword() {
  return (
    <div style={S.root}>
      <div style={S.container}>
      <Background />
        <Card>
          <div>
            <InputPassword 
             linkMessages     = "Password Baru"             // Pakai kalimat "Reset" jika user tidak login dari google, pakai kalimat "Password Baru"
             passwordMessages = "Membuat"                   // Pakai kalimat "Mengatur Ulang" jika user tidak login dari google, pakai kalimat "Membuat"
             uiMessages       = "Pembuatan"                 // Pakai kalimat "Atur Ulang" jika user tidak login dari google, pakai kalimat "Pembuatan" // Pakai kalimat "diperbarui" jika user tidak login dari google, pakai kalimat "dibuat"
             uiMessages2      = "dibuat" />                 
          </div>
        </Card>
      </div>
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
  container: {
    width: "100%",
    maxWidth: "440px",
    padding: "20px",
    position: "relative",
    zIndex: 10,
    animation: "fadeUp 0.6s ease-out",
  }
}
