// emails/EmailChangeVerificationEmail.tsx
// Sent to the NEW email address when user requests an email change.
// They must click the link to confirm before the address is switched.

import {
  Body, Button, Container, Head, Heading,
  Hr, Html, Link, Preview, Section, Text,
} from "@react-email/components";
import type React from "react";

interface EmailChangeVerificationProps {
  name: string;
  /** The NEW email address being verified. */
  newEmail: string;
  /** The current (old) email address. */
  oldEmail: string;
  /** Full URL: BASE_URL/api/auth/change_email?token=... */
  verifyUrl: string;
  expiryLabel?: string;
}

export default function EmailChanges({
  name,
  newEmail,
  oldEmail,
  verifyUrl,
  expiryLabel = "24 jam",
}: EmailChangeVerificationProps) {
  return (
    <Html lang="id" dir="ltr">
      <Head />
      <Preview>Konfirmasi perubahan email akun BG-AI Anda</Preview>

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
                  <img
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 24 24' fill='none' stroke='%2300d4c8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'%3E%3C/path%3E%3Cpolyline points='22%2C6 12%2C13 2%2C6'%3E%3C/polyline%3E%3Ccircle cx='19' cy='19' r='4' fill='%23f5c842' stroke='none'%3E%3C/circle%3E%3Cpath d='M19 17v2l1 1' stroke='%23060d1a' stroke-width='1.2'%3E%3C/path%3E%3C/svg%3E"
                    width={30} height={30} alt=""
                  />
                </div>
              </td>
            </tr></table>
          </Section>

          {/* Content */}
          <Section style={S.content}>
            <Heading style={S.h1}>Konfirmasi Perubahan Email</Heading>

            <Text style={S.greeting}>
              Halo, <strong style={{ color: "#e8eef6" }}>{name}</strong>!
            </Text>

            <Text style={S.body2}>
              Anda telah meminta perubahan alamat email untuk akun{" "}
              <strong style={{ color: "#00d4c8" }}>BG-AI</strong> Anda.
              Klik tombol di bawah untuk mengonfirmasi perubahan ini.
            </Text>

            {/* Email change summary */}
            <Section style={S.changeBox}>
              <table width="100%" cellPadding={0} cellSpacing={0}>
                <tr>
                  <td style={S.changeRow}>
                    <Text style={S.changeLabel}>Email Lama</Text>
                    <Text style={S.changeValue}>{oldEmail}</Text>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "4px 0", textAlign: "center" }}>
                    <Text style={{ color: "#5a7a99", fontSize: "16px", margin: 0 }}>↓</Text>
                  </td>
                </tr>
                <tr>
                  <td style={S.changeRow}>
                    <Text style={S.changeLabel}>Email Baru</Text>
                    <Text style={{ ...S.changeValue, color: "#00d4c8" }}>{newEmail}</Text>
                  </td>
                </tr>
              </table>
            </Section>

            <Section style={S.btnSection}>
              <Button style={S.btn} href={verifyUrl}>
                ✓ &nbsp; Konfirmasi Email Baru
              </Button>
            </Section>

            <Text style={S.expiry}>
              Tautan berlaku selama{" "}
              <strong style={{ color: "#e8eef6" }}>{expiryLabel}</strong>.
            </Text>

            <Text style={S.warning}>
              Jika Anda tidak meminta perubahan ini, abaikan email ini.
              Email Anda tidak akan berubah.
            </Text>
          </Section>

          <Hr style={S.divider} />

          <Section style={S.fallback}>
            <Text style={S.fallbackLabel}>Tombol tidak berfungsi? Gunakan tautan ini:</Text>
            <Link href={verifyUrl} style={S.fallbackLink}>{verifyUrl}</Link>
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

EmailChanges.PreviewProps = {
  name:      "Budi Santoso",
  newEmail:  "budi.baru@example.com",
  oldEmail:  "budi@example.com",
  verifyUrl: "http://localhost:3000/api/auth/verify?token=preview_token",
} satisfies EmailChangeVerificationProps;

const S: Record<string, React.CSSProperties> = {
  body:         { backgroundColor: "#060d1a", fontFamily: "'DM Sans','Helvetica Neue',Arial,sans-serif", margin: 0, padding: "40px 0" },
  container:    { backgroundColor: "#0c1828", border: "1px solid #1a3050", borderRadius: "16px", margin: "0 auto", maxWidth: "520px", overflow: "hidden" },
  header:       { backgroundColor: "#0a1520", borderBottom: "1px solid #1a3050", padding: "20px 32px" },
  logoCell:     { backgroundColor: "#00d4c8", borderRadius: "10px", width: "38px", height: "38px", textAlign: "center", verticalAlign: "middle" },
  logoText:     { color: "#fff", fontSize: "14px", fontWeight: "800", margin: 0, lineHeight: "38px" },
  logoName:     { color: "#e8eef6", fontSize: "18px", fontWeight: "700", margin: 0, lineHeight: "38px" },
  iconSection:  { padding: "36px 32px 0" },
  iconRing:     { display: "inline-block", width: "68px", height: "68px", backgroundColor: "rgba(0,212,200,0.08)", border: "1px solid rgba(0,212,200,0.2)", borderRadius: "50%", lineHeight: "68px", textAlign: "center", verticalAlign: "middle" },
  content:      { padding: "24px 32px 32px" },
  h1:           { color: "#e8eef6", fontSize: "22px", fontWeight: "800", letterSpacing: "-0.3px", margin: "0 0 16px", textAlign: "center" },
  greeting:     { color: "#94afc8", fontSize: "15px", lineHeight: "1.6", margin: "0 0 12px" },
  body2:        { color: "#94afc8", fontSize: "14px", lineHeight: "1.7", margin: "0 0 24px" },
  changeBox:    { backgroundColor: "rgba(0,212,200,0.04)", border: "1px solid rgba(0,212,200,0.12)", borderRadius: "12px", padding: "16px", margin: "0 0 24px" },
  changeRow:    { padding: "6px 0" },
  changeLabel:  { color: "#5a7a99", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 4px" },
  changeValue:  { color: "#e8eef6", fontSize: "14px", fontWeight: "600", margin: 0, wordBreak: "break-all" },
  btnSection:   { textAlign: "center", margin: "0 0 20px" },
  btn:          { backgroundColor: "#00d4c8", borderRadius: "12px", color: "#060d1a", display: "inline-block", fontSize: "15px", fontWeight: "700", padding: "14px 32px", textDecoration: "none" },
  expiry:       { color: "#5a7a99", fontSize: "13px", lineHeight: "1.6", margin: "0 0 12px", textAlign: "center" },
  warning:      { color: "#5a7a99", fontSize: "12px", lineHeight: "1.6", margin: 0, textAlign: "center", fontStyle: "italic" },
  divider:      { borderColor: "#1a3050", margin: "0" },
  fallback:     { padding: "20px 32px" },
  fallbackLabel:{ color: "#5a7a99", fontSize: "12px", margin: "0 0 8px" },
  fallbackLink: { color: "#00d4c8", fontSize: "12px", wordBreak: "break-all", textDecoration: "underline" },
  footer:       { padding: "20px 32px" },
  footerText:   { color: "#3a5570", fontSize: "12px", margin: "0 0 4px", textAlign: "center" },
};