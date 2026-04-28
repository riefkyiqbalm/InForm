"use client";

import { createContext, useContext } from "react";
import type { AuthContextType } from "../types";

// Membuat Context Netral
export const SharedAuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook tunggal yang akan digunakan oleh SELURUH komponen
export function useAuth() {
  const ctx = useContext(SharedAuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider (Website) or ListeningAuthProvider (Extension)");
  }
  return ctx;
}