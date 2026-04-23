import React, { useMemo } from "react";

interface PasswordStrengthProps {
  score: number; // 0–4
}

export function PasswordStrength({ score }: PasswordStrengthProps) {
  const info = useMemo(() => {
    const levels = [
      { w: "0%",   c: "transparent", t: "" },
      { w: "25%",  c: "#ff4d6d",     t: "Lemah" },
      { w: "50%",  c: "#f5c842",     t: "Cukup" },
      { w: "75%",  c: "#00d4c8",     t: "Kuat" },
      { w: "100%", c: "#3dffa0",     t: "Sangat Kuat" },
    ];
    return levels[score] ?? levels[0];
  }, [score]);

  return (
    <div style={S.container}>
      <div
        style={{
          ...S.bar,
          width: info.w,
          background: info.c,
        }}
      />
      {info.t && (
        <div style={{ ...S.text, color: info.c }}>{info.t}</div>
      )}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  container: { marginTop: "8px" },
  bar: {
    height: "4px",
    borderRadius: "2px",
    transition: "0.3s all",
  },
  text: {
    fontSize: "10px",
    textAlign: "right",
    marginTop: "4px",
  },
}