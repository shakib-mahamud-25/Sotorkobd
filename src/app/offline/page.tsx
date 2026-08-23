"use client";

// The offline fallback route. Precached by the service worker (public/sw.js)
// and shown when a navigation fails with no cached page to fall back to.
//
// This is deliberately a static, self-contained page: it must render
// correctly from the service worker's cache with no network at all, so it
// cannot depend on useI18n()'s usual behavior of nothing extra — the i18n
// context itself has no network dependency (it's just localStorage +
// static translations), so this is safe to use normally here.
//
// Copy is honest about what's actually true: the map and report form need a
// live connection, this page says so plainly rather than implying the app
// works offline in some general sense.

import { useI18n } from "@/lib/i18n/context";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function OfflinePage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)]">
        <WifiOff size={24} />
      </div>
      <h1 className="text-display-sm mt-6 text-[var(--color-primary)]">
        {t("offline.title")}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {t("offline.body")}
      </p>
      <div className="mt-8">
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={16} />
          {t("offline.retry")}
        </Button>
      </div>
    </div>
  );
}
