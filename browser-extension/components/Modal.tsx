import React, { useEffect, useRef, useState } from 'react';

// ── Shared style tokens ───────────────────────────────────────────────────────
const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const card: React.CSSProperties = {
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  padding: '24px',
  maxWidth: '400px',
  width: '90%',
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-head)',
  fontSize: '18px',
  fontWeight: 600,
  marginBottom: '16px',
  color: 'var(--text)',
};

const bodyText: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--muted)',
  marginBottom: '24px',
  lineHeight: '1.5',
};

const footer: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
};

function CancelButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all .15s',
        border: '1px solid var(--border)',
        background: disabled ? 'rgba(255,255,255,0.05)' : 'var(--card)',
        color: 'var(--text)',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      Batal
    </button>
  );
}

// ── Modal (delete confirm) ────────────────────────────────────────────────────
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  isConfirmDisabled?: boolean;
  isLoading?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  message,
  isConfirmDisabled = false,
  isLoading = false,
}: ModalProps) {
  if (!isOpen) return null;

  const disabled = isConfirmDisabled || isLoading;

  return (
    <div style={overlay}>
      <div style={card}>
        <div style={titleStyle}>Konfirmasi</div>
        <div style={bodyText}>{message}</div>
        <div style={footer}>
          <CancelButton onClick={onClose} disabled={isLoading} />
          <button
            onClick={onConfirm}
            disabled={disabled}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all .15s',
              border: 'none',
              background: disabled ? 'rgba(255,77,77,0.4)' : 'var(--red)',
              color: '#fff',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            {isLoading ? 'Menghapus...' : 'Oke'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── RenameModal ───────────────────────────────────────────────────────────────
interface RenameModalProps {
  isOpen: boolean;
  currentTitle: string;
  onClose: () => void;
  onConfirm: (newTitle: string) => void;
  isLoading?: boolean;
}

export function RenameModal({
  isOpen,
  currentTitle,
  onClose,
  onConfirm,
  isLoading = false,
}: RenameModalProps) {
  const [value, setValue] = useState(currentTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync value when modal opens with a (possibly different) currentTitle
  useEffect(() => {
    if (isOpen) {
      setValue(currentTitle);
      // Focus input after paint
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [isOpen, currentTitle]);

  if (!isOpen) return null;

  const trimmed = value.trim();
  const unchanged = trimmed === currentTitle.trim();
  const disabled = isLoading || !trimmed || unchanged;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled) onConfirm(trimmed);
    if (e.key === 'Escape') onClose();
  };

  return (
    <div style={overlay}>
      <div style={card}>
        <div style={titleStyle}>Ganti Nama Sesi</div>

        {/* Input — same visual style as login page inputs */}
        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--muted)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Nama Baru
          </label>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            maxLength={80}
            placeholder="Masukkan nama sesi"
            style={{
              width: '100%',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: 'var(--text)',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
              opacity: isLoading ? 0.6 : 1,
              transition: '0.2s',
            }}
          />
          {/* Character counter */}
          <div
            style={{
              textAlign: 'right',
              fontSize: '11px',
              color: 'var(--muted)',
              marginTop: '6px',
              opacity: 0.6,
            }}
          >
            {value.length}/80
          </div>
        </div>

        <div style={footer}>
          <CancelButton onClick={onClose} disabled={isLoading} />
          <button
            onClick={() => !disabled && onConfirm(trimmed)}
            disabled={disabled}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all .15s',
              border: 'none',
              // Use teal (same as main action buttons) instead of red
              background: disabled
                ? 'rgba(0,212,200,0.25)'
                : 'linear-gradient(135deg, var(--teal), #0080cc)',
              color: '#fff',
              opacity: disabled ? 0.6 : 1,
              boxShadow: disabled ? 'none' : '0 4px 12px rgba(0,212,200,0.2)',
            }}
          >
            {isLoading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}