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
import {
  clearDocsAccessUnlocked,
  isDocsUnlockConfigured,
  persistDocsAccessUnlocked,
  readDocsAccessUnlocked,
  verifyDocsAccessCode,
} from "@/lib/docs-access";

type DocsAccessContextValue = {
  ready: boolean;
  unlocked: boolean;
  configured: boolean;
  unlock: (code: string) => Promise<boolean>;
  lock: () => void;
};

const DocsAccessContext = createContext<DocsAccessContextValue | null>(null);

export function DocsAccessProvider({ children }: { children: ReactNode }) {
  // Always start locked — never SSR docs body.
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const configured = isDocsUnlockConfigured();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("code") ?? params.get("access_code");

    void (async () => {
      if (fromQuery && (await verifyDocsAccessCode(fromQuery))) {
        persistDocsAccessUnlocked();
        setUnlocked(true);
        params.delete("code");
        params.delete("access_code");
        const next = `${window.location.pathname}${
          params.toString() ? `?${params.toString()}` : ""
        }${window.location.hash}`;
        window.history.replaceState({}, "", next);
        setReady(true);
        return;
      }
      setUnlocked(readDocsAccessUnlocked());
      setReady(true);
    })();
  }, []);

  const unlock = useCallback(async (code: string) => {
    const ok = await verifyDocsAccessCode(code);
    if (!ok) return false;
    persistDocsAccessUnlocked();
    setUnlocked(true);
    return true;
  }, []);

  const lock = useCallback(() => {
    clearDocsAccessUnlocked();
    setUnlocked(false);
  }, []);

  const value = useMemo(
    () => ({ ready, unlocked, configured, unlock, lock }),
    [ready, unlocked, configured, unlock, lock],
  );

  return (
    <DocsAccessContext.Provider value={value}>
      {children}
    </DocsAccessContext.Provider>
  );
}

export function useDocsAccess(): DocsAccessContextValue {
  const ctx = useContext(DocsAccessContext);
  if (!ctx) {
    throw new Error("useDocsAccess must be used within DocsAccessProvider");
  }
  return ctx;
}
