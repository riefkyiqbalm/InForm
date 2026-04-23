import React from "react";
import Icon  from "@sharedUI/components/IconStyles";

interface ErrorBoxProps {
  message: string;
}

export function ErrorBox({ message }: ErrorBoxProps) {
  if (!message) return null;
  return (
    <div style={S.errorBox}>
      <Icon name="white-warning" size={18} invert={false} />
      {" "}{message}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  errorBox: {
    background: "rgba(255,77,109,.1)",
    border: "1px solid rgba(255,77,109,.3)",
    color: "#ff4d6d",
    borderRadius: "10px",
    padding: "12px",
    fontSize: "13px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
};