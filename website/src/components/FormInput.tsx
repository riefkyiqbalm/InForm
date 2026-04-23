import React from "react";
import Icon from "./IconStyles";

interface FormInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnimationStart?: (e: React.AnimationEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  iconName: string;
  iconInvert?: boolean;
  rightSlot?: React.ReactNode;
}

export function FormInput({
  label,
  type = "text",
  value,
  onChange,
  onAnimationStart,
  placeholder,
  required,
  disabled,
  iconName,
  iconInvert = false,
  rightSlot,
}: FormInputProps) {
  return (
    <div style={S.inputGroup}>
      <label style={S.label}>{label}</label>
      <div style={S.inputWrap}>
        <span style={S.inputIcon}>
          {/* <Icon name={iconName} size={18} invert={iconInvert} /> */}
        </span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          onAnimationStart={onAnimationStart}
          placeholder={placeholder}
          style={S.input}
          required={required}
          disabled={disabled}
        />
        {rightSlot && <span style={S.rightSlot}>{rightSlot}</span>}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  inputGroup: { marginBottom: "20px" },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    color: "var(--muted)",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  inputWrap: { position: "relative" },
  inputIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--muted)",
    fontSize: "16px",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "12px 42px 12px 42px",
    color: "var(--text)",
    fontSize: "14px",
    outline: "none",
    transition: "0.2s",
    boxSizing: "border-box",
  },
  rightSlot: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    opacity: 0.7,
  },
};