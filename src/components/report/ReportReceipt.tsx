"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Copy, Check, Download, MapPinned, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function ReportReceipt({
  editCode,
  reportId,
}: {
  editCode: string;
  reportId: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  void reportId;

  function handleCopy() {
    navigator.clipboard.writeText(editCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownload() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: [320, 420] });

    doc.setFillColor(15, 42, 61);
    doc.rect(0, 0, 320, 420, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("Sotorko", 30, 50);

    doc.setFontSize(11);
    doc.setTextColor(220, 220, 220);
    doc.text("Report receipt", 30, 75);

    doc.setDrawColor(255, 255, 255);
    doc.line(30, 95, 290, 95);

    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text("Your edit code", 30, 130);

    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text(editCode, 30, 160);

    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    const lines = doc.splitTextToSize(
      "Keep this code safe. It is the only way to edit or remove your report later. It cannot be recovered if lost.",
      260
    );
    doc.text(lines, 30, 195);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Submitted ${new Date().toLocaleDateString()}`, 30, 390);

    doc.save("sotorko-report-receipt.pdf");
  }

  return (
    <div className="mx-auto max-w-md space-y-6 text-center">
      <div
        className="animate-fade-in-up mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success)] text-white shadow-[var(--shadow-md)]"
        style={{ animationDelay: "0ms" }}
      >
        <Check size={28} strokeWidth={2.5} />
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "80ms" }}>
        <h1 className="text-display-sm text-[var(--color-primary)]">
          {t("receipt.title")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {t("receipt.subtitle")}
        </p>
      </div>

      <div
        className="animate-fade-in-up rounded-[var(--radius-xl)] bg-[var(--color-primary)] px-6 py-8 text-white shadow-[var(--shadow-lg)]"
        style={{ animationDelay: "160ms" }}
      >
        <div className="text-xs uppercase tracking-wide text-white/55">
          {t("receipt.codeLabel")}
        </div>
        <div className="text-display-sm mt-2 tracking-wider text-white">
          {editCode}
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold transition-all duration-[var(--duration-base)] hover:bg-white/20 active:scale-95"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? t("receipt.copied") : t("receipt.copy")}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold transition-all duration-[var(--duration-base)] hover:bg-white/20 active:scale-95"
          >
            <Download size={14} />
            {t("receipt.download")}
          </button>
        </div>
      </div>

      <div
        className="animate-fade-in-up flex items-start gap-2.5 rounded-[var(--radius-lg)] border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] px-4 py-3.5 text-left"
        style={{ animationDelay: "240ms" }}
      >
        <ShieldAlert size={18} className="mt-0.5 flex-none text-[var(--color-warning)]" />
        <p className="text-xs leading-relaxed text-[var(--color-text-primary)]">
          {t("receipt.warning")}
        </p>
      </div>

      <div
        className="animate-fade-in-up flex flex-col gap-3 sm:flex-row"
        style={{ animationDelay: "320ms" }}
      >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => router.push("/map")}
        >
          <MapPinned size={16} />
          {t("receipt.viewOnMap")}
        </Button>
        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={() => router.push("/")}
        >
          {t("receipt.done")}
        </Button>
      </div>
    </div>
  );
}
