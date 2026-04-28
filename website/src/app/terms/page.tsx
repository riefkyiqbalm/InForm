"use client";

import React from "react";
import Link from "next/link";
import AppHeader from "@/components/profiles/TopPanel";

export default function Terms() {
  return (
    <div style={S.root}>
      {/* <AppHeader title="InFormm" subtitle="Ketentuan Layanan" backHref="/chat" /> */}

      <main style={S.main}>
        <div style={S.container}>
          <div style={S.header}>
            <div style={S.icon}>⚖</div>
            <h1 style={S.h1}>Ketentuan Layanan</h1>
            <p style={S.lastUpdated}>Terakhir diperbarui: April 2026</p>
          </div>

          <div style={S.content}>
            <section style={S.section}>
              <h2 style={S.h2}>1. Penerimaan Syarat</h2>
              <p style={S.p}>
                Dengan mengakses dan menggunakan platform InFormm, Anda соглашаетесь untuk terikat oleh 
                ketentuan layanan ini. Jika Anda tidak setuju dengan salah satu ketentuan, 
                Anda tidak diperkenankan menggunakan layanan ini.
              </p>
            </section>

            <section style={S.section}>
              <h2 style={S.h2}>2. Deskripsi Layanan</h2>
              <p style={S.p}>
                InFormm adalah platform chatbot multimodal berbasis LLM (Large Language Model) yang 
                menyediakan layanan analisis dan konsultasi untuk keperluan administrasi dan perizinan IPAL 
                (Instalasi Pengolahan Air Limbah). Layanan ini menggunakan model AI Qwen3-4B yang dijalankan 
                secara lokal melalui LM Studio.
              </p>
              <ul style={S.ul}>
                <li>Analisis dokumen dan foto makanan</li>
                <li>Pembuatan draft pengajuan dan laporan</li>
                <li>Konsultasi standar AKG (Angka Kecukupan Gizi)</li>
                <li>Pengecekan kelengkapan dokumen vendor</li>
              </ul>
            </section>

            <section style={S.section}>
              <h2 style={S.h2}>3. Akun Pengguna</h2>
              <p style={S.p}>
                Untuk mengakses fitur tertentu, Anda harus membuat akun dengan InFormasi yang valid. 
                Anda bertanggung jawab untuk:
              </p>
              <ul style={S.ul}>
                <li>Menjaga kerahasiaan kata sandi akun Anda</li>
                <li>MengInFormasikan kami segera tentang penggunaan tidak sah</li>
                <li>Menggunakan layanan hanya untuk tujuan yang sah</li>
                <li>Tidak membagikan akun kepada orang lain</li>
              </ul>
            </section>

            <section style={S.section}>
              <h2 style={S.h2}>4. Penggunaan yang Dilarang</h2>
              <p style={S.p}>Anda tidak diperkenankan:</p>
              <ul style={S.ul}>
                <li>Menggunakan layanan untuk aktivitas ilegal atau tidak sah</li>
                <li>Mencoba mengakses sistem atau data pengguna lain</li>
                <li>Mengirim konten yang mengandung malware atau virus</li>
                <li>Melakukan spam atau pengiriman pesan massal</li>
                <li>Menggunakan bot atau script otomatis tanpa izin</li>
              </ul>
            </section>

            <section style={S.section}>
              <h2 style={S.h2}>5. Disclaimer AI</h2>
              <div style={S.warningBox}>
                <span style={S.warningIcon}>⚠</span>
                <div>
                  <strong>Perhatian Penting</strong>
                  <p style={{ margin: "4px 0 0", fontSize: "13px" }}>
                    Respons yang dihasilkan oleh AI bersifat InFormasi umum dan tidak dimaksudkan 
                    sebagai nasihat profesional. Sempre verifikasi InFormasi penting dengan sumber 
                    resmi dan konsultan yang kompeten.
                  </p>
                </div>
              </div>
            </section>

            <section style={S.section}>
              <h2 style={S.h2}>6. Privasi dan Keamanan Data</h2>
              <p style={S.p}>
                Data percakapan Anda disimpan secara lokal di browser dan di database server kami. 
                Kami berkomitmen untuk melindungi privasi Anda dengan:
              </p>
              <ul style={S.ul}>
                <li>Enkripsi data sensitif (kata sandi)</li>
                <li>Tidak membagikan data kepada pihak ketiga tanpa izin</li>
                <li>Pembatasan akses terhadap database</li>
                <li>Hak untuk menghapus data Anda upon request</li>
              </ul>
            </section>

            <section style={S.section}>
              <h2 style={S.h2}>7. Batasan Tanggung Jawab</h2>
              <p style={S.p}>
                InFormm dan tim developer tidak bertanggung jawab atas:
              </p>
              <ul style={S.ul}>
                <li>Kerugian langsung atau tidak langsung dari penggunaan layanan</li>
                <li>Kekurangan atau ketidakakuratan respons AI</li>
                <li>Gangguan teknis atau downtime server</li>
                <li>Penyalahgunaan layanan oleh pengguna</li>
              </ul>
            </section>

            <section style={S.section}>
              <h2 style={S.h2}>8. Perubahan Layanan</h2>
              <p style={S.p}>
                Kami berhak untuk memodifikasi, menangguhkan, atau menghentikan layanan 
                sewaktu-waktu dengan atau tanpa pemberitahuan. Kami juga dapat mengubah 
                ketentuan layanan ini kapan saja.
              </p>
            </section>

            <section style={S.section}>
              <h2 style={S.h2}>9. Hukum yang Berlaku</h2>
              <p style={S.p}>
                Ketentuan layanan ini diatur oleh hukum yang berlaku di Indonesia. 
                Segala perselisihan akan diselesaikan melalui negosiasi terlebih dahulu, 
                dan jika tidak berhasil, akan diajukan ke pengadilan yang berwenang.
              </p>
            </section>

            <section style={S.section}>
              <h2 style={S.h2}>10. Kontak</h2>
              <p style={S.p}>
                Untuk pertanyaan atau masalah terkait layanan ini, silakan hubungi kami melalui:
              </p>
              <div style={S.contactBox}>
                <p><strong>Email:</strong> support@bga-ai.id</p>
                <p><strong>Website:</strong> https://bga-ai.id</p>
              </div>
            </section>
          </div>

          <div style={S.footer}>
            <Link href="/chat" style={S.footerLink}>← Kembali ke Chat</Link>
            <span style={S.footerDot}>·</span>
            <Link href="/login" style={S.footerLink}>Halaman Login</Link>
            <span style={S.footerDot}>·</span>
            <Link href="/auth" style={S.footerLink}>Pengaturan Akun</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "var(--bg)",
    color: "var(--text)",
  },
  nav: {
    height: "60px",
    background: "var(--panel)",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none",
    color: "var(--text)",
  },
  logo: {
    width: "32px",
    height: "32px",
    background: "linear-gradient(135deg, var(--teal), #0070ff)",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: 700,
    color: "#fff",
  },
  brandText: {
    fontFamily: "var(--font-head)",
    fontSize: "16px",
    fontWeight: 800,
  },
  backBtn: {
    padding: "8px 16px",
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--muted)",
    fontSize: "13px",
    textDecoration: "none",
    transition: "all 0.2s",
  },
  main: {
    padding: "40px 24px 80px",
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "48px",
  },
  icon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  h1: {
    fontFamily: "var(--font-head)",
    fontSize: "32px",
    fontWeight: 800,
    marginBottom: "8px",
  },
  lastUpdated: {
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    color: "var(--muted)",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  section: {},
  h2: {
    fontFamily: "var(--font-head)",
    fontSize: "18px",
    fontWeight: 700,
    marginBottom: "12px",
    color: "var(--teal)",
  },
  p: {
    fontSize: "14px",
    lineHeight: 1.7,
    color: "var(--text)",
    opacity: 0.9,
  },
  ul: {
    marginLeft: "20px",
    marginTop: "8px",
  },
  warningBox: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    background: "rgba(245, 200, 66, 0.1)",
    border: "1px solid rgba(245, 200, 66, 0.3)",
    borderRadius: "12px",
    marginTop: "12px",
  },
  warningIcon: {
    fontSize: "20px",
    flexShrink: 0,
  },
  contactBox: {
    marginTop: "12px",
    padding: "16px",
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
  },
  footer: {
    marginTop: "64px",
    paddingTop: "24px",
    borderTop: "1px solid var(--border)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  footerLink: {
    color: "var(--teal)",
    fontSize: "13px",
    textDecoration: "none",
  },
  footerDot: {
    color: "var(--muted)",
  },
};
