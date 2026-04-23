/**
 * Shared suggestion prompts and default chat suggestions
 * Used in DefaultPrompt component and other suggestion displays
 */
import {ICONS, type IconType} from "./icon";

export interface Suggestion {
  id?: string; // Optional, karena beberapa suggestion mungkin tidak butuh ID unik
  title?: string; // Optional, bisa hanya label saja
  subtitle?: string; // Optional, untuk deskripsi singkat
  icon: IconType; // Bisa menggunakan ikon dari constants
  prompt: string;
}

/**
 * Default chat suggestions/prompts shown in welcome screen
 */
export const DEFAULT_SUGGESTIONS: Suggestion[] = [
  {
    id: "1",
    title: "Foto Makanan",
    subtitle: "Analisis Dokumen atau Makanan lewat foto dan dokumen.",
    icon: 'white-camera',
    prompt: "Tolong bantu saya menganalisis menu makanan saya dan hasil pengecekan hegenitas dapur saya.",
  },
  {
    id: "2",
    title: "Draft Pengajuan",
    subtitle: "Pembuatan Template Surat Pengajuan.",
    icon:'white-camera',
    prompt: "Buatkan draft surat pengajuan pengecekan dapur ke dinas dan buatkan draft laporan keuangan untuk pengajuan modal dapur.",
  },
  {
    id: "3",
    title: "Analisis AKG",
    subtitle: "Pembuatan Menu.",
    icon: 'white-camera',
    prompt: "Buatkan menu dan resep yang memenuhi standard Kemenkes RI",
  },
  {
    id: "4",
    title: "Pengecekan Dokumen",
    subtitle: "Pengecekan Dokumen Untuk Verifikasi Vendor.",
    icon: 'white-building',
    prompt: "Cek dokumen yang telah diupload apakah telah mememnuhi persayaratan perizinan.",
  },
];

/**
 * Alternative welcome suggestions for authenticated users
 */
export const AUTH_SUGGESTIONS: Suggestion[] = [
  {
    icon: 'white-new-chat',
    title: "Start New Chat",
    prompt: "Buat sesi chat baru",
  },
  {
    icon: 'white-search',
    title: "View History",
    prompt: "Tampilkan riwayat chat",
  },
  {
    icon: 'white-gear',
    title: "Settings",
    prompt: "Buka pengaturan",
  },
];

/**
 * Quick action suggestions
 */
export const QUICK_ACTIONS: Suggestion[] = [
  {
    icon: 'white-search',
    title: "Search",
    prompt: "Cari dalam chat history",
  },
  {
    icon: 'white-pencil',
    title: "Edit",
    prompt: "Edit pesan terakhir",
  },
  {
    icon: 'white-pin',
    title: "Pin",
    prompt: "Pin pesan penting",
  },
  {
    icon: 'white-share',
    title: "Share",
    prompt: "Bagikan chat",
  },
];

/**
 * Example prompts for different use cases
 */
export const EXAMPLE_PROMPTS = {
  nutrition: [
    "Berapa kebutuhan kalori harian saya?",
    "Makanan apa yang kaya akan protein?",
    "Bagaimana cara mengurangi gula dalam diet?",
    "Apa itu vitamin dan mineral esensial?",
  ],
  health: [
    "Apa manfaat olahraga teratur?",
    "Berapa jam tidur yang ideal?",
    "Cara menjaga kesehatan mental?",
    "Bagaimana cara meningkatkan imunitas?",
  ],
  menu: [
    "Beri saya ide menu sehat seminggu",
    "Resep makanan tinggi protein rendah kalori",
    "Menu diet seimbang untuk keluarga",
    "Makanan lezat dan bergizi untuk anak",
  ],
  tracking: [
    "Bagaimana cara menghitung kalori?",
    "Berapa berat badan ideal saya?",
    "Bagaimana progress tersimpan?",
    "Apa rekomendasi berdasarkan tracking saya?",
  ],
};

/**
 * Error message suggestions (responses when system encounters errors)
 */
export const ERROR_SUGGESTIONS: Suggestion[] = [
  {
    icon: 'white-refresh',
    title: "Retry",
    prompt: "Coba lagi",
  },
  {
    icon: 'white-home',
    title: "Start Over",
    prompt: "Mulai dari awal",
  },
  {
    icon: 'white-help',
    title: "Get Help",
    prompt: "Dapatkan bantuan",
  },
];

/**
 * Onboarding suggestions for new users
 */
export const ONBOARDING_SUGGESTIONS: Suggestion[] = [
  {
    icon: 'white-hand-shake',
    title: "Berkenalan",
    prompt: "Halo, saya pengguna baru",
  },
  {
    icon: 'white-help',
    title: "Bantuan",
    prompt: "Bagaimana cara menggunakan BG-AI?",
  },
  {
    icon: 'white-document',
    title: "Tutorial",
    prompt: "Tunjukkan tutorial lengkap",
  },
];

/**
 * Search suggestions (autocomplete suggestions for search)
 */
export const SEARCH_SUGGESTIONS = [
  "Kalori",
  "Protein",
  "Nutrisi",
  "Diet sehat",
  "Makanan bergizi",
  "Resep",
  "Kesehatan",
  "Olahraga",
  "Vitamin",
  "Mineral",
];

/**
 * Get suggestions by category
 */
export function getSuggestionsByCategory(
  category: "nutrition" | "health" | "menu" | "tracking"
): string[] {
  return EXAMPLE_PROMPTS[category];
}

/**
 * Get a random suggestion from a list
 */
export function getRandomSuggestion(suggestions: Suggestion[]): Suggestion {
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

/**
 * Filter suggestions by search query
 */
export function filterSuggestions(
  suggestions: Suggestion[],
  query: string
): Suggestion[] {
  const lowerQuery = query.toLowerCase();
  return suggestions.filter(
    (s) =>
      s.title?.toLowerCase().includes(lowerQuery) ||
      s.prompt.toLowerCase().includes(lowerQuery) ||
      s.subtitle?.toLowerCase().includes(lowerQuery)
  );
}
