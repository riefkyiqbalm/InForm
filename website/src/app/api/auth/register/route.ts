// app/api/auth/verify/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import bcrypt from "bcrypt"; // Gunakan bcryptjs untuk kompatibilitas lebih baik di Next.js
import crypto from "crypto";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

// ── GET — Validasi Link dari Email ──────────────────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${BASE_URL}/verify-email?error=invalid_token`);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { verifyToken: token },
    });

    if (!user) {
      console.error("[VERIFY_GET] Token tidak valid atau tidak ditemukan.");
      return NextResponse.redirect(`${BASE_URL}/verify-email?error=invalid_token`);
    }

    if (user.tokenExpiry && new Date() > user.tokenExpiry) {
      return NextResponse.redirect(`${BASE_URL}/verify-email?error=token_expired`);
    }

    // Tentukan email mana yang akan divalidasi
    const finalEmail = user.pendingEmail ?? user.email;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: finalEmail,
        emailVerified: new Date(),
        verifyToken: null,
        tokenExpiry: null,
        pendingEmail: null,
      },
    });

    console.log(`[VERIFY_GET] User ${finalEmail} berhasil diverifikasi.`);
    return NextResponse.redirect(`${BASE_URL}/verify-email?success=1`);
  } catch (error) {
    console.error("[VERIFY_GET_ERROR]", error);
    return NextResponse.redirect(`${BASE_URL}/verify-email?error=server_error`);
  }
}

// ── POST — Registrasi & Kirim Email ──────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, name } = body;

    if ( !email?.trim() || !password || !name?.trim() ) {
      return NextResponse.json(
        { error: "Nama, email, dan password wajib diisi" },
        { status: 400 }
      );
    }

    // 1. Cek User Existing
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing?.emailVerified) {
      return NextResponse.json(
        { error: "Email sudah terdaftar dan terverifikasi" },
        { status: 409 }
      );
    }

    // 2. Persiapan Data
    const hashed = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 jam

    // 3. Simpan ke Database (Update jika sudah ada tapi belum verif, atau Create baru)
    if (existing) {
      console.log(`[AUTH_POST] Update user belum terverifikasi: ${email}`);
      await prisma.user.update({
        where: { id: existing.id },
        data: { name: name.trim(), password: hashed, verifyToken, tokenExpiry },
      });
    } else {
      console.log(`[AUTH_POST] Membuat user baru: ${email}`);
      await prisma.user.create({
        data: {
          name: name.trim(),
          email,
          password: hashed,
          verifyToken,
          tokenExpiry,
        },
      });
    }

    // 4. Kirim Email Verifikasi
    // Bungkus dalam try-catch internal agar kita tahu jika pengiriman email gagal
    // namun data di database tetap aman.
    try {
      console.log(`[AUTH_POST] Mencoba mengirim email ke: ${email}`);
      await sendVerificationEmail(email, name.trim(), verifyToken);
    } catch (emailError) {
      console.error("[AUTH_POST_EMAIL_ERROR]", emailError);
      // Tetap kembalikan 201 karena user sudah tersimpan, tapi beri info email gagal
      return NextResponse.json(
        { message: "Akun dibuat, namun gagal mengirim email verifikasi. Silakan hubungi admin." },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { message: "Email verifikasi telah dikirim. Silakan cek inbox Anda." },
      { status: 201 }
    );
  } catch (error) {
    console.error("[AUTH_POST_SERVER_ERROR]", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}