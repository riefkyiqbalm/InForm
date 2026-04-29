// app/api/auth/reset-password/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordChangedEmail } from "@/lib/email";
import bcrypt from "bcryptjs";

// ── GET — validate token (called on page load) ────────────────────────────────
export async function GET(req: Request) {
  
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token tidak ditemukan" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where:  { resetToken: token },
    select: { id: true, email: true, resetTokenExpiry: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Token tidak valid" }, { status: 400 });
  }
  if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
    return NextResponse.json({ error: "Token sudah kedaluwarsa" }, { status: 400 });
  }

  // Return masked email so the UI can show "Resetting password for b***@example.com"
  const [localPart, domain] = user.email.split("@");
  const maskedEmail = `${localPart.slice(0, 2)}${"*".repeat(Math.max(localPart.length - 2, 2))}@${domain}`;

  return NextResponse.json({ valid: true, maskedEmail });
}

// ── POST — set new password ───────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const { token, password } = await req.json().catch(() => ({}));

    if (!token || !password) {
      return NextResponse.json({ error: "Token dan password wajib diisi" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Kata sandi minimal 6 karakter" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where:  { resetToken: token },
      select: { id: true, name: true, email: true, resetTokenExpiry: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 400 });
    }
    if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
      return NextResponse.json({ error: "Token sudah kedaluwarsa" }, { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password:         hashed,
        resetToken:       null,
        resetTokenExpiry: null,
      },
    });

    // Security alert — let user know their password changed
    await sendPasswordChangedEmail(user.email, user.name ?? user.email);

    return NextResponse.json({ message: "Kata sandi berhasil diubah" });
  } catch (error) {
    console.error("[POST /api/auth/reset-password]", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}