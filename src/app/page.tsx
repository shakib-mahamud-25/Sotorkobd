"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { StatsStrip } from "@/components/StatsStrip";
import { MapPin, PenLine, Eye, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { t } = useI18n();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line bg-ink">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full border border-white/20 px-3 py-1 text-xs font-medium tracking-wide text-white/70">
              ঢাকা · Dhaka
            </span>
            <h1 className="font-display mt-5 text-4xl font-semibold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
              {t("home.title")}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
              {t("home.subtitle")}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/map"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
              >
                <Eye size={18} />
                {t("home.cta.map")}
              </Link>
              <Link
                href="/report"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-amber px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              >
                <PenLine size={18} />
                {t("home.cta.report")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-text-soft">
          {t("home.stats.title")}
        </h2>
        <div className="mt-5">
          <StatsStrip />
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-line bg-paper-raised">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            {t("home.howItWorks")}
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <Step
              icon={<MapPin size={22} />}
              title={t("home.step1.title")}
              body={t("home.step1.body")}
            />
            <Step
              icon={<PenLine size={22} />}
              title={t("home.step2.title")}
              body={t("home.step2.body")}
            />
            <Step
              icon={<Eye size={22} />}
              title={t("home.step3.title")}
              body={t("home.step3.body")}
            />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <Link
          href="/map"
          className="group flex items-center justify-between rounded-2xl border border-line bg-paper-raised px-8 py-8 transition-colors hover:border-ink"
        >
          <div>
            <div className="font-display text-xl font-semibold text-ink">
              {t("map.title")}
            </div>
            <div className="mt-1 text-sm text-text-soft">
              {t("home.cta.map")}
            </div>
          </div>
          <ArrowRight
            size={22}
            className="text-ink transition-transform group-hover:translate-x-1"
          />
        </Link>
      </section>
    </div>
  );
}

function Step({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white">
        {icon}
      </div>
      <h3 className="font-display mt-4 text-lg font-semibold text-ink">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-text-soft">{body}</p>
    </div>
  );
}
