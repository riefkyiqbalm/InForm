// emails/PasswordResetEmail.tsx
// React Email template — password reset request.
// Preview: npx email dev --dir src/emails

import {
  Body, Button, Container, Head, Heading,
  Hr, Html, Link, Preview, Section, Text,
} from "@react-email/components";
import type React from "react";

interface PasswordResetProps {
  name: string;
  resetUrl: string;
  /** How long the link is valid. Default: "1 jam". */
  expiryLabel?: string;
}

export default function PasswordReset({
  name,
  resetUrl,
  expiryLabel = "1 jam",
}: PasswordResetProps) {
  return (
    <Html lang="id" dir="ltr">
      <Head />
      <Preview>Reset kata sandi akun BG-AI Anda</Preview>

      <Body style={S.body}>
        <Container style={S.container}>

          {/* Header */}
          <Section style={S.header}>
            <table width="100%" cellPadding={0} cellSpacing={0}><tr><td align="center">
              <table cellPadding={0} cellSpacing={0}><tr>
                <td style={S.logoCell}><Text style={S.logoText}>BG</Text></td>
                <td style={{ paddingLeft: 10, verticalAlign: "middle" }}>
                  <Text style={S.logoName}>BG-AI</Text>
                </td>
              </tr></table>
            </td></tr></table>
          </Section>

          {/* Icon */}
          <Section style={S.iconSection}>
            <table width="100%" cellPadding={0} cellSpacing={0}><tr>
              <td align="center">
                <div style={S.iconRing}>
                  {/* Lock icon */}
                  <img
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 24 24' fill='none' stroke='%2300d4c8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='11' width='18' height='11' rx='2' ry='2'%3E%3C/rect%3E%3Cpath d='M7 11V7a5 5 0 0 1 10 0v4'%3E%3C/path%3E%3C/svg%3E"
                    width={30} height={30} alt=""
                  />
                </div>
              </td>
            </tr></table>
          </Section>

          {/* Content */}
          <Section style={S.content}>
            <Heading style={S.h1}>Reset Kata Sandi</Heading>

            <Text style={S.greeting}>
              Halo, <strong style={{ color: "#e8eef6" }}>{name}</strong>!
            </Text>

            <Text style={S.body2}>
              Kami menerima permintaan untuk mereset kata sandi akun{" "}
              <strong style={{ color: "#00d4c8" }}>BG-AI</strong> Anda.
              Klik tombol di bawah untuk membuat kata sandi baru.
            </Text>

            <Section style={S.btnSection}>
              <Button style={S.btn} href={resetUrl}>
                🔑 &nbsp; Reset Kata Sandi
              </Button>
            </Section>

            <Text style={S.expiry}>
              Tautan ini hanya berlaku selama{" "}
              <strong style={{ color: "#e8eef6" }}>{expiryLabel}</strong>.
            </Text>

            <Text style={S.warning}>
              Jika Anda tidak meminta reset kata sandi, abaikan email ini.
              Kata sandi Anda tidak akan berubah.
            </Text>
          </Section>

          <Hr style={S.divider} />

          {/* Fallback link */}
          <Section style={S.fallback}>
            <Text style={S.fallbackLabel}>Tombol tidak berfungsi? Gunakan tautan ini:</Text>
            <Link href={resetUrl} style={S.fallbackLink}>{resetUrl}</Link>
          </Section>

          <Hr style={S.divider} />

          <Section style={S.footer}>
            <Text style={S.footerText}>
              Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
            </Text>
            <Text style={S.footerText}>
              © {new Date().getFullYear()} BG-AI · Platform AI Multimodal Pengawasan Gizi
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

PasswordReset.PreviewProps = {
  name:     "Budi Santoso",
  resetUrl: "http://localhost:3000/reset-password?token=preview_token",
} satisfies PasswordResetProps;

// ── Styles ────────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  body:         { backgroundColor: "#060d1a", fontFamily: "'DM Sans','Helvetica Neue',Arial,sans-serif", margin: 0, padding: "40px 0" },
  container:    { backgroundColor: "#0c1828", border: "1px solid #1a3050", borderRadius: "16px", margin: "0 auto", maxWidth: "520px", overflow: "hidden" },
  header:       { backgroundColor: "#0a1520", borderBottom: "1px solid #1a3050", padding: "20px 32px" },
  logoCell:     { backgroundColor: "#00d4c8", borderRadius: "10px", width: "38px", height: "38px", textAlign: "center", verticalAlign: "middle" },
  logoText:     { color: "#fff", fontSize: "14px", fontWeight: "800", margin: 0, lineHeight: "38px", letterSpacing: "0.5px" },
  logoName:     { color: "#e8eef6", fontSize: "18px", fontWeight: "700", margin: 0, lineHeight: "38px" },
  iconSection:  { padding: "36px 32px 0" },
  iconRing:     { display: "inline-block", width: "68px", height: "68px", backgroundColor: "rgba(0,212,200,0.08)", border: "1px solid rgba(0,212,200,0.2)", borderRadius: "50%", lineHeight: "68px", textAlign: "center", verticalAlign: "middle" },
  content:      { padding: "24px 32px 32px" },
  h1:           { color: "#e8eef6", fontSize: "22px", fontWeight: "800", letterSpacing: "-0.3px", margin: "0 0 16px", textAlign: "center" },
  greeting:     { color: "#94afc8", fontSize: "15px", lineHeight: "1.6", margin: "0 0 12px" },
  body2:        { color: "#94afc8", fontSize: "14px", lineHeight: "1.7", margin: "0 0 28px" },
  btnSection:   { textAlign: "center", margin: "0 0 20px" },
  btn:          { backgroundColor: "#f5c842", borderRadius: "12px", color: "#060d1a", display: "inline-block", fontSize: "15px", fontWeight: "700", padding: "14px 32px", textDecoration: "none" },
  expiry:       { color: "#5a7a99", fontSize: "13px", lineHeight: "1.6", margin: "0 0 12px", textAlign: "center" },
  warning:      { color: "#5a7a99", fontSize: "12px", lineHeight: "1.6", margin: "0", textAlign: "center", fontStyle: "italic" },
  divider:      { borderColor: "#1a3050", margin: "0" },
  fallback:     { padding: "20px 32px" },
  fallbackLabel:{ color: "#5a7a99", fontSize: "12px", margin: "0 0 8px" },
  fallbackLink: { color: "#00d4c8", fontSize: "12px", wordBreak: "break-all", textDecoration: "underline" },
  footer:       { padding: "20px 32px" },
  footerText:   { color: "#3a5570", fontSize: "12px", margin: "0 0 4px", textAlign: "center" },
};