// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 1. Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Or "chrome-extension://your-extension-id"
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// 2. Add an OPTIONS handler for the preflight request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400, headers: corsHeaders } // Add headers to errors too
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401, headers: corsHeaders }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json({ 
        error: "Email belum diverifikasi. Silakan cek inbox Anda." 
      }, { status: 403, headers: corsHeaders });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        contact: user.contact ?? "",
        institution: user.institution ?? "",
        role: user.role ?? "",
        createdAt: user.createdAt,
      },
    }, { headers: corsHeaders }); // Add headers to success
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500, headers: corsHeaders }
    );
  }
}