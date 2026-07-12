"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { StatsStrip } from "@/components/StatsStrip";
import { Card } from "@/components/ui/Card";
import { MapPin, PenLine, Eye, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { t } = useI18n();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-primary)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Soft ambient glow — quiet, not flashy */}
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-accent), transparent 70%)" }}
        />

        <div className="relative mx-auto max-w-6xl px-5 py-24 sm:py-32">
          <div className="max-w-2xl">
            <span className="animate-fade-in-up inline-block rounded-full border border-white/15 px-3 py-1 text-xs font-medium tracking-wide text-white/65">
              ঢাকা · Dhaka
            </span>
            <h1
              className="text-display-lg animate-fade-in-up mt-6 text-white"
              style={{ animationDelay: "80ms" }}
            >
              {t("home.title")}
            </h1>
            <p
              className="animate-fade-in-up mt-6 max-w-xl text-lg leading-relaxed text-white/70"
              style={{ animationDelay: "160ms" }}
            >
              {t("home.subtitle")}
            </p>
            <div
              className="animate-fade-in-up mt-10 flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: "240ms" }}
            >
              <Link
                href="/map"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[var(--color-primary)] transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:shadow-[var(--shadow-lg)] active:scale-[0.98]"
              >
                <Eye size={18} className="transition-transform group-hover:scale-110" />
                {t("home.cta.map")}
              </Link>
              <Link
                href="/report"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:bg-[var(--color-accent-hover)] hover:shadow-[var(--shadow-lg)] active:scale-[0.98]"
              >
                <PenLine size={18} className="transition-transform group-hover:scale-110" />
                {t("home.cta.report")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-label text-[var(--color-text-muted)]">
          {t("home.stats.title")}
        </h2>
        <div className="mt-5">
          <StatsStrip />
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-display-sm text-[var(--color-primary)]">
            {t("home.howItWorks")}
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
            <Step
              icon={<MapPin size={20} />}
              step="01"
              title={t("home.step1.title")}
              body={t("home.step1.body")}
              delay={0}
            />
            <Step
              icon={<PenLine size={20} />}
              step="02"
              title={t("home.step2.title")}
              body={t("home.step2.body")}
              delay={90}
            />
            <Step
              icon={<Eye size={20} />}
              step="03"
              title={t("home.step3.title")}
              body={t("home.step3.body")}
              delay={180}
            />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Card
          interactive
          padding="lg"
          className="group flex items-center justify-between"
        >
          <Link href="/map" className="flex w-full items-center justify-between">
            <div>
              <div className="text-heading text-[var(--color-primary)]">
                {t("map.title")}
              </div>
              <div className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {t("home.cta.map")}
              </div>
            </div>
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[var(--color-surface-sunken)] text-[var(--color-primary)] transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] group-hover:bg-[var(--color-primary)] group-hover:text-white">
              <ArrowRight
                size={18}
                className="transition-transform duration-[var(--duration-base)] group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        </Card>
      </section>
    </div>
  );
}

function Step({
  icon,
  step,
  title,
  body,
  delay,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  body: string;
  delay: number;
}) {
  return (
    <div className="animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
          {icon}
        </div>
        <span className="text-xs font-semibold tracking-widest text-[var(--color-text-muted)]">
          {step}
        </span>
      </div>
      <h3 className="text-heading mt-4 text-[var(--color-primary)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {body}
      </p>
    </div>
  );
}
