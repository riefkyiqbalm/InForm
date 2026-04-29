// emails/PasswordChangedEmail.tsx
// Sent after a password is successfully changed (reset OR profile update).
// Acts as a security alert — lets the user know if they didn't do this.

import {
  Body, Button, Container, Head, Heading,
  Hr, Html, Link, Preview, Section, Text,
} from "@react-email/components";
import type React from "react";

interface PasswordChangedEmailProps {
  name: string;
  /** ISO timestamp of when the change happened — shown in email. */
  changedAt: string;
  /** URL to contact support if this wasn't them. */
  supportUrl?: string;
}

export default function PasswordChanges({
  name,
  changedAt,
  supportUrl = "mailto:support@aotamata.space",
}: PasswordChangedEmailProps) {
  const formattedTime = new Date(changedAt).toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone:  "Asia/Jakarta",
  });

  return (
    <Html lang="id" dir="ltr">
      <Head />
      <Preview>Kata sandi akun InForm Anda telah diubah</Preview>

      <Body style={S.body}>
        <Container style={S.container}>

          {/* Header */}
          <Section style={S.header}>
            <table width="100%" cellPadding={0} cellSpacing={0}><tr><td align="center">
              <table cellPadding={0} cellSpacing={0}><tr>
                <td style={S.logoCell}><Text style={S.logoText}>IF</Text></td>
                <td style={{ paddingLeft: 10, verticalAlign: "middle" }}>
                  <Text style={S.logoName}>InForm</Text>
                </td>
              </tr></table>
            </td></tr></table>
          </Section>

          {/* Content */}
          <Section style={S.content}>
            <Heading style={S.h1}>Kata Sandi Berhasil Diubah</Heading>

            <Text style={S.greeting}>
              Halo, <strong style={{ color: "#e8eef6" }}>{name}</strong>!
            </Text>

            <Text style={S.body2}>
              Kata sandi akun <strong style={{ color: "#00d4c8" }}>InForm</strong> Anda
              telah berhasil diubah pada:
            </Text>

            {/* Timestamp box */}
            <Section style={S.timestampBox}>
              <Text style={S.timestamp}>🕐 &nbsp; {formattedTime} WIB</Text>
            </Section>

            <Text style={S.body2}>
              Jika Anda yang melakukan perubahan ini, tidak ada tindakan lebih lanjut
              yang diperlukan.
            </Text>

            {/* Security alert */}
            <Section style={S.alertBox}>
              <Text style={S.alertText}>
                ⚠️ &nbsp; Jika Anda <strong>tidak</strong> mengubah kata sandi,
                segera hubungi tim dukungan kami untuk mengamankan akun Anda.
              </Text>
            </Section>

            <Section style={S.btnSection}>
              <Button style={S.btn} href={supportUrl}>
                Hubungi Dukungan
              </Button>
            </Section>
          </Section>

          <Hr style={S.divider} />

          <Section style={S.footer}>
            <Text style={S.footerText}>
              Email keamanan ini dikirim secara otomatis. Mohon tidak membalas email ini.
            </Text>
            <Text style={S.footerText}>
              © {new Date().getFullYear()} InForm · Platform AI Pengisian Formulir Digital Otomatis.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

PasswordChanges.PreviewProps = {
  name:      "Budi Santoso",
  changedAt: new Date().toISOString(),
} satisfies PasswordChangedEmailProps;

const S: Record<string, React.CSSProperties> = {
  body:         { backgroundColor: "#060d1a", fontFamily: "'DM Sans','Helvetica Neue',Arial,sans-serif", margin: 0, padding: "40px 0" },
  container:    { backgroundColor: "#0c1828", border: "1px solid #1a3050", borderRadius: "16px", margin: "0 auto", maxWidth: "520px", overflow: "hidden" },
  header:       { backgroundColor: "#0a1520", borderBottom: "1px solid #1a3050", padding: "20px 32px" },
  logoCell:     { backgroundColor: "#00d4c8", borderRadius: "10px", width: "38px", height: "38px", textAlign: "center", verticalAlign: "middle" },
  logoText:     { color: "#fff", fontSize: "14px", fontWeight: "800", margin: 0, lineHeight: "38px" },
  logoName:     { color: "#e8eef6", fontSize: "18px", fontWeight: "700", margin: 0, lineHeight: "38px" },
  iconSection:  { padding: "36px 32px 0" },
  iconRing:     { display: "inline-block", width: "68px", height: "68px", backgroundColor: "rgba(61,255,160,0.06)", border: "1px solid rgba(61,255,160,0.2)", borderRadius: "50%", lineHeight: "68px", textAlign: "center", verticalAlign: "middle" },
  content:      { padding: "24px 32px 32px" },
  h1:           { color: "#3dffa0", fontSize: "22px", fontWeight: "800", letterSpacing: "-0.3px", margin: "0 0 16px", textAlign: "center" },
  greeting:     { color: "#94afc8", fontSize: "15px", lineHeight: "1.6", margin: "0 0 12px" },
  body2:        { color: "#94afc8", fontSize: "14px", lineHeight: "1.7", margin: "0 0 16px" },
  timestampBox: { backgroundColor: "rgba(0,212,200,0.06)", border: "1px solid rgba(0,212,200,0.15)", borderRadius: "10px", padding: "12px 16px", margin: "0 0 20px" },
  timestamp:    { color: "#00d4c8", fontSize: "14px", fontWeight: "600", margin: 0, textAlign: "center" },
  alertBox:     { backgroundColor: "rgba(245,200,66,0.06)", border: "1px solid rgba(245,200,66,0.2)", borderRadius: "10px", padding: "14px 16px", margin: "0 0 24px" },
  alertText:    { color: "#f5c842", fontSize: "13px", lineHeight: "1.6", margin: 0 },
  btnSection:   { textAlign: "center" },
  btn:          { backgroundColor: "#1a3050", borderRadius: "10px", color: "#e8eef6", border: "1px solid #1a3050", display: "inline-block", fontSize: "14px", fontWeight: "600", padding: "12px 28px", textDecoration: "none" },
  divider:      { borderColor: "#1a3050", margin: "0" },
  footer:       { padding: "20px 32px" },
  footerText:   { color: "#3a5570", fontSize: "12px", margin: "0 0 4px", textAlign: "center" },
};