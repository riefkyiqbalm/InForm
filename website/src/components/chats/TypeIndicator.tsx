'use client';

import React from 'react';

export default function TypingIndicator() {
  return (
    <div style={S.typingRow} className="animate-fade-in">
      <div style={S.typingAvatar}>🤖</div>
      <div style={S.typingBubble}>
        <span className="dot-blink" />
        <span className="dot-blink" style={{ animationDelay: '0.2s' }} />
        <span className="dot-blink" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  typingRow: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    maxWidth: 800,
    margin: '20px auto 0',
    width: '100%',
  },
  typingAvatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'var(--teal-dim)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
  },
  typingBubble: {
    background: 'var(--card)',
    padding: '12px 16px',
    borderRadius: '12px 12px 12px 4px',
    border: '1px solid var(--border)',
    display: 'flex',
    gap: 4,
  },
};
