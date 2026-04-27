// lib/email.ts
//
// Resend SDK singleton + typed email helpers.
// Used by API routes — never imported by client components.
//
// Setup:
//   1. npm install resend @react-email/components
//   2. Add RESEND_API_KEY=re_... to .env
//   3. Add RESEND_FROM=InForm <noreply@yourdomain.com> to .env
//      (domain must be verified in your Resend dashboard)

import { Resend } from "resend";
import { render } from "@react-email/components";
import VerificationEmail from "@/emails/VerificationEmail";
import PasswordReset          from "@/emails/PasswordReset";
import PasswordChanges        from "@/emails/PasswordChanges";
import EmailChanges from "@/emails/EmailChanges";

// ── Singleton ─────────────────────────────────────────────────────────────────
// Instantiated once per process — not per request.
const resend = new Resend(process.env.RESEND_API_KEY!);

const FROM   = process.env.RESEND_FROM   ?? "InForm <noreply@aotamata.space>";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

// ── sendVerificationEmail ─────────────────────────────────────────────────────
// Renders the VerificationEmail React component to HTML and sends it via Resend.
//
// @param to    - recipient email address
// @param name  - recipient display name (shown in greeting)
// @param token - raw verifyToken from the DB (NOT hashed)

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const verifyUrl = `${BASE_URL}/api/auth/register?token=${token}`;

  // render() converts the React component → plain HTML string
  const html = await render(
    VerificationEmail({ name, verifyUrl })
  );

  const { error } = await resend.emails.send({
    from:    FROM,
    to:      [to],
    subject: "Verifikasi Email Akun InForm Anda",
    html,
  });

  if (error) {
    // Throw so the calling route can catch and return a 500
    throw new Error(`[Resend] ${error.message}`);
  }
}

// ── sendResendVerificationEmail ───────────────────────────────────────────────
// Same as above but with a slightly different subject line for resend requests.

export async function sendResendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const verifyUrl = `${BASE_URL}/api/auth/resend_verification?token=${token}`;

  const html = await render(
    VerificationEmail({ name, verifyUrl, expiryLabel: "24 jam" })
  );

  const { error } = await resend.emails.send({
    from:    FROM,
    to:      [to],
    subject: "Kirim Ulang: Verifikasi Email Akun InForm Anda",
    html,
  });

  if (error) {
    throw new Error(`[Resend] ${error.message}`);
  }
}
// lib/email.ts
// Resend singleton + all email send helpers.
// Server-only — never imported by client components.
//
// Setup:
//   npm install resend @react-email/components
//   RESEND_API_KEY=re_...  in .env
//   RESEND_FROM=InForm <noreply@yourdomain.com>  in .env

// ── Helper ────────────────────────────────────────────────────────────────────
async function send(to: string, subject: string, html: string) {
  const { error } = await resend.emails.send({ from: FROM, to: [to], subject, html });
  if (error) throw new Error(`[Resend] ${error.message}`);
}

// ── 2. Password reset request ─────────────────────────────────────────────────
export async function sendPasswordResetEmail(
  to: string, name: string, token: string
) {
  const resetUrl = `${BASE_URL}/new-password?token=${token}`;
  const html = await render(PasswordReset({ name, resetUrl }) as React.ReactElement);
  await send(to, "Reset Kata Sandi Akun InForm Anda", html);
}

// ── 3. Password changed confirmation (security alert) ────────────────────────
export async function sendPasswordChangedEmail(
  to: string, name: string
) {
  const changedAt = new Date().toISOString();
  const html = await render(PasswordChanges({ name, changedAt }) as React.ReactElement);
  await send(to, "Kata Sandi Akun InForm Anda Telah Diubah", html);
}

// ── 4. Email change — sent to the NEW address ─────────────────────────────────
export async function sendEmailChangeVerification(
  toNewEmail: string, name: string, oldEmail: string, token: string
) {
  const verifyUrl = `${BASE_URL}/api/auth/change_email?token=${token}`;
  const html = await render(
    EmailChanges({
      name, newEmail: toNewEmail, oldEmail, verifyUrl,
    }) as React.ReactElement
  );
  await send(toNewEmail, "Konfirmasi Perubahan Email Akun InForm Anda", html);
}