// app/api/auth/forgot-password/route.ts
// POST /api/auth/forgot-password  { email }
// Generates a reset token, stores it, sends PasswordResetEmail via Resend.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail, setPassForOauth } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json().catch(() => ({}));
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where:  { email: email.trim().toLowerCase() },
      select: { id: true, name: true, email: true, emailVerified: true },
    });

    // Always 200 — never reveal whether the email exists
    if (!user) {
      return NextResponse.json({ message: "Jika email terdaftar, tautan reset telah dikirim" });
    }

    const resetToken       = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    if (!user.emailVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          verifyToken: resetToken,
          tokenExpiry: resetTokenExpiry,
        },
      });
       await setPassForOauth(
        user.email, 
        user.name ?? user.email, 
        resetToken,
        true // Flag isSetupPassword (Anda perlu update fungsi sendPasswordResetEmail di lib/email.ts untuk menerima param ini)
      );

    } else {await prisma.user.update({
      where: { id: user.id },
      data:  { resetToken, resetTokenExpiry },
    });

    await sendPasswordResetEmail(user.email, user.name ?? user.email, resetToken);
  }
    return NextResponse.json({ message: "Jika email terdaftar, tautan reset telah dikirim" });
  } catch (error) {
    console.error("[POST /api/auth/forgot-password]", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}