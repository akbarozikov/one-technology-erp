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
export type EasyRole = "seller" | "boss";

type AdminModeContextValue = {
  mode: AdminMode;
  setMode: (mode: AdminMode) => void;
  easyRole: EasyRole;
  setEasyRole: (role: EasyRole) => void;
  ready: boolean;
};

const STORAGE_KEY = "ot-erp-admin-mode";
const ROLE_STORAGE_KEY = "ot-erp-easy-role";
const AdminModeContext = createContext<AdminModeContextValue | null>(null);

export function AdminModeProvider({
  defaultMode = "easy",
  defaultEasyRole = "seller",
  children,
}: {
  defaultMode?: AdminMode;
  defaultEasyRole?: EasyRole;
  children: ReactNode;
}) {
  const [mode, setModeState] = useState<AdminMode>(defaultMode);
  const [easyRole, setEasyRoleState] = useState<EasyRole>(defaultEasyRole);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "easy" || stored === "advanced") {
        setModeState(stored);
      } else {
        setModeState(defaultMode);
      }
      const storedRole = window.localStorage.getItem(ROLE_STORAGE_KEY);
      if (storedRole === "seller" || storedRole === "boss") {
        setEasyRoleState(storedRole);
      } else {
        setEasyRoleState(defaultEasyRole);
      }
    } catch {
      setModeState(defaultMode);
      setEasyRoleState(defaultEasyRole);
    } finally {
      setReady(true);
    }
  }, [defaultEasyRole, defaultMode]);

  const setMode = useCallback((nextMode: AdminMode) => {
    setModeState(nextMode);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextMode);
    } catch {
      // Ignore persistence issues and keep the in-memory mode.
    }
  }, []);

  const setEasyRole = useCallback((nextRole: EasyRole) => {
    setEasyRoleState(nextRole);
    try {
      window.localStorage.setItem(ROLE_STORAGE_KEY, nextRole);
    } catch {
      // Ignore persistence issues and keep the in-memory role.
    }
  }, []);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      easyRole,
      setEasyRole,
      ready,
    }),
    [easyRole, mode, ready, setEasyRole, setMode]
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
