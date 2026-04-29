// emails/VerificationEmail.tsx
//
// React Email template for the email verification flow.
// Matches InForm's dark/teal design language.
// Rendered server-side by the Resend SDK — never imported by Next.js pages.
//
// Install deps:
//   npm install resend @react-email/components

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface VerificationEmailProps {
  /** User's display name — shown in the greeting. */
  name: string;
  /** Full verification URL: https://yourdomain.com/api/auth/verify?token=... */
  verifyUrl: string;
  /** How long the link is valid, shown in the email. Default: "24 jam". */
  expiryLabel?: string;
}

export default function VerificationEmail({
  name,
  verifyUrl,
  expiryLabel = "24 jam",
}: VerificationEmailProps) {
  return (
    <Html lang="id" dir="ltr">
      <Head />

      {/* Preview text shown in inbox before opening */}
      <Preview>Verifikasi email Anda untuk mengaktifkan akun InForm</Preview>

      <Body style={body}>
        <Container style={container}>

          {/* ── Header ─────────────────────────────────────────────────── */}
          <Section style={header}>
            <table width="100%" cellPadding={0} cellSpacing={0}>
              <tr>
                <td align="center">
                  {/* Logo mark — inline table because some clients strip divs */}
                  <table cellPadding={0} cellSpacing={0}>
                    <tr>
                      <td style={logoCell}>
                        <Text style={logoText}>IF</Text>
                      </td>
                      <td style={{ paddingLeft: 10, verticalAlign: "middle" }}>
                        <Text style={logoName}>InForm</Text>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </Section>

          {/* ── Body ───────────────────────────────────────────────────── */}
          <Section style={contentSection}>
            <Heading style={h1}>Verifikasi Email Anda</Heading>

            <Text style={greeting}>
              Halo, <strong style={{ color: "#e8eef6" }}>{name}</strong>!
            </Text>

            <Text style={bodyText}>
              Terima kasih telah mendaftar di <strong style={{ color: "#00d4c8" }}>InForm</strong> —
              platform AI Pengisian Formulir Digital Otomatis. Klik tombol di bawah untuk
              memverifikasi alamat email Anda dan mengaktifkan akun.
            </Text>

            {/* ── CTA Button ─────────────────────────────────────────── */}
            <Section style={btnSection}>
              <Button style={btn} href={verifyUrl}>
                ✓ &nbsp; Verifikasi Email Saya
              </Button>
            </Section>

            <Text style={expiry}>
              Tautan ini berlaku selama <strong style={{ color: "#e8eef6" }}>{expiryLabel}</strong>.
              Jika Anda tidak mendaftar, abaikan email ini.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* ── Fallback link ──────────────────────────────────────────── */}
          <Section style={fallbackSection}>
            <Text style={fallbackLabel}>
              Tombol tidak berfungsi? Salin dan tempel tautan ini ke browser:
            </Text>
            <Link href={verifyUrl} style={fallbackLink}>
              {verifyUrl}
            </Link>
          </Section>

          <Hr style={divider} />

          {/* ── Footer ─────────────────────────────────────────────────── */}
          <Section style={footerSection}>
            <Text style={footerText}>
              Email ini dikirim oleh InForm secara otomatis. Mohon tidak membalas
              email ini.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} InForm · Platform AI Pengisian Formulir Digital Otomatis.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// ── Preview default props (shown in email dev server: npx email dev) ──────────
VerificationEmail.PreviewProps = {
  name:      "Budi Santoso",
  verifyUrl: "http://localhost:3000/api/auth/verify?token=preview_token_abc123",
} satisfies VerificationEmailProps;

// ── Styles ─────────────────────────────────────────────────────────────────────
// React Email uses inline styles — no CSS classes or variables.
// Colors mirror InForm's global.css tokens.

const body: React.CSSProperties = {
  backgroundColor: "#060d1a",
  fontFamily:      "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
  margin: 0,
  padding: "40px 0",
};

const container: React.CSSProperties = {
  backgroundColor: "#0c1828",
  border:          "1px solid #1a3050",
  borderRadius:    "16px",
  margin:          "0 auto",
  maxWidth:        "520px",
  overflow:        "hidden",
};

const header: React.CSSProperties = {
  backgroundColor: "#0a1520",
  borderBottom:    "1px solid #1a3050",
  padding:         "20px 32px",
};

const logoCell: React.CSSProperties = {
  backgroundColor: "#00d4c8",
  borderRadius:    "10px",
  width:           "38px",
  height:          "38px",
  textAlign:       "center",
  verticalAlign:   "middle",
};

const logoText: React.CSSProperties = {
  color:       "#fff",
  fontSize:    "14px",
  fontWeight:  "800",
  margin:      0,
  lineHeight:  "38px",
  letterSpacing: "0.5px",
};

const logoName: React.CSSProperties = {
  color:       "#e8eef6",
  fontSize:    "18px",
  fontWeight:  "700",
  margin:      0,
  lineHeight:  "38px",
};

const iconSection: React.CSSProperties = {
  padding: "36px 32px 0",
};

const iconRing: React.CSSProperties = {
  display:         "inline-block",
  width:           "68px",
  height:          "68px",
  backgroundColor: "rgba(0,212,200,0.08)",
  border:          "1px solid rgba(0,212,200,0.2)",
  borderRadius:    "50%",
  lineHeight:      "68px",
  textAlign:       "center",
  verticalAlign:   "middle",
};

const contentSection: React.CSSProperties = {
  padding: "24px 32px 32px",
};

const h1: React.CSSProperties = {
  color:         "#e8eef6",
  fontSize:      "22px",
  fontWeight:    "800",
  letterSpacing: "-0.3px",
  margin:        "0 0 16px",
  textAlign:     "center",
};

const greeting: React.CSSProperties = {
  color:      "#94afc8",
  fontSize:   "15px",
  lineHeight: "1.6",
  margin:     "0 0 12px",
};

const bodyText: React.CSSProperties = {
  color:      "#94afc8",
  fontSize:   "14px",
  lineHeight: "1.7",
  margin:     "0 0 28px",
};

const btnSection: React.CSSProperties = {
  textAlign: "center",
  margin:    "0 0 24px",
};

const btn: React.CSSProperties = {
  backgroundColor: "#00d4c8",
  borderRadius:    "12px",
  color:           "#060d1a",
  display:         "inline-block",
  fontSize:        "15px",
  fontWeight:      "700",
  padding:         "14px 32px",
  textDecoration:  "none",
  textAlign:       "center",
  letterSpacing:   "0.2px",
};

const expiry: React.CSSProperties = {
  color:      "#5a7a99",
  fontSize:   "13px",
  lineHeight: "1.6",
  margin:     "0",
  textAlign:  "center",
};

const divider: React.CSSProperties = {
  borderColor: "#1a3050",
  margin:      "0",
};

const fallbackSection: React.CSSProperties = {
  padding: "20px 32px",
};

const fallbackLabel: React.CSSProperties = {
  color:    "#5a7a99",
  fontSize: "12px",
  margin:   "0 0 8px",
};

const fallbackLink: React.CSSProperties = {
  color:          "#00d4c8",
  fontSize:       "12px",
  wordBreak:      "break-all",
  textDecoration: "underline",
};

const footerSection: React.CSSProperties = {
  padding: "20px 32px",
};

const footerText: React.CSSProperties = {
  color:     "#3a5570",
  fontSize:  "12px",
  margin:    "0 0 4px",
  textAlign: "center",
};