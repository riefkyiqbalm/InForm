// app/api/chat/sessions/route.ts
//
// GET  /api/chat/sessions  — list all sessions for the authenticated user
// POST /api/chat/sessions  — create a new session
//
// User identity comes entirely from the JWT token — there is no userId in the URL.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

function getUser(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return getUserFromToken(authHeader.substring(7));
}

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const userId = getUser(req);
    if (!userId) {
      return NextResponse.json({ error: "Akses tidak sah" }, { status: 401 });
    }

    const sessions = await prisma.chatSession.findMany({
      where:   { userId },
      orderBy: [{ pinnedAt: "desc" }, { updatedAt: "desc" }],
      select:  {
        id:        true,
        title:     true,
        pinnedAt:  true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("[GET /api/chat/sessions]", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const userId = getUser(req);
    if (!userId) {
      return NextResponse.json({ error: "Akses tidak sah" }, { status: 401 });
    }

    const body  = await req.json().catch(() => ({}));
    const title = (body.title as string | undefined)?.trim() || "New Chat";

    const session = await prisma.chatSession.create({
      data:   { userId, title },
      select: {
        id:        true,
        title:     true,
        pinnedAt:  true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/chat/sessions]", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}