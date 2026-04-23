// app/api/assessment/route.ts
// Mengelola penyimpanan hasil auto-fill untuk evaluasi dan pembangunan dataset.

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

/**
 * Helper untuk mengambil userId dari header Authorization
 */
function getUser(req: Request) {
  const auth = req.headers.get("authorization")
  return auth?.startsWith("Bearer ") ? getUserFromToken(auth.slice(7)) : null
}

export async function POST(req: Request) {
  const userId = getUser(req)
  if (!userId) {
    return NextResponse.json({ error: "Akses tidak sah" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as {
    documentId?:     string
    targetDomain?:   string
    detectedSchema?: unknown
    extractedData?:  unknown
    missingFields?:  unknown
    score?:          number
  }

  /**
   * FIX LOGIC: Membersihkan documentId.
   * Karena di frontend AttachButton menggunakan format "originalId-timestamp",
   * kita harus mengambil bagian depannya saja agar sesuai dengan ID di database Prisma.
   */
  const rawId = body.documentId ?? "";
  const cleanDocumentId = rawId.includes("-") ? rawId.split("-")[0] : rawId;

  try {
    const sub = await prisma.submission.create({
      data: {
        // Gunakan ID yang sudah dibersihkan untuk menghindari error P2003
        documentId:     cleanDocumentId, 
        targetDomain:   body.targetDomain  ?? "",
        detectedSchema: (body.detectedSchema ?? []) as any,
        extractedData:  (body.extractedData  ?? {}) as any,
        missingFields:  (body.missingFields  ?? []) as any,
        status:         (body.score ?? 0) >= 0.8 ? "COMPLETED" : "INCOMPLETE",
      },
      select: { id: true },
    })

    return NextResponse.json({ assessmentId: sub.id }, { status: 201 })
  } catch (error: any) {
    console.error("Prisma Error in Assessment:", error);
    
    // Memberikan pesan error yang lebih spesifik jika relasi gagal
    if (error.code === 'P2003') {
      return NextResponse.json({ 
        error: "Gagal menyimpan: Dokumen referensi tidak ditemukan di database." 
      }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const userId = getUser(req)
  if (!userId) {
    return NextResponse.json({ error: "Akses tidak sah" }, { status: 401 })
  }

  try {
    const subs = await prisma.submission.findMany({
      where: { 
        // Pastikan relasi dokumen milik user yang sedang login
        document: { userId } 
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { 
        id: true, 
        targetDomain: true, 
        status: true, 
        createdAt: true, 
        extractedData: true, 
        missingFields: true 
      },
    })

    return NextResponse.json({ assessments: subs })
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data assessment" }, { status: 500 })
  }
}