// app/api/auth/change-password/route.ts
// POST /api/auth/change-password  { currentPassword, newPassword }
// Requires a valid Bearer token. Verifies current password before changing.
// Sends PasswordChangedEmail security alert after success.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { sendPasswordChangedEmail } from "@/lib/email";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    // ── Auth ───────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Akses tidak sah" }, { status: 401 });
    }

    const userId = getUserFromToken(authHeader.substring(7));
    if (!userId) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
    }

    // ── Parse body ─────────────────────────────────────────────────────────
    const { currentPassword, newPassword } = await req.json().catch(() => ({}));

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Kata sandi lama dan baru wajib diisi" },
        { status: 400 }
      );
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Kata sandi baru minimal 8 karakter" },
        { status: 400 }
      );
    }
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "Kata sandi baru tidak boleh sama dengan yang lama" },
        { status: 400 }
      );
    }

    // ── Verify current password ────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: { id: true, name: true, email: true, password: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    const isCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isCorrect) {
      return NextResponse.json({ error: "Kata sandi lama tidak sesuai" }, { status: 400 });
    }

    // ── Update password ────────────────────────────────────────────────────
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data:  { password: hashed },
    });

    // ── Security alert email ───────────────────────────────────────────────
    await sendPasswordChangedEmail(user.email, user.name ?? user.email);

    return NextResponse.json({ message: "Kata sandi berhasil diubah" });
  } catch (error) {
    console.error("[POST /api/auth/change-password]", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}