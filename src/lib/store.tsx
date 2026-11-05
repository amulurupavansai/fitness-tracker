"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppData } from "./types";
import { defaultData, load, save } from "./storage";

interface Ctx {
  data: AppData;
  ready: boolean;
  saveFailed: boolean;
  update: (fn: (d: AppData) => AppData) => void;
  replace: (d: AppData) => void;
}
const StoreCtx = createContext<Ctx | null>(null);

export function applyTheme(theme: AppData["settings"]["theme"]) {
  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData);
  const [ready, setReady] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    setData(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    setSaveFailed(!save(data));
  }, [data, ready]);

  useEffect(() => {
    if (!ready) return;
    applyTheme(data.settings.theme);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const h = () => applyTheme(data.settings.theme);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [data.settings.theme, ready]);

  const update = useCallback((fn: (d: AppData) => AppData) => setData((d) => fn(d)), []);
  const replace = useCallback((d: AppData) => setData(d), []);
  const value = useMemo(() => ({ data, ready, saveFailed, update, replace }), [data, ready, saveFailed, update, replace]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}
