"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Download, X } from "lucide-react";

// Captures the browser's beforeinstallprompt event (Chrome/Edge/Android)
// and shows a small, dismissible banner instead of relying on the browser's
// own install UI, which is easy to miss and not visually consistent with
// the rest of the product. Safari/iOS doesn't fire this event at all — iOS
// install is via the Share sheet, which can't be triggered programmatically,
// so this component simply doesn't appear on iOS. That's an intentional gap,
// not a bug: promising an install button that does nothing on iOS would be
// worse than no button.
//
// Dismissal is remembered for the session only (sessionStorage, not
// localStorage) — deliberately not permanent, since someone who dismisses
// once during a first casual visit may want to install later. This avoids
// nagging on every single page load within one visit without ever
// permanently hiding it.

const DISMISS_KEY = "sotorko_install_dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const { t } = useI18n();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    // Result isn't branched on — whether accepted or dismissed, the browser
    // won't fire beforeinstallprompt again this session either way, so the
    // banner naturally goes away regardless of outcome.
    setVisible(false);
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[1000] border-t border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3.5 shadow-[var(--shadow-lg)] sm:bottom-4 sm:left-1/2 sm:right-auto sm:w-[420px] sm:-translate-x-1/2 sm:rounded-[var(--radius-lg)] sm:border">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
          <Download size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-[var(--color-primary)]">
            {t("install.title")}
          </div>
          <div className="text-xs text-[var(--color-text-secondary)]">
            {t("install.body")}
          </div>
        </div>
        <button
          onClick={handleInstall}
          className="flex-none rounded-full bg-[var(--color-primary)] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          {t("install.action")}
        </button>
        <button
          onClick={handleDismiss}
          aria-label={t("install.dismiss")}
          className="flex-none text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-secondary)]"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
