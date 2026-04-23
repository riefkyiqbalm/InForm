/**
 * lib/db.ts
 * Server-side database helpers used by API routes.
 * All functions use the shared prisma singleton from lib/prisma.ts.
 */

import { prisma } from "./prisma";

// ── deleteSessionById ─────────────────────────────────────────────────────────
// Deletes a single ChatSession.
// Messages are deleted automatically by Postgres via the onDelete: Cascade
// constraint defined in schema.prisma — no manual message deletion needed.
//
// Returns the nextSessionId for the same user so the caller can redirect:
//   - nextSessionId: string  → redirect to /chat/:nextSessionId
//   - nextSessionId: null    → no sessions remain, redirect to /chat/:userId

export async function deleteSessionById(
  sessionId: string,
  userId: string
): Promise<{ deletedId: string; nextSessionId: string | null }> {
  if (!sessionId || typeof sessionId !== "string") {
    throw new Error("Invalid session ID");
  }
  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid user ID");
  }

  await prisma.chatSession.delete({ where: { id: sessionId } });

  // Find the most-recently-updated session still belonging to this user
  const next = await prisma.chatSession.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  return { deletedId: sessionId, nextSessionId: next?.id ?? null };
}

// ── deleteSessionsByIds ───────────────────────────────────────────────────────
export async function deleteSessionsByIds(
  sessionIds: string[]
): Promise<{ count: number }> {
  if (!Array.isArray(sessionIds) || sessionIds.length === 0) {
    throw new Error("Invalid session IDs array");
  }
  return prisma.chatSession.deleteMany({
    where: { id: { in: sessionIds } },
  });
}

// ── deleteSessionsByUserId ────────────────────────────────────────────────────
export async function deleteSessionsByUserId(
  userId: string
): Promise<{ count: number }> {
  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid user ID");
  }
  return prisma.chatSession.deleteMany({ where: { userId } });
}