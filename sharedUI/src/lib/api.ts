// lib/api.ts
// Semua komunikasi ke Flask backend melalui Next.js rewrite proxy (/api/*)

import Cookies from "js-cookie";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatResponse {
  reply: string;
  model: string;
  tokens: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error: string | null;
}

export interface StatusResponse {
  status: "online" | "offline";
  models: string[];
  error?: string;
}

export interface ConfigResponse {
  lm_studio_base: string;
  chat_url: string;
  model: string;
  max_tokens: number;
  temperature: number;
}

// ── POST /api/chat ──────────────────────────────────────────
export async function sendChat(
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<ChatResponse> {
  console.log("\n[API.sendChat] CALLED");

  const token = Cookies.get("_auth_token");

  if (!messages || messages.length === 0) {
    return {
      reply: "Error: No messages to send",
      model: "error",
      tokens: {},
      error: "no_messages",
    };
  }

  const payload = {
    messages,
    ...(systemPrompt ? { system_prompt: systemPrompt } : {}),
  };

  // Gunakan AbortController untuk timeout (5 menit, agar tidak premature untuk model besar)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000);

  const start = Date.now();
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId); // Hapus timeout jika berhasil
    console.log("[API.sendChat] Response status:", res.status);

    // 1. CEK CONTENT TYPE (PENTING!)
    const contentType = res.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!res.ok) {
      // 502/503 bisa terjadi kalau Flask tidak menjalankan server (proxy Next.js menolak)
      if ([502, 503, 504].includes(res.status)) {
        return {
          reply: "Tidak dapat terhubung ke backend (Flask). Pastikan backend berjalan di http://127.0.0.1:5000 dan jalankan `python log/main.py`.",
          model: "error",
          tokens: {},
          error: "backend_unreachable",
        };
      }

      // Jika error 500 tapi isinya JSON (error dari Flask kita)
      if (isJson) {
        const errorData = await res.json();
        return {
          reply: errorData.reply || errorData.error || `Error ${res.status}`,
          model: "error",
          tokens: {},
          error: errorData.error || "server_json_error",
        };
      }
      
      // Jika error 500 dan isinya Teks (Internal Server Error mentah)
      const errorText = await res.text();
      console.error("[API.sendChat] Raw Error Text:", errorText);
      return {
        reply: "Mohon maaf server sedang bermasalah (Internal Server Error).",
        model: "error",
        tokens: {},
        error: "internal_server_error",
      };
    }

    // 2. PARSE HANYA JIKA JSON
    if (!isJson) {
      const text = await res.text();
      throw new Error(`Expected JSON but got ${contentType}. Isi: ${text.substring(0, 50)}`);
    }

    const data = await res.json();
    console.log("[API.sendChat] SUCCESS");
    return data;

  } catch (err: any) {
    clearTimeout(timeoutId);

    let errorMessage = err instanceof Error ? err.message : "Unknown error";

    if (err.name === "AbortError") {
      errorMessage = "Koneksi ke AI terputus karena terlalu lama (Timeout).";
    } else if (err.code === "ECONNRESET" || errorMessage === "socket hang up") {
      errorMessage = "Koneksi terputus (socket hang up) - backend menutup sebelum response selesai. Coba lagi; jika berulang, periksa timeout di Next.js dan LM Studio.";
    }

    console.error("[API.sendChat] EXCEPTION:", errorMessage);

    const dur = (Date.now() - start) / 1000;
    console.log(`[API.sendChat] Duration: ${dur.toFixed(2)}s`);

    return {
      reply: `⚠️ ${errorMessage}`,
      model: "error",
      tokens: {},
      error: "network_error",
    };
  }
}

// ── GET /api/status ─────────────────────────────────────────
export async function getStatus(): Promise<StatusResponse> {
  const res = await fetch("/api/flask/status", { cache: "no-store" });
  if (!res.ok) return { status: "offline", models: [] };
  return res.json();
}

// ── GET /api/models ─────────────────────────────────────────
export async function getModels(): Promise<string[]> {
  const res = await fetch("/api/flask/models", { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.models ?? [];
}

// ── GET /api/config ─────────────────────────────────────────
export async function getConfig(): Promise<ConfigResponse | null> {
  const res = await fetch("/api/flask/config", { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}