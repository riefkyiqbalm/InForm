// app/api/documents/upload/route.ts (Next.js)
// Accepts multipart file upload, extracts text, stores in DB.
// For production: upload binary to S3, store URL in DB.

import { NextResponse } from "next/server"
import { prisma }       from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

export async function POST(req: Request) {
  const auth   = req.headers.get("authorization")
  const token  = auth?.startsWith("Bearer ") ? auth.slice(7) : null
  const userId = token ? getUserFromToken(token) : null
  if (!userId) return NextResponse.json({ error: "Akses tidak sah" }, { status: 401 })

  const formData = await req.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: "Form data tidak valid" }, { status: 400 })

  const file = formData.get("file") as File | null
  if (!file)  return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 })

  // For text-based files, extract content directly
  // For PDF/DOCX in production: use a parser lib or send to Flask for extraction
  let rawText = ""
  const textTypes = ["text/plain","text/markdown","application/json","text/csv"]
  if (textTypes.some((t) => file.type.startsWith(t))) {
    rawText = await file.text()
  }
  // For PDF/DOCX: send to Flask /extract endpoint
  else {
    try {
      const buf  = await file.arrayBuffer()
      const blob = new Blob([buf], { type: file.type })
      const fd   = new FormData()
      fd.append("file", blob, file.name)
      const flaskRes = await fetch(`${process.env.FLASK_URL ?? "http://localhost:5000"}/extract`, {
        method: "POST", body: fd,
        signal: AbortSignal.timeout(30_000),
      })
      if (flaskRes.ok) {
        const d = await flaskRes.json() as { text?: string }
        rawText = d.text ?? ""
      }
    } catch { /* rawText stays empty; AI will note missing context */ }
  }

  // Save document record
  const doc = await prisma.document.create({
    data: {
      userId,
      fileName: file.name,
      fileType: file.type,
      fileUrl:  "",     // set to S3 URL in production
      rawText,
    },
    select: { id: true, fileName: true, createdAt: true },
  })

  return NextResponse.json({ documentId: doc.id, fileName: doc.fileName }, { status: 201 })
}