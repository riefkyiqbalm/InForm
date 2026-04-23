// app/api/documents/[id]/route.ts
// DELETE /api/documents/:id — removes document from DB (and S3 in production)

import { NextResponse } from "next/server"
import { prisma }       from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

type Params = { params: Promise<{ id: string }> }

function getUser(req: Request) {
  const auth = req.headers.get("authorization")
  return auth?.startsWith("Bearer ") ? getUserFromToken(auth.slice(7)) : null
}

export async function DELETE(req: Request, { params }: Params) {
  const userId = getUser(req)
  if (!userId) return NextResponse.json({ error: "Akses tidak sah" }, { status: 401 })

  const { id: documentId } = await params

  const doc = await prisma.document.findFirst({
    where:  { id: documentId, userId },
    select: { id: true, fileUrl: true },
  })
  if (!doc) return NextResponse.json({ error: "Dokumen tidak ditemukan" }, { status: 404 })

  // In production: delete from S3 here using doc.fileUrl
  // await deleteFromS3(doc.fileUrl)

  await prisma.document.delete({ where: { id: documentId } })
  return NextResponse.json({ ok: true })
}