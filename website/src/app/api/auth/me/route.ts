// app/api/auth/me/route.ts
//
// ⚠️  If you see "Property 'contact' / 'institution' / 'role' does not exist"
// run `npx prisma generate` from the `ui/` directory. Your schema already has
// these fields — the generated client just needs to be refreshed.
//
// Schema facts that affect this file:
//   role  Role @default(USER)  — enum (USER | ASSISTANT), NOT a free-text field.
//         Users cannot self-assign a role via the profile form. It is returned
//         in GET but excluded from PUT. If you need to change a user's role,
//         do it in a separate admin-only endpoint.
//
//   contact     String?   — editable via PUT
//   institution String?   — editable via PUT

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Akses tidak sah" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const userId = getUserFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      id:          user.id,
      name:        user.name        ?? "",
      email:       user.email,
      image:       user.image       ?? "",
      contact:     user.contact     ?? "",
      institution: user.institution ?? "",
      role:        user.role,           // Role enum value: "USER" | "ASSISTANT"
      createdAt:   user.createdAt,
    });
  } catch (error) {
    console.error("[GET /api/auth/me]", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// ── PUT /api/auth/me ──────────────────────────────────────────────────────────
// Only allows updating profile fields — NOT role (that's an auth concern).
// ── PUT /api/auth/me ──────────────────────────────────────────────────────────
export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Akses tidak sah" }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const userId = getUserFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    // 1. ADD 'email' to the extracted fields
    const { name, email, contact, institution } = body as {
      name?: string;
      email?: string;
      contact?: string;
      institution?: string;
    };

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        // 2. Use '??' instead of '||' to allow empty strings if necessary, 
        // or just pass the value directly if it exists.
        ...(name !== undefined && { name }), 
        ...(email !== undefined && { email }), // Now email will update
        ...(contact !== undefined && { contact: contact || null }),
        ...(institution !== undefined && { institution: institution || null }),
      },
    });

    return NextResponse.json({
      id:          updated.id,
      name:        updated.name ?? "",
      email:       updated.email,
      image:       updated.image ?? "",
      contact:     updated.contact ?? "",
      institution: updated.institution ?? "",
      role:        updated.role,
      createdAt:   updated.createdAt,
    });
  } catch (error: any) {
    // 3. Handle Unique Constraint Error (if email is already taken)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Email sudah digunakan" }, { status: 400 });
    }
    console.error("[PUT /api/auth/me]", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}