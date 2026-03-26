"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { hasAnyPermission, hasPermission } from "@/lib/auth/permissions";
import type { AuthSession } from "@/lib/auth/shared";

type AuthContextValue = {
  session: AuthSession;
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: readonly string[]) => boolean;
  loggingOut: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  initialSession,
  children,
}: {
  initialSession: AuthSession;
  children: ReactNode;
}) {
  const router = useRouter();
  const [session] = useState<AuthSession>(initialSession);
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } finally {
      router.replace("/login");
      router.refresh();
      setLoggingOut(false);
    }
  }, [loggingOut, router]);

  const can = useCallback(
    (permission: string) => hasPermission(session.permissions, permission),
    [session.permissions]
  );

  const canAny = useCallback(
    (permissions: readonly string[]) => hasAnyPermission(session.permissions, permissions),
    [session.permissions]
  );

  const value = useMemo(
    () => ({
      session,
      permissions: session.permissions,
      hasPermission: can,
      hasAnyPermission: canAny,
      loggingOut,
      logout,
    }),
    [can, canAny, loggingOut, logout, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
