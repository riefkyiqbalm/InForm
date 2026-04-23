// app/api/analyze/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

const FLASK_URL = process.env.FLASK_URL ?? "http://localhost:5000"

export async function POST(req: Request) {
    const auth = req.headers.get("authorization")
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null
    const userId = token ? getUserFromToken(token) : null
    if (!userId) return NextResponse.json({ error: "Akses tidak sah" }, { status: 401 })

    const body = await req.json().catch(() => ({})) as {
        schema?: unknown[]
        documentId?: string
        documentIds?: string[]
    }

    // 1. Ambil semua ID dari body
    const rawIds = [
        ...(body.documentIds ?? []),
        ...(body.documentId ? [body.documentId] : []),
    ].filter(Boolean)

    // 2. LOGIC FIX: Bersihkan ID dari timestamp agar sesuai dengan ID di Database
    // Jika ID berbentuk "id-timestamp", kita hanya ambil "id"
    const cleanDocIds = rawIds.map(id => id.includes('-') ? id.split('-')[0] : id)

    let combinedText = ""
    let documentNames: string[] = []

    if (cleanDocIds.length > 0) {
        // Cari dokumen berdasarkan ID asli
        const docs = await prisma.document.findMany({
            where: {
                id: { in: cleanDocIds },
                userId
            },
            select: { rawText: true, fileName: true },
        }).catch(() => [])

        combinedText = docs.map((d) => d.rawText ?? "").filter(Boolean).join("\n\n---\n\n")
        documentNames = docs.map((d) => d.fileName)
    }

    // 3. Panggil Flask /analyze
    try {
        const flaskRes = await fetch(`${FLASK_URL}/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                schema: body.schema ?? [],
                document_text: combinedText,
                document_name: documentNames.join(", "),
            }),
            signal: AbortSignal.timeout(60_000),
        })

        if (!flaskRes.ok) {
            const err = await flaskRes.json().catch(() => ({})) as { error?: string }
            return NextResponse.json({ error: err.error ?? `Flask error ${flaskRes.status}` }, { status: 502 })
        }

        const data = await flaskRes.json()
        return NextResponse.json(data)

    } catch (err) {
        const msg = err instanceof Error ? err.message : "Flask unreachable"
        return NextResponse.json({ error: `AI tidak dapat dihubungi: ${msg}` }, { status: 502 })
    }
}