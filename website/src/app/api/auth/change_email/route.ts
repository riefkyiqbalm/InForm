import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import bcrypt from "bcrypt"; 
import crypto from "crypto";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { newEmail, password } = await req.json();

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    let userId: string;
    try {
      // 1. Verifikasi Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "rahasia") as any;
      
      // 2. DISESUAIKAN: Berdasarkan log Anda, kuncinya adalah 'userId'
      userId = decoded.userId || decoded.id || decoded.sub;

      if (!userId) {
        console.error("Payload Token:", decoded);
        return NextResponse.json({ error: "Format token tidak dikenali" }, { status: 401 });
      }
    } catch (err) {
      return NextResponse.json({ error: "Sesi kedaluwarsa" }, { status: 401 });
    }

    // 3. Cari User di Database
    const user = await prisma.user.findUnique({ 
      where: { id: userId } 
    });

    if (!user) {
      return NextResponse.json({ error: "Akun tidak ditemukan di database" }, { status: 404 });
    }

    // 4. Verifikasi Kata Sandi
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Kata sandi salah" }, { status: 401 });
    }

    // 5. Generate Token Verifikasi Baru
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 Jam

    // 6. Simpan ke database sebagai email tertunda (pendingEmail)
    await prisma.user.update({
      where: { id: userId },
      data: {
        pendingEmail: newEmail,
        verifyToken: verifyToken,
        tokenExpiry: tokenExpiry,
      },
    });

    // 7. Kirim Email ke Alamat Baru
    try {
      await sendVerificationEmail(newEmail, user.name || "User", verifyToken);
    } catch (emailErr) {
      console.error("[EMAIL_FAILED]", emailErr);
      return NextResponse.json({ 
        message: "Profil diperbarui, namun gagal mengirim email verifikasi. Periksa konfigurasi Resend Anda." 
      }, { status: 200 });
    }

    return NextResponse.json({ 
      message: "Berhasil! Silakan cek email baru Anda untuk verifikasi." 
    }, { status: 200 });

  } catch (error: any) {
    console.error("[CHANGE_EMAIL_FATAL]", error);
    return NextResponse.json({ error: "Gagal memproses perubahan email" }, { status: 500 });
  }
}