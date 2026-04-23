/**
 * Shared suggestion prompts and default chat suggestions
 * Used in DefaultPrompt component and other suggestion displays
 */
import {ICONS, type IconType} from "~lib/constants/icon";

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
    icon: ICONS['whiteCamera'],
    prompt: "Tolong bantu saya menganalisis menu makanan saya dan hasil pengecekan hegenitas dapur saya.",
  },
  {
    id: "2",
    title: "Draft Pengajuan",
    subtitle: "Pembuatan Template Surat Pengajuan.",
    icon: ICONS['whiteDocument'],
    prompt: "Buatkan draft surat pengajuan pengecekan dapur ke dinas dan buatkan draft laporan keuangan untuk pengajuan modal dapur.",
  },
  {
    id: "3",
    title: "Analisis AKG",
    subtitle: "Pembuatan Menu.",
    icon: ICONS['whiteBowl'],
    prompt: "Buatkan menu dan resep yang memenuhi standard Kemenkes RI",
  },
  {
    id: "4",
    title: "Pengecekan Dokumen",
    subtitle: "Pengecekan Dokumen Untuk Verifikasi Vendor.",
    icon: ICONS['whiteBuilding'],
    prompt: "Cek dokumen yang telah diupload apakah telah mememnuhi persayaratan perizinan.",
  },
];

/**
 * Alternative welcome suggestions for authenticated users
 */
export const AUTH_SUGGESTIONS: Suggestion[] = [
  {
    icon: ICONS['whiteNewChat'],
    title: "Start New Chat",
    prompt: "Buat sesi chat baru",
  },
  {
    icon: ICONS['whiteSearch'],
    title: "View History",
    prompt: "Tampilkan riwayat chat",
  },
  {
    icon: ICONS['whiteGear'],
    title: "Settings",
    prompt: "Buka pengaturan",
  },
];

/**
 * Quick action suggestions
 */
export const QUICK_ACTIONS: Suggestion[] = [
  {
    icon: ICONS['whiteSearch'],
    title: "Search",
    prompt: "Cari dalam chat history",
  },
  {
    icon: ICONS['whitePencil'],
    title: "Edit",
    prompt: "Edit pesan terakhir",
  },
  {
    icon: ICONS['whitePin'],
    title: "Pin",
    prompt: "Pin pesan penting",
  },
  {
    icon: ICONS['whiteShare'],
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
    icon: ICONS['whiteRefresh'],
    title: "Retry",
    prompt: "Coba lagi",
  },
  {
    icon: ICONS['whiteHome'],
    title: "Start Over",
    prompt: "Mulai dari awal",
  },
  {
    icon: ICONS['whiteHelp'],
    title: "Get Help",
    prompt: "Dapatkan bantuan",
  },
];

/**
 * Onboarding suggestions for new users
 */
export const ONBOARDING_SUGGESTIONS: Suggestion[] = [
  {
    icon: ICONS['whiteHandShake'],
    title: "Berkenalan",
    prompt: "Halo, saya pengguna baru",
  },
  {
    icon: ICONS['whiteHelp'],
    title: "Bantuan",
    prompt: "Bagaimana cara menggunakan BG-AI?",
  },
  {
    icon: ICONS['whiteDocument'],
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
