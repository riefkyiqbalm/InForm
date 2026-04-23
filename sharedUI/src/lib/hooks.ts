/**
 * lib/hooks.ts
 * Custom React hooks — reusable across all components.
 *
 * FIX: `import * as React from "react"` was at the BOTTOM of the file.
 * Every useState call above it (useDebounce, useInViewport, useCopyToClipboard,
 * useLocalStorage, useIsMounted, useAsync) referenced React before it was
 * imported, causing "React is not defined" at runtime starting at line 109.
 * Moved import to the top and switched to named imports to avoid the `React.`
 * prefix entirely — cleaner and impossible to have the same ordering bug.
 */

"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type RefObject,
} from "react";

// ── useClickOutside ───────────────────────────────────────────────────────────

export function useClickOutside(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [callback]);

  return ref;
}

// ── useDebounce ───────────────────────────────────────────────────────────────

export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// ── useThrottle ───────────────────────────────────────────────────────────────

export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay = 500
) {
  const lastRun = useRef(Date.now());

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    },
    [callback, delay]
  );
}

// ── useInViewport ─────────────────────────────────────────────────────────────

export function useInViewport(ref: RefObject<HTMLElement>): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return isVisible;
}

// ── usePrevious ───────────────────────────────────────────────────────────────

export function usePrevious<T>(value: T): T | undefined {
  // React 19 / @types/react v19: useRef requires an explicit initial value.
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => { ref.current = value; }, [value]);
  return ref.current;
}

// ── useCopyToClipboard ────────────────────────────────────────────────────────

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, []);

  return { copyToClipboard, copied };
}

// ── useLocalStorage ───────────────────────────────────────────────────────────

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item =
        typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (error) {
        console.error("Error writing localStorage:", error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}

// ── useIsMounted ──────────────────────────────────────────────────────────────

export function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);
  return isMounted;
}

// ── useAsync ──────────────────────────────────────────────────────────────────

export function useAsync<T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [data, setData]     = useState<T | null>(null);
  const [error, setError]   = useState<E | null>(null);

  const execute = useCallback(async () => {
    setStatus("pending");
    setData(null);
    setError(null);
    try {
      const response = await asyncFunction();
      setData(response);
      setStatus("success");
      return response;
    } catch (err) {
      setError(err as E);
      setStatus("error");
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) execute();
  }, [execute, immediate]);

  return { execute, status, data, error };
}