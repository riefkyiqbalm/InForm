// app/api/chat/sessions/[id]/messages/route.ts
// Updated: supports Vercel AI SDK multimodal via `attachments` field.
// When attachments (documentIds) are included, their text is fetched
// from DB and appended as context for the LLM.
//
// Install: npm install ai @ai-sdk/openai   (in your Next.js project)

import { NextResponse } from "next/server"
import { prisma }       from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

type Params = { params: Promise<{ id: string }> }

interface FlaskResponse {
  reply:     string
  model:     string
  tokens?:   Record<string, number>
  error:     string | null
  thread_id?: string
}

export async function POST(req: Request, { params }: Params) {
  const clientSignal = req.signal
  const { id: sessionId } = await params

  // ── Auth ───────────────────────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer "))
    return NextResponse.json({ error: "Akses tidak sah" }, { status: 401 })
  const userId = getUserFromToken(authHeader.substring(7))
  if (!userId)
    return NextResponse.json({ error: "Token tidak valid" }, { status: 401 })

  // ── Verify session ─────────────────────────────────────────────────────────
  const session = await prisma.chatSession.findUnique({
    where:  { id: sessionId },
    select: { id: true, userId: true, title: true },
  })
  if (!session) return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 404 })
  if (session.userId !== userId) return NextResponse.json({ error: "Akses tidak sah" }, { status: 403 })

  // ── Parse body ─────────────────────────────────────────────────────────────
  const body        = await req.json().catch(() => ({}))
  const userText    = (body.message as string | undefined)?.trim()
  if (!userText) return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 })

  // ── Multimodal attachments (Vercel AI SDK style) ───────────────────────────
  // Extension sends: { message: "...", attachments: [{ documentId, name }] }
  // We load rawText from DB and append as context.
  const attachments = (body.attachments ?? []) as { documentId: string; name: string }[]
  let attachmentContext = ""

  if (attachments.length > 0) {
    const docIds = attachments.map((a) => a.documentId).filter(Boolean)
    const docs   = await prisma.document.findMany({
      where:  { id: { in: docIds }, userId },
      select: { fileName: true, rawText: true },
    }).catch(() => [])

    if (docs.length > 0) {
      attachmentContext = "\n\n--- DOKUMEN TERLAMPIR ---\n" +
        docs.map((d) => `[${d.fileName}]:\n${(d.rawText ?? "").slice(0, 3000)}`).join("\n\n")
    }
  }

  // ── Save user message to DB ────────────────────────────────────────────────
  const userMessage = await prisma.message.create({
    data: { sessionId, content: userText, role: "USER" },
  })

  await updateSessionTitleIfDefault(sessionId, session.title, userText)

  // ── Call Flask / LangGraph ─────────────────────────────────────────────────
  const flaskBase   = process.env.FLASK_URL ?? "http://localhost:5000"
  const fullMessage = userText + attachmentContext

  let flaskData: FlaskResponse
  try {
    const flaskRes = await fetch(`${flaskBase}/api/chat`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        session_id: sessionId,
        thread_id:  sessionId,
        message:    fullMessage,
        messages:   [{ role: "user", content: fullMessage }],
      }),
      signal: AbortSignal.any
        ? AbortSignal.any([clientSignal, AbortSignal.timeout(300_000)])
        : clientSignal,
    })

    if (!flaskRes.ok) {
      const flaskErr = await flaskRes.json().catch(() => ({}))
      return NextResponse.json(
        { error: flaskErr.error ?? `Flask error ${flaskRes.status}` },
        { status: 502 }
      )
    }

    flaskData = await flaskRes.json() as FlaskResponse

  } catch (fetchErr) {
    const isAbort = fetchErr instanceof Error && (fetchErr.name === "AbortError" || clientSignal.aborted)
    if (isAbort) {
      return NextResponse.json(
        { aborted: true, userMessageId: userMessage.id, originalText: userText },
        { status: 200 }
      )
    }
    const msg = fetchErr instanceof Error ? fetchErr.message : "Flask unreachable"
    return NextResponse.json({ error: `Tidak dapat terhubung ke AI: ${msg}` }, { status: 502 })
  }

  // ── Save AI reply ──────────────────────────────────────────────────────────
  const aiText = flaskData.reply?.trim() ?? ""
  if (!aiText) {
    await prisma.message.delete({ where: { id: userMessage.id } }).catch(() => {})
    return NextResponse.json({ error: "AI tidak memberikan respons" }, { status: 502 })
  }

  const aiMessage = await prisma.message.create({
    data: { sessionId, content: aiText, role: "ASSISTANT" },
  })

  await prisma.chatSession.update({ where: { id: sessionId }, data: { updatedAt: new Date() } })

  return NextResponse.json({ userMessage, aiMessage })
}

async function updateSessionTitleIfDefault(sessionId: string, currentTitle: string|undefined, firstMessage: string) {
  if (currentTitle !== "New Chat") return
  const newTitle = firstMessage.length > 35 ? firstMessage.substring(0, 35).trim() + "…" : firstMessage
  await prisma.chatSession.update({ where: { id: sessionId }, data: { title: newTitle } })
}