// app/api/document/route.ts
// Document upload — persists user-uploaded files so they're available as
// AI context across sessions and devices.
//
// Storage strategy (in order of preference):
//   1. CLOUD_STORAGE — if CLOUD_STORAGE_URL is set, the binary is uploaded there
//      and the public URL is stored in Document.fileUrl.
//   2. CONTEXT_WINDOW — extracted text is stored in Document.rawText so the AI
//      can include it directly in the prompt context window. This is always
//      attempted; for binary files we delegate extraction to the Flask service.
//   3. VECTOR_DB — if VECTOR_INDEX_URL is set, the rawText is also indexed for
//      semantic retrieval (stub — wire to Pinecone/pgvector/Weaviate as needed).

import { NextResponse } from "next/server"
import { prisma }       from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

const TEXT_TYPES = ["text/plain", "text/markdown", "application/json", "text/csv"]
const FLASK_URL  = process.env.FLASK_URL ?? "http://localhost:5000"

async function extractText(file: File): Promise<string> {
  if (TEXT_TYPES.some((t) => file.type.startsWith(t))) {
    return file.text()
  }
  try {
    const buf  = await file.arrayBuffer()
    const blob = new Blob([buf], { type: file.type })
    const fd   = new FormData()
    fd.append("file", blob, file.name)
    const res = await fetch(`${FLASK_URL}/extract`, {
      method: "POST",
      body: fd,
      signal: AbortSignal.timeout(30_000),
    })
    if (!res.ok) return ""
    const d = await res.json() as { text?: string }
    return d.text ?? ""
  } catch {
    return ""
  }
}

async function uploadToCloud(file: File): Promise<string> {
  const cloudUrl = process.env.CLOUD_STORAGE_URL
  if (!cloudUrl) return ""
  try {
    const buf  = await file.arrayBuffer()
    const blob = new Blob([buf], { type: file.type })
    const fd   = new FormData()
    fd.append("file", blob, file.name)
    const res = await fetch(cloudUrl, {
      method: "POST",
      body: fd,
      signal: AbortSignal.timeout(30_000),
    })
    if (!res.ok) return ""
    const d = await res.json() as { url?: string }
    return d.url ?? ""
  } catch {
    return ""
  }
}

async function indexInVectorDB(documentId: string, userId: string, rawText: string): Promise<void> {
  const indexUrl = process.env.VECTOR_INDEX_URL
  if (!indexUrl || !rawText) return
  try {
    await fetch(indexUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId, userId, text: rawText }),
      signal: AbortSignal.timeout(15_000),
    })
  } catch { /* indexing is best-effort */ }
}

export async function POST(req: Request) {
  const auth   = req.headers.get("authorization")
  const token  = auth?.startsWith("Bearer ") ? auth.slice(7) : null
  const userId = token ? getUserFromToken(token) : null
  if (!userId) return NextResponse.json({ error: "Akses tidak sah" }, { status: 401 })

  const formData = await req.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: "Form data tidak valid" }, { status: 400 })

  const file = formData.get("file") as File | null
  if (!file)  return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 })

  const [rawText, fileUrl] = await Promise.all([extractText(file), uploadToCloud(file)])

  const doc = await prisma.document.create({
    data: {
      userId,
      fileName: file.name,
      fileType: file.type,
      fileUrl,
      rawText,
    },
    select: { id: true, fileName: true, createdAt: true },
  })

  // Best-effort vector indexing — runs in background, doesn't block response
  void indexInVectorDB(doc.id, userId, rawText)

  return NextResponse.json({ documentId: doc.id, fileName: doc.fileName }, { status: 201 })
}