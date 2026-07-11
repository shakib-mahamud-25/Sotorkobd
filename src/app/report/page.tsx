"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { LocationStep, type LocationValue } from "@/components/report/LocationStep";
import { CategoryStep } from "@/components/report/CategoryStep";
import { SeverityStep } from "@/components/report/SeverityStep";
import { TimeDateStep } from "@/components/report/TimeDateStep";
import { DetailsStep } from "@/components/report/DetailsStep";
import { ReportReceipt } from "@/components/report/ReportReceipt";
import { getDeviceFingerprint } from "@/lib/fingerprint";
import type { TimeOfDay } from "@/types";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const TOTAL_STEPS = 5;

export default function ReportPage() {
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ editCode: string; reportId: string } | null>(null);

  // Form state
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [primaryCategory, setPrimaryCategory] = useState<string | null>(null);
  const [additionalCategories, setAdditionalCategories] = useState<string[]>([]);
  const [severity, setSeverity] = useState(3);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay | null>(null);
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [policeContacted, setPoliceContacted] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);

  function toggleAdditionalCategory(id: string) {
    setAdditionalCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function canProceed(): boolean {
    if (step === 1) return !!location;
    if (step === 2) return !!primaryCategory;
    return true;
  }

  async function handleSubmit() {
    if (!location || !primaryCategory) return;
    setSubmitting(true);
    setError(null);

    try {
      const fingerprint = await getDeviceFingerprint();

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          area_name: location.area_name,
          location_precision: location.location_precision,
          category_id: primaryCategory,
          additional_categories: additionalCategories,
          description: description || undefined,
          severity,
          time_of_day: timeOfDay ?? undefined,
          incident_date: incidentDate,
          police_contacted: policeContacted,
          fingerprint,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }

      // Upload photos, if any, now that we have a reportId
      if (photos.length > 0) {
        await Promise.all(
          photos.map((file) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("reportId", data.reportId);
            return fetch("/api/upload", { method: "POST", body: formData }).catch(
              () => null // don't block success on a photo failure
            );
          })
        );
      }

      setResult({ editCode: data.editCode, reportId: data.reportId });
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <ReportReceipt editCode={result.editCode} reportId={result.reportId} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          {t("report.title")}
        </h1>
        <p className="mt-2 text-sm text-text-soft">{t("report.subtitle")}</p>
      </div>

      {/* Progress */}
      <div className="mb-8 flex gap-1.5">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < step ? "bg-ink" : "bg-line"
            }`}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-paper-raised p-6 sm:p-8">
        {step === 1 && <LocationStep value={location} onChange={setLocation} />}
        {step === 2 && (
          <CategoryStep
            primaryCategory={primaryCategory}
            additionalCategories={additionalCategories}
            onPrimaryChange={setPrimaryCategory}
            onAdditionalToggle={toggleAdditionalCategory}
          />
        )}
        {step === 3 && <SeverityStep value={severity} onChange={setSeverity} />}
        {step === 4 && (
          <TimeDateStep
            timeOfDay={timeOfDay}
            incidentDate={incidentDate}
            onTimeChange={setTimeOfDay}
            onDateChange={setIncidentDate}
          />
        )}
        {step === 5 && (
          <DetailsStep
            description={description}
            policeContacted={policeContacted}
            photos={photos}
            onDescriptionChange={setDescription}
            onPoliceChange={setPoliceContacted}
            onPhotosChange={setPhotos}
          />
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-brick/10 px-3 py-2 text-sm text-brick">{error}</p>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="flex items-center gap-1 rounded-full px-4 py-2.5 text-sm font-medium text-text-soft disabled:opacity-0"
          >
            <ChevronLeft size={16} />
            Back
          </button>

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-1.5 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-full bg-amber px-6 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? t("report.submitting") : t("report.submit")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
