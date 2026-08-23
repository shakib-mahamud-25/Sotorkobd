"use client";

import { useI18n } from "@/lib/i18n/context";
import { CRISIS_RESOURCES } from "@/lib/crisisResources";
import { Card } from "@/components/ui/Card";
import { Phone, ExternalLink } from "lucide-react";

// Deliberately calm per spec section 6: "The UI must NOT be alarmist. Do
// not turn every page into an emergency banner." This is a normal page in
// the site's normal layout — no red, no siren iconography, no full-screen
// takeover. Same Card/typography components used everywhere else in the
// app, so it reads as "part of Sotorko," not a bolted-on warning screen.
export default function ResourcesPage() {
  const { t, locale } = useI18n();

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:py-16">
      <h1 className="text-display-sm text-[var(--color-primary)]">
        {t("resources.title")}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {t("resources.intro")}
      </p>

      <div className="mt-8 space-y-3">
        {CRISIS_RESOURCES.map((resource) => (
          <Card key={resource.id} padding="md">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
              {locale === "bn" ? resource.name_bn : resource.name_en}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {locale === "bn" ? resource.description_bn : resource.description_en}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {resource.phone && (
                <a
                  href={`tel:${resource.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
                >
                  <Phone size={14} />
                  {resource.phone}
                </a>
              )}
              {resource.url && (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-secondary)] hover:text-[var(--color-primary)]"
                >
                  {t("resources.visitWebsite")}
                  <ExternalLink size={13} />
                </a>
              )}
              <span className="text-xs text-[var(--color-text-muted)]">
                {locale === "bn" ? resource.availability_bn : resource.availability_en}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-xs leading-relaxed text-[var(--color-text-muted)]">
        {t("resources.disclaimer")}
      </p>
    </div>
  );
}
