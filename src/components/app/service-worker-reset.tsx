"use client";

import { useEffect } from "react";

export function ServiceWorkerReset() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        Promise.all(registrations.map((registration) => registration.unregister())),
      )
      .then(() => {
        if ("caches" in window) {
          return caches
            .keys()
            .then((keys) => Promise.all(keys.map((key) => caches.delete(key))));
        }
        return null;
      })
      .catch(() => undefined);
  }, []);

  return null;
}
