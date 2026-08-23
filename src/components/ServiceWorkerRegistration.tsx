"use client";

import { useEffect } from "react";

// Registers the service worker (public/sw.js) on mount. Client-only —
// service workers have no meaning during SSR. Registration failure is
// swallowed intentionally: a PWA install/offline capability that fails to
// register should never break the normal web experience, which works fine
// without a service worker at all. This mirrors how the rest of the app
// treats progressive enhancement (e.g. photo uploads failing silently in
// report/page.tsx's Promise.all().catch()).
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("Service worker registration failed:", err);
    });
  }, []);

  return null;
}
