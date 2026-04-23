'use client';

import React from 'react';
import Link from 'next/link';
import BackButton from '@/components/buttons/BackButton';

export default function NotFoundPage({ errorcode, type }: { errorcode: string, type?: string }) {
  return (
    <div style={S.root} className="bg-grid">
      <div style={{ ...S.orb, width: 400, height: 400, top: -80, right: '8%', background: 'rgba(0,212,200,.07)', animationDelay: '0s' }} />
      <div style={{ ...S.orb, width: 280, height: 280, bottom: 60, left: '4%', background: 'rgba(255,77,109,.07)', animationDelay: '-3s' }} />

      <div style={S.wrap} className="animate-fade-up">
        <div style={S.bigNum} aria-label="404">{errorcode}</div>
        <div style={S.errorCode}>
          <span style={S.line} />{type}<span style={S.line} />
        </div>
        <h1 style={S.h1}>Halaman Ini <span style={{ color: 'var(--teal)' }}>Tidak Ditemukan</span></h1>
        <p style={S.p}>URL yang Anda akses tidak ada di sistem BG-AI. Halaman mungkin telah dipindahkan, dihapus, atau memang tidak pernah ada.</p>

        <div style={S.actions}>
          <BackButton href="/chat" label="Kembali ke Chat" variant="primary" />
          <Link href="/login" style={S.btnGhost}>⏏ Halaman Login</Link>
        </div>

        <div style={S.suggestBox}>
          <div style={S.suggestTitle}>Mungkin yang Anda cari:</div>
          {[
            { href: '/', icon: '💬', label: 'Chat BG-AI — Analisis Gizi & Vendor MBG' },
            { href: '/login', icon: '🔑', label: 'Halaman Login & Registrasi' },
            { href: '/auth', icon: '👤', label: 'Pengaturan Akun' },
            { href: '/terms', icon: '⚖', label: 'Ketentuan Layanan' },
          ].map(l => (
            <Link key={l.href} href={l.href} style={S.suggestItem}>
              <span style={{ width: 28, textAlign: 'center' }}>{l.icon}</span>
              <span>{l.label}</span>
              <span style={{ marginLeft: 'auto', opacity: .4 }}>→</span>
            </Link>
          ))}
        </div>

        <div style={S.terminal}>
          <span style={{ color: 'var(--teal)' }}>BG-AI</span>
          <span style={{ color: 'var(--muted)' }}> ~$</span>
          <span> Error 404: route not found</span>
          <span style={S.cursor} />
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  root: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', position: 'relative', overflow: 'hidden' },
  orb: { position: 'fixed', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', animation: 'floatOrb 8s ease-in-out infinite' },
  wrap: { textAlign: 'center', maxWidth: 600, padding: '40px 24px', position: 'relative', zIndex: 10 },
  bigNum: { fontFamily: 'var(--font-mono)', fontSize: 'clamp(90px,18vw,150px)', fontWeight: 700, lineHeight: 1, marginBottom: 12, color: 'transparent', WebkitTextStroke: '2px var(--teal)', filter: 'drop-shadow(0 0 30px rgba(0,212,200,.35))', animation: 'glitch 4s infinite' },
  errorCode: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--teal)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 20 },
  line: { display: 'inline-block', width: 40, height: 1, background: 'var(--teal)', opacity: .4 },
  h1: { fontFamily: 'var(--font-head)', fontSize: 'clamp(22px,4vw,30px)', fontWeight: 800, marginBottom: 12 },
  p: { color: 'var(--muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 32, maxWidth: 420, margin: '0 auto 32px' },
  actions: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 },
  btnGhost: { padding: '12px 22px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' },
  suggestBox: { background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 22px', textAlign: 'left', marginBottom: 32 },
  suggestTitle: { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 12 },
  suggestItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.04)', color: 'var(--muted)', fontSize: 13, transition: 'color .15s', textDecoration: 'none' },
  terminal: { fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 },
  cursor: { display: 'inline-block', width: 8, height: 14, background: 'var(--teal)', animation: 'blink 1s infinite', marginLeft: 2 },
};
