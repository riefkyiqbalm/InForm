"use-client";
import React from "react";
import { ForgotPassword } from "@sharedUI/components/emails/ForgotPassword";
import Background from "@sharedUI/components/Background";
import { Card } from "@sharedUI/components/Cards";

export default function forgotPassword() {
  return (
    <div style={S.root}>
      <div style={S.container}>
      <Background />
        <Card>
          <div>
            <ForgotPassword />
          </div>
        </Card>
      </div>
    </div>
  );
}
const S: Record<string, React.CSSProperties> = {
  root: {
    background: "var(--bg)",
    color: "var(--text)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: "440px",
    padding: "20px",
    position: "relative",
    zIndex: 10,
    animation: "fadeUp 0.6s ease-out",
  }
}
