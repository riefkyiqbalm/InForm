import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface LoginLinkEmailProps {
  name: string;
  loginUrl: string;
  expiryLabel?: string;
}

export default function LoginLinkEmail({
  name,
  loginUrl,
  expiryLabel = "30 menit",
}: LoginLinkEmailProps) {
  return (
    <Html lang="id" dir="ltr">
      <Head />
      <Preview>Tautan login InForm Anda — berlaku {expiryLabel}</Preview>

      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <table width="100%" cellPadding={0} cellSpacing={0}>
              <tr>
                <td align="center">
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

          <Section style={contentSection}>
            <Heading style={h1}>Masuk ke InForm</Heading>

            <Text style={greeting}>
              Halo, <strong style={{ color: "#e8eef6" }}>{name}</strong>!
            </Text>

            <Text style={bodyText}>
              Kami menerima permintaan login untuk akun{" "}
              <strong style={{ color: "#00d4c8" }}>InForm</strong> Anda.
              Klik tombol di bawah untuk masuk langsung — tanpa perlu kata sandi.
            </Text>

            <Section style={btnSection}>
              <Button style={btn} href={loginUrl}>
                → &nbsp; Masuk ke InForm
              </Button>
            </Section>

            <Text style={expiry}>
              Tautan ini berlaku selama{" "}
              <strong style={{ color: "#e8eef6" }}>{expiryLabel}</strong>.
              Jika Anda tidak meminta ini, abaikan email ini — akun Anda aman.
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={fallbackSection}>
            <Text style={fallbackLabel}>
              Tombol tidak berfungsi? Salin dan tempel tautan ini ke browser:
            </Text>
            <Link href={loginUrl} style={fallbackLink}>
              {loginUrl}
            </Link>
          </Section>

          <Hr style={divider} />

          <Section style={footerSection}>
            <Text style={footerText}>
              Email ini dikirim secara otomatis oleh InForm. Mohon tidak membalas.
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

LoginLinkEmail.PreviewProps = {
  name: "Budi Santoso",
  loginUrl: "http://localhost:3000/api/auth/verify-login-link?token=preview_token_abc123",
} satisfies LoginLinkEmailProps;

const body: React.CSSProperties = {
  backgroundColor: "#060d1a",
  fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
  margin: 0,
  padding: "40px 0",
};

const container: React.CSSProperties = {
  backgroundColor: "#0c1828",
  border: "1px solid #1a3050",
  borderRadius: "16px",
  margin: "0 auto",
  maxWidth: "520px",
  overflow: "hidden",
};

const header: React.CSSProperties = {
  backgroundColor: "#0a1520",
  borderBottom: "1px solid #1a3050",
  padding: "20px 32px",
};

const logoCell: React.CSSProperties = {
  backgroundColor: "#00d4c8",
  borderRadius: "10px",
  width: "38px",
  height: "38px",
  textAlign: "center",
  verticalAlign: "middle",
};

const logoText: React.CSSProperties = {
  color: "#fff",
  fontSize: "14px",
  fontWeight: "800",
  margin: 0,
  lineHeight: "38px",
  letterSpacing: "0.5px",
};

const logoName: React.CSSProperties = {
  color: "#e8eef6",
  fontSize: "18px",
  fontWeight: "700",
  margin: 0,
  lineHeight: "38px",
};

const contentSection: React.CSSProperties = {
  padding: "24px 32px 32px",
};

const h1: React.CSSProperties = {
  color: "#e8eef6",
  fontSize: "22px",
  fontWeight: "800",
  letterSpacing: "-0.3px",
  margin: "0 0 16px",
  textAlign: "center",
};

const greeting: React.CSSProperties = {
  color: "#94afc8",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 12px",
};

const bodyText: React.CSSProperties = {
  color: "#94afc8",
  fontSize: "14px",
  lineHeight: "1.7",
  margin: "0 0 28px",
};

const btnSection: React.CSSProperties = {
  textAlign: "center",
  margin: "0 0 24px",
};

const btn: React.CSSProperties = {
  backgroundColor: "#00d4c8",
  borderRadius: "12px",
  color: "#060d1a",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: "700",
  padding: "14px 32px",
  textDecoration: "none",
  textAlign: "center",
  letterSpacing: "0.2px",
};

const expiry: React.CSSProperties = {
  color: "#5a7a99",
  fontSize: "13px",
  lineHeight: "1.6",
  margin: "0",
  textAlign: "center",
};

const divider: React.CSSProperties = {
  borderColor: "#1a3050",
  margin: "0",
};

const fallbackSection: React.CSSProperties = {
  padding: "20px 32px",
};

const fallbackLabel: React.CSSProperties = {
  color: "#5a7a99",
  fontSize: "12px",
  margin: "0 0 8px",
};

const fallbackLink: React.CSSProperties = {
  color: "#00d4c8",
  fontSize: "12px",
  wordBreak: "break-all",
  textDecoration: "underline",
};

const footerSection: React.CSSProperties = {
  padding: "20px 32px",
};

const footerText: React.CSSProperties = {
  color: "#3a5570",
  fontSize: "12px",
  margin: "0 0 4px",
  textAlign: "center",
};
