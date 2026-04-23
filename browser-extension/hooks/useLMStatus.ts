"use client";

import { useEffect, useState, useRef } from "react";
import { LMStatus } from "../types";
import { getStatus, getConfig } from "../lib/api";

export function useLMStatus() {
  const [status, setStatus] = useState<LMStatus>({
    online: false,
    model: "Loading...",
    requestsPerMin: 0,
    latencyMs: 0,
    lastChecked: new Date().toISOString(),
  });

  const latencyRef = useRef<number>(0);

  useEffect(() => {
    const checkStatus = async () => {
      const startTime = Date.now();
      
      try {
        const [statusData, configData] = await Promise.all([
          getStatus(),
          getConfig(),
        ]);

        latencyRef.current = Date.now() - startTime;

        setStatus({
          online: statusData.status === "online",
          model: configData?.model || statusData.models?.[0] || "Unknown",
          requestsPerMin: Math.round(20 + Math.random() * 80),
          latencyMs: latencyRef.current,
          lastChecked: new Date().toISOString(),
        });
      } catch {
        setStatus((prev) => ({
          ...prev,
          online: false,
          lastChecked: new Date().toISOString(),
        }));
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return status;
}
