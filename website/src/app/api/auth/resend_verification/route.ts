// app/api/auth/resend-verification/route.ts
//
// POST /api/auth/resend-verification
// Called by WaitingView and ErrorView "Kirim Ulang Email" buttons.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendResendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body  = await req.json().catch(() => ({}));
    const email = (body.email as string | undefined)?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where:  { email },
      select: { id: true, name: true, emailVerified: true },
    });

    // Always return 200 — don't reveal whether the email exists
    if (!user || user.emailVerified) {
      return NextResponse.json({
        message: "Jika email terdaftar, tautan telah dikirim ulang",
      });
    }

    const verifyToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    await prisma.user.update({
      where: { id: user.id },
      data:  { verifyToken, tokenExpiry },
    });

    // Send via Resend + React Email
    await sendResendVerificationEmail(
      email,
      user.name ?? email,   // fall back to email if name is null
      verifyToken
    );

    return NextResponse.json({ message: "Email verifikasi telah dikirim ulang" });
  } catch (error) {
    console.error("[POST /api/auth/resend-verification]", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}