"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import type { Attribution, EventName, Variant } from "@/lib/types";

const STORAGE_KEY = "pingback_attribution";
const SESSION_KEY = "pingback_session";

type AnalyticsValue = { attribution: Attribution; track: (event: EventName) => void };
const AnalyticsContext = createContext<AnalyticsValue | null>(null);

function getSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function buildAttribution(variant: Variant): Attribution {
  const params = new URLSearchParams(location.search);
  let stored: Partial<Attribution> = {};
  try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"); } catch { /* ignore corrupt storage */ }
  const pick = (key: string) => params.get(key) || (stored[key as keyof Attribution] as string | undefined) || undefined;
  const attribution: Attribution = {
    variant,
    session_id: getSessionId(),
    utm_source: pick("utm_source"), utm_medium: pick("utm_medium"),
    utm_campaign: pick("utm_campaign"), utm_content: pick("utm_content"), utm_term: pick("utm_term"),
    referrer: (stored.referrer as string | undefined) || document.referrer || undefined,
    landing_path: (stored.landing_path as string | undefined) || `${location.pathname}${location.search}`,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  return attribution;
}

export function AnalyticsProvider({ variant, children }: { variant: Variant; children: React.ReactNode }) {
  const attribution = useMemo(() => {
    if (typeof window === "undefined") return { variant, session_id: "pending" } as Attribution;
    return buildAttribution(variant);
  }, [variant]);

  const track = useCallback((event: EventName) => {
    if (attribution.session_id === "pending") return;
    const body = JSON.stringify({ event, ...attribution });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
    }
  }, [attribution]);

  const fired = useRef(false);
  useEffect(() => {
    if (!fired.current) { fired.current = true; track("landing_view"); }
  }, [track]);

  useEffect(() => {
    const thresholds = new Set<number>();
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const ratio = max > 0 ? scrollY / max : 1;
      if (ratio >= .5 && !thresholds.has(50)) { thresholds.add(50); track("scroll_50"); }
      if (ratio >= .9 && !thresholds.has(90)) { thresholds.add(90); track("scroll_90"); }
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => removeEventListener("scroll", onScroll);
  }, [track]);

  return <AnalyticsContext.Provider value={{ attribution, track }}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics() {
  const value = useContext(AnalyticsContext);
  if (!value) throw new Error("useAnalytics must be used within AnalyticsProvider");
  return value;
}
