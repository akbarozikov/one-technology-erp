"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AdminMode = "easy" | "advanced";

type AdminModeContextValue = {
  mode: AdminMode;
  setMode: (mode: AdminMode) => void;
  ready: boolean;
};

const STORAGE_KEY = "ot-erp-admin-mode";
const AdminModeContext = createContext<AdminModeContextValue | null>(null);

export function AdminModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AdminMode>("easy");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "easy" || stored === "advanced") {
        setModeState(stored);
      }
    } catch {
      // Ignore localStorage issues and keep the default mode.
    } finally {
      setReady(true);
    }
  }, []);

  const setMode = useCallback((nextMode: AdminMode) => {
    setModeState(nextMode);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextMode);
    } catch {
      // Ignore persistence issues and keep the in-memory mode.
    }
  }, []);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      ready,
    }),
    [mode, ready, setMode]
  );

  return <AdminModeContext.Provider value={value}>{children}</AdminModeContext.Provider>;
}

export function useAdminMode(): AdminModeContextValue {
  const context = useContext(AdminModeContext);
  if (!context) {
    throw new Error("useAdminMode must be used within an AdminModeProvider");
  }
  return context;
}
