"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/auth-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeBridge />
      <EmbedHeightBridge />
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}

function ThemeBridge() {
  const { setTheme } = useTheme();

  useEffect(() => {
    const applyTheme = (theme: string | null | undefined) => {
      if (theme === "light" || theme === "dark") {
        setTheme(theme);
      }
    };

    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mexo_embed") === "1") {
        applyTheme(params.get("theme") || localStorage.getItem("mexo-theme") || localStorage.getItem("theme"));
      }
    } catch {}

    const onMessage = (event: MessageEvent) => {
      const parentOrigin = getParentOrigin();
      if (event.origin !== window.location.origin && event.origin !== parentOrigin) return;
      if (event.data?.type === "mexo-theme") {
        applyTheme(event.data.theme);
      }
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
    };
  }, [setTheme]);

  return null;
}

function EmbedHeightBridge() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mexo_embed") !== "1") return;
    const targetOrigin = getParentOrigin();

    const postHeight = () => {
      const contentBottom = Array.from(document.body.children).reduce((bottom, element) => {
        const rect = element.getBoundingClientRect();
        return Math.max(bottom, rect.bottom + window.scrollY);
      }, 0);
      const height = Math.ceil(Math.max(contentBottom, 800) + 24);

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
    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";

    const resizeObserver = new ResizeObserver(postHeight);
    resizeObserver.observe(document.body);

    postHeight();
    requestAnimationFrame(postHeight);
    const timers = [250, 800, 1600, 2600, 4200].map((delay) => window.setTimeout(postHeight, delay));
    window.addEventListener("resize", postHeight);
    window.addEventListener("load", postHeight);
    window.addEventListener("input", postHeight, true);
    window.addEventListener("click", postHeight, true);

    return () => {
      resizeObserver.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("resize", postHeight);
      window.removeEventListener("load", postHeight);
      window.removeEventListener("input", postHeight, true);
      window.removeEventListener("click", postHeight, true);
      document.documentElement.style.overflowX = "";
      document.body.style.overflowX = "";
      document.documentElement.style.height = "";
      document.body.style.height = "";
      document.documentElement.style.minHeight = "";
      document.body.style.minHeight = "";
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
