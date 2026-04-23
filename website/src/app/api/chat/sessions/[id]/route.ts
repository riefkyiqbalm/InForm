// app/api/chat/sessions/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

// Next.js 15: params must be a Promise
type Params = { params: Promise<{ id: string }> };

async function authorise(req: Request, sessionId: string) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return { error: "Akses tidak sah", status: 401 };

  const userId = getUserFromToken(authHeader.substring(7));
  if (!userId) return { error: "Token tidak valid", status: 401 };

  const session = await prisma.chatSession.findUnique({
    where:  { id: sessionId },
    select: { id: true, userId: true, pinnedAt: true },
  });

  if (!session) return { error: "Sesi tidak ditemukan", status: 404 };
  if (session.userId !== userId) return { error: "Akses tidak sah", status: 403 };

  return { userId, session };
}

// ── GET — single session with messages ───────────────────────────────────────
export async function GET(req: Request, { params }: Params) {
  try {
    // Next.js 15: await params
    const { id: sessionId } = await params;

    const auth = await authorise(req, sessionId);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const session = await prisma.chatSession.findUnique({
      where:  { id: sessionId },
      select: {
        id:        true,
        title:     true,
        pinnedAt:  true,
        createdAt: true,
        updatedAt: true,
        messages: {
          orderBy: { createdAt: "asc" },
          select:  { id: true, content: true, role: true, createdAt: true },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 404 });
    }

    const mapped = {
      ...session,
      messages: session.messages.map((m) => ({
        id:        m.id,
        sessionId: sessionId,
        role:      m.role,
        text:      m.content,
        createdAt: m.createdAt,
      })),
    };

    return NextResponse.json({ session: mapped });
  } catch (error) {
    console.error("[GET /api/chat/sessions/:id]", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// ── PATCH — rename or pin/unpin ───────────────────────────────────────────────
export async function PATCH(req: Request, { params }: Params) {
  try {
    // Next.js 15: await params
    const { id: sessionId } = await params;

    const auth = await authorise(req, sessionId);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({})) as {
      title?: string;
      action?: "pin" | "unpin";
    };

    // ── Rename ──────────────────────────────────────────────────────────────
    if (body.title !== undefined) {
      const trimmed = body.title.trim();
      if (!trimmed) {
        return NextResponse.json({ error: "Judul tidak boleh kosong" }, { status: 400 });
      }

      const updated = await prisma.chatSession.update({
        where:  { id: sessionId },
        data:   { title: trimmed },
        select: { id: true, title: true, pinnedAt: true, updatedAt: true },
      });

      return NextResponse.json({ session: updated });
    }

    // ── Pin / Unpin ──────────────────────────────────────────────────────────
    if (body.action === "pin" || body.action === "unpin") {
      const newPinnedAt = auth.session.pinnedAt ? null : new Date();

      const updated = await prisma.chatSession.update({
        where:  { id: sessionId },
        data:   { pinnedAt: newPinnedAt },
        select: { id: true, title: true, pinnedAt: true, updatedAt: true },
      });

      return NextResponse.json({ session: updated });
    }

    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("[PATCH /api/chat/sessions/:id]", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function DELETE(req: Request, { params }: Params) {
  try {
    // Next.js 15: await params
    const { id: sessionId } = await params;

    const auth = await authorise(req, sessionId);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await prisma.chatSession.delete({ where: { id: sessionId } });

    const next = await prisma.chatSession.findFirst({
      where:   { userId: auth.userId },
      orderBy: [{ pinnedAt: "desc" }, { updatedAt: "desc" }],
      select:  { id: true },
    });

    return NextResponse.json({ success: true, nextSessionId: next?.id ?? null });
  } catch (error) {
    console.error("[DELETE /api/chat/sessions/:id]", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}