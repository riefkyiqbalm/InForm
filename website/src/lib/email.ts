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
import PasswordResetOauth from "@/emails/PasswordResetOauth";
import PasswordChanges        from "@/emails/PasswordChanges";
import EmailChanges from "@/emails/EmailChanges";

// ====== URL dan API =======
// Instantiated once per process — not per request.
const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM   = process.env.RESEND_FROM   ?? "InForm <noreply@aotamata.space>";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

// ======= 1. Mengirim Email Verifikasi =======
// Melakukan rendering VerificationEmail Komponen React ke HTML dan kirim via Resend.

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {

  const verifyUrl = `${BASE_URL}/api/auth/register?token=${token}`;
  // -- Fungsi render() merubah react komponen jadi HTML --
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
    // --- Menampilkan eror 500 ---
    throw new Error(`[Resend] ${error.message}`);
  }
}

// ===== Fungsi Untuk Mengirim Email Kembali (Kedua Kali) Jika Email Verifikasi tidak terkirim. ======

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

// ===== Fungsi Helper =====
async function send(to: string, subject: string, html: string) {
  const { error } = await resend.emails.send({ from: FROM, to: [to], subject, html });
  if (error) throw new Error(`[Resend] ${error.message}`);
}

// === 2. Perminataan Perubahan Password ===
export async function sendPasswordResetEmail(
  to: string, name: string, token: string
) {
  const resetUrl = `${BASE_URL}/new-password?token=${token}`;
  const html = await render(PasswordReset({ name, resetUrl }) as React.ReactElement);
  await send(to, "Reset Kata Sandi Akun InForm Anda", html);
}

// === 3. Konfirmasi Perubahan Password (Peringatan Keamanan) ===
export async function sendPasswordChangedEmail(
  to: string, name: string
) {
  const changedAt = new Date().toISOString();
  const html = await render(PasswordChanges({ name, changedAt }) as React.ReactElement);
  await send(to, "Kata Sandi Akun InForm Anda Telah Diubah", html);
}

// === 4. Perubahan Email — Mengirim Ke alamat email baru ===
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

// === 5. Set Password Untuk Akun Google Oauth ===
export async function setPassForOauth(
  to: string, name: string, token: string, isOauth: boolean
) {
  const resetUrl = `${BASE_URL}/new-password?token=${token}`;
  const html = await render(PasswordResetOauth({ name, resetUrl }) as React.ReactElement);
  await send(to, "Buat Kata Sandi Akun InForm Anda", html);
}