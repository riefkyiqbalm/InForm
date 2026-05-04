import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendLoginLinkEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email as string | undefined)?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, emailVerified: true },
    });

    // Always return 200 — don't reveal whether the email exists or is verified
    if (!user || !user.emailVerified) {
      return NextResponse.json({ message: "Jika email terdaftar, tautan login telah dikirim" });
    }

    const loginToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: { verifyToken: loginToken, tokenExpiry },
    });

    await sendLoginLinkEmail(email, user.name ?? email, loginToken);

    return NextResponse.json({ message: "Tautan login telah dikirim ke email Anda" });
  } catch (error) {
    console.error("[POST /api/auth/send-login-link]", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
