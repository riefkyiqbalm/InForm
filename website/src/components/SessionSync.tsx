"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";

export function SessionSync() {
  const { data: session, status } = useSession();
  const { _syncSession } = useAuth();

  useEffect(() => {
    if (status === "loading") return;
    
    if (_syncSession) {
      _syncSession(session);
    }
  }, [session, status, _syncSession]);

  return null; // This component renders nothing
}

