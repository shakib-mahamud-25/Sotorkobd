"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Copy, Check, Download, MapPinned, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

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

    doc.setDrawColor(255, 255, 255, 0.3);
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
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white">
        <Check size={26} />
      </div>

      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          {t("receipt.title")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-soft">
          {t("receipt.subtitle")}
        </p>
      </div>

      <div className="rounded-2xl bg-ink px-6 py-8 text-white">
        <div className="text-xs uppercase tracking-wide text-white/60">
          {t("receipt.codeLabel")}
        </div>
        <div className="font-display mt-2 text-3xl font-semibold tracking-wider">
          {editCode}
        </div>
        <div className="mt-5 flex justify-center gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold transition-colors hover:bg-white/20"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? t("receipt.copied") : t("receipt.copy")}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold transition-colors hover:bg-white/20"
          >
            <Download size={14} />
            {t("receipt.download")}
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-amber/30 bg-amber/10 px-4 py-3 text-left">
        <ShieldAlert size={18} className="mt-0.5 flex-none text-amber" />
        <p className="text-xs leading-relaxed text-ink">{t("receipt.warning")}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => router.push("/map")}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
        >
          <MapPinned size={16} />
          {t("receipt.viewOnMap")}
        </button>
        <button
          onClick={() => router.push("/")}
          className="flex-1 rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink"
        >
          {t("receipt.done")}
        </button>
      </div>
    </div>
  );
}
