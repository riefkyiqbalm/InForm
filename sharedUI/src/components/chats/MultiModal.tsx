'use-client'
import React from 'react';
import { type InputMode } from '@sharedUI/types';
import Icon from '../IconStyles';

interface MultiModalProps {
  inputMode: InputMode;
  onModeChange: (mode: InputMode) => void;
}

export default function MultiModal({ inputMode, onModeChange }: MultiModalProps) {
  return (
    <div style={S.modeRow}>
      {(['text', 'foto', 'video', 'document'] as InputMode[]).map((mode) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          style={{ ...S.modeBtn, ...(inputMode === mode ? S.modeBtnActive : {}) }}
          type="button"
        >
          {/* {mode === 'text' && <Icon name={mode} size= {20} ></Icon>} */}
          {mode === 'foto' && <Icon name={mode} size= {20} ></Icon>}
          {mode === 'video' && <Icon name={mode} size= {20} ></Icon>}
          {mode === 'document' && <Icon name={mode} size= {20} ></Icon>}
        </button>
      ))}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  modeRow: { display: 'flex', gap: 8, marginBottom: 12, justifyContent: 'center' },
  // modeBtn: { padding: '6px 12px', borderRadius: 20, fontSize: 12, background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', transition: '0.2s' },
  // modeBtnActive: { background: 'rgba(0, 212, 200, 0.1)', borderColor: 'var(--teal)', color: 'var(--teal)' },
  modeBtn: {
    // Jangan gunakan border: '1px solid #ccc'
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent', // Default warna border
    padding: '6px 12px',
    borderRadius:20,
    fontSize:12,
    background:'transparent',
    color: 'var(--teal)',
    cursor: 'pointer',
    transition: '0.2s'
  },
  modeBtnActive: {
    borderColor: 'var(--teal)', // Sekarang konsisten mengupdate borderColor
    background: 'rgba(0, 212, 200, 0.1)',
    color:'var(--teal)'
  }
};
