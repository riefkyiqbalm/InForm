"use client";

import React from "react";
import { useChat } from "../../context/ChatContext";
import { useLMStatus } from "../../hooks/useLMStatus";
import StatusDot from "@/components/StatusDot";
import TopPanel from "@/components/profiles/TopPanel";
import { textStyles as T } from "@/lib/styles/text";
import { Card } from "@/components/Cards";



export default function DashboardPage() {
  const { sessions } = useChat();
  const status = useLMStatus();

  const totalMessages = sessions.reduce((count, s) => count + (s.messages?.length || 0), 0);

  return (
    <div style={S.root}>
      <TopPanel title="BG-AI" subtitle="Dashboard" backHref="/" />
      <main style={S.main}>
        <h1 style={T.h1}>Dashboard BG-AI</h1>

        <div style={S.grid}>
          <div style={S.card}>
            <h2 style={S.cardTitle}>Sesi</h2>
            <div style={S.statGrid}>
              <div style={S.stat}>
                <span style={S.statValue}>{sessions.length}</span>
                <span style={S.statLabel}>Total Sesi</span>
              </div>
              <div style={S.stat}>
                <span style={S.statValue}>{totalMessages}</span>
                <span style={S.statLabel}>Total Pesan</span>
              </div>
              <div style={S.stat}>
                <span style={S.statValue}>{sessions.length ? sessions[0].title.slice(0, 15) : "-"}</span>
                <span style={S.statLabel}>Sesi Aktif</span>
              </div>
            </div>
          </div>

          <div style={S.card}>
            <h2 style={S.cardTitle}>Status Sistem</h2>
            <div style={S.statusSection}>
              <StatusDot />
            </div>
            <div style={S.infoGrid}>
              <div style={S.infoItem}>
                <span style={S.infoLabel}>Model</span>
                <span style={S.infoValue}>{status.model}</span>
              </div>
              <div style={S.infoItem}>
                <span style={S.infoLabel}>Latency</span>
                <span style={S.infoValue}>{status.latencyMs} ms</span>
              </div>
              <div style={S.infoItem}>
                <span style={S.infoLabel}>Requests/min</span>
                <span style={S.infoValue}>{status.requestsPerMin}</span>
              </div>
            </div>
          </div>

          <div style={S.card}>
            <h2 style={S.cardTitle}>Analitik</h2>
            <p style={S.p}>
              Menampilkan data terbaru secara berkala.
            </p>
            <p style={S.lastUpdated}>
              Update terakhir: {new Date(status.lastChecked).toLocaleTimeString()}
            </p>
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
    padding: "32px 24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  h1: {
    fontFamily: "var(--font-head)",
    fontSize: "28px",
    fontWeight: 800,
    marginBottom: "24px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "var(--panel)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "24px",
  },
  cardTitle: {
    fontFamily: "var(--font-head)",
    fontSize: "16px",
    fontWeight: 700,
    marginBottom: "16px",
    color: "var(--teal)",
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    padding: "12px",
    background: "var(--card)",
    borderRadius: "10px",
  },
  statValue: {
    fontFamily: "var(--font-mono)",
    fontSize: "20px",
    fontWeight: 700,
    color: "var(--text)",
  },
  statLabel: {
    fontSize: "11px",
    color: "var(--muted)",
    textAlign: "center",
  },
  statusSection: {
    marginBottom: "16px",
    padding: "12px",
    background: "var(--card)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  infoGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 12px",
    background: "var(--card)",
    borderRadius: "8px",
  },
  infoLabel: {
    fontSize: "13px",
    color: "var(--muted)",
  },
  infoValue: {
    fontSize: "13px",
    fontFamily: "var(--font-mono)",
    color: "var(--text)",
  },
  p: {
    fontSize: "14px",
    color: "var(--muted)",
    marginBottom: "12px",
  },
  lastUpdated: {
    fontSize: "12px",
    fontFamily: "var(--font-mono)",
    color: "var(--muted)",
  },
};
