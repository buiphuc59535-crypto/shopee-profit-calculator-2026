"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { useEffect, useLayoutEffect, useRef } from "react";
import { AuthProvider } from "@/contexts/auth-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange storageKey="mexo-theme">
      <ThemeBridge />
      <EmbedHeightBridge />
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}

function ThemeBridge() {
  const { setTheme } = useTheme();
  const lastAppliedTheme = useRef<string | null>(null);
  const initialUrlThemeApplied = useRef(false);
  const pendingThemeTimer = useRef<number | null>(null);
  const pendingTheme = useRef<string | null>(null);

  useLayoutEffect(() => {
    const isEmbed = (() => {
      try {
        return new URLSearchParams(window.location.search).get("mexo_embed") === "1";
      } catch {
        return false;
      }
    })();

    const applyThemeNow = (theme: "light" | "dark") => {
      const root = document.documentElement;
      if (lastAppliedTheme.current === theme && root.classList.contains(theme)) return;
      lastAppliedTheme.current = theme;
      lockThemePaint();
      markThemeChanging();
      root.classList.remove(theme === "dark" ? "light" : "dark");
      root.classList.add(theme);
      root.style.colorScheme = theme;
      if (!isEmbed) {
        try {
          localStorage.setItem("mexo-theme", theme);
          localStorage.setItem("theme", theme);
        } catch {}
        setTheme(theme);
      }
    };

    const applyTheme = (theme: string | null | undefined, immediate = false) => {
      if (theme !== "light" && theme !== "dark") return;
      pendingTheme.current = theme;
      if (immediate) {
        if (pendingThemeTimer.current !== null) {
          window.clearTimeout(pendingThemeTimer.current);
          pendingThemeTimer.current = null;
        }
        pendingTheme.current = null;
        applyThemeNow(theme);
        return;
      }
      if (pendingThemeTimer.current !== null) return;
      pendingThemeTimer.current = window.setTimeout(() => {
        pendingThemeTimer.current = null;
        const next = pendingTheme.current;
        pendingTheme.current = null;
        if (next === "light" || next === "dark") applyThemeNow(next);
      }, THEME_APPLY_DELAY_MS);
    };

    if (!initialUrlThemeApplied.current) {
      initialUrlThemeApplied.current = true;
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get("mexo_embed") === "1") {
          applyTheme(params.get("theme") || localStorage.getItem("mexo-theme") || localStorage.getItem("theme"), true);
        }
      } catch {}
    }

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== "mexo-theme") return;
      if (!isTrustedThemeOrigin(event.origin)) return;
      applyTheme(event.data.theme);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === "mexo-theme" || event.key === "theme") {
        applyTheme(event.newValue);
      }
    };

    window.addEventListener("message", onMessage);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("storage", onStorage);
      if (pendingThemeTimer.current !== null) {
        window.clearTimeout(pendingThemeTimer.current);
        pendingThemeTimer.current = null;
      }
    };
  }, [setTheme]);

  return null;
}

const THEME_LOCK_MS = 520;
const THEME_CHANGING_WINDOW_MS = 600;
const THEME_APPLY_DELAY_MS = 150;

function lockThemePaint() {
  const root = document.documentElement;
  root.classList.add("mexo-theme-lock");
  window.clearTimeout(Number(root.dataset.mexoThemeLockTimer || 0));
  const timer = window.setTimeout(() => {
    root.classList.remove("mexo-theme-lock");
    delete root.dataset.mexoThemeLockTimer;
  }, THEME_LOCK_MS);
  root.dataset.mexoThemeLockTimer = String(timer);
}

function markThemeChanging() {
  (window as unknown as { __mexoThemeChangingAt?: number }).__mexoThemeChangingAt = Date.now();
}

function isThemeChanging() {
  const at = (window as unknown as { __mexoThemeChangingAt?: number }).__mexoThemeChangingAt;
  return typeof at === "number" && Date.now() - at < THEME_CHANGING_WINDOW_MS;
}

function EmbedHeightBridge() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mexo_embed") !== "1") return;
    const targetOrigin = getParentOrigin();

    const postHeight = () => {
      if (isThemeChanging()) return;
      const main = document.querySelector("[data-mexo-embed-main]") || document.querySelector("main");
      const rect = main?.getBoundingClientRect();
      const contentBottom = rect ? rect.bottom + window.scrollY : document.body.getBoundingClientRect().bottom + window.scrollY;
      const height = Math.ceil(Math.max(contentBottom, 640) + 8);

      window.parent?.postMessage(
        {
          type: "mexo-calculator-height",
          height,
        },
        targetOrigin,
      );
    };

    document.documentElement.style.height = "auto";
    document.body.style.height = "auto";
    document.documentElement.style.minHeight = "0";
    document.body.style.minHeight = "0";
    document.body.style.margin = "0";
    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";

    const resizeObserver = new ResizeObserver(postHeight);
    resizeObserver.observe(document.body);

    postHeight();
    requestAnimationFrame(postHeight);
    const timers = [120, 250, 800, 1600, 2600, 4200, 7000].map((delay) => window.setTimeout(postHeight, delay));
    window.addEventListener("resize", postHeight);
    window.addEventListener("load", postHeight);
    window.addEventListener("input", postHeight, true);

    return () => {
      resizeObserver.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("resize", postHeight);
      window.removeEventListener("load", postHeight);
      window.removeEventListener("input", postHeight, true);
      document.documentElement.style.overflowX = "";
      document.body.style.overflowX = "";
      document.documentElement.style.height = "";
      document.body.style.height = "";
      document.documentElement.style.minHeight = "";
      document.body.style.minHeight = "";
      document.body.style.margin = "";
    };
  }, []);

  return null;
}

function getParentOrigin() {
  try {
    return document.referrer ? new URL(document.referrer).origin : "*";
  } catch {
    return "*";
  }
}

function isTrustedThemeOrigin(origin: string) {
  const parentOrigin = getParentOrigin();
  return (
    origin === window.location.origin ||
    (parentOrigin !== "*" && origin === parentOrigin) ||
    origin === "https://mexo.vn" ||
    origin === "https://www.mexo.vn"
  );
}
